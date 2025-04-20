import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { insertStudyGroupSchema, insertMeetingSchema, insertNoteSchema, insertMessageSchema, insertGroupMemberSchema } from "@shared/schema";
import { z } from "zod";

interface WebSocketMessage {
  type: string;
  groupId: number;
  data: any;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes
  setupAuth(app);
  
  const httpServer = createServer(app);
  
  // WebSocket server setup
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  wss.on('connection', (ws) => {
    ws.on('message', async (message) => {
      try {
        const parsedMessage: WebSocketMessage = JSON.parse(message.toString());
        
        if (parsedMessage.type === 'chat_message' && 
            parsedMessage.groupId && 
            parsedMessage.data.userId && 
            parsedMessage.data.content) {
          
          // Store message in database
          const newMessage = await storage.createMessage({
            content: parsedMessage.data.content,
            groupId: parsedMessage.data.groupId,
            userId: parsedMessage.data.userId
          });
          
          // Broadcast message to all connected clients
          wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify({
                type: 'new_message',
                data: newMessage
              }));
            }
          });
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });
  });
  
  // Study Groups API
  app.get('/api/groups', async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const groups = await storage.getStudyGroups();
    
    // Add member count to each group
    const groupsWithMemberCount = await Promise.all(groups.map(async (group) => {
      const memberCount = await storage.getGroupMembershipCount(group.id);
      return { ...group, memberCount };
    }));
    
    res.json(groupsWithMemberCount);
  });
  
  app.get('/api/groups/my', async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const myGroups = await storage.getStudyGroupsByUserId(req.user!.id);
    
    // Add member count to each group
    const groupsWithMemberCount = await Promise.all(myGroups.map(async (group) => {
      const memberCount = await storage.getGroupMembershipCount(group.id);
      return { ...group, memberCount };
    }));
    
    res.json(groupsWithMemberCount);
  });
  
  app.post('/api/groups', async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const parsedData = insertStudyGroupSchema.parse({
        ...req.body,
        createdBy: req.user!.id
      });
      
      const newGroup = await storage.createStudyGroup(parsedData);
      
      // Add creator as a member of the group
      await storage.addGroupMember({
        groupId: newGroup.id,
        userId: req.user!.id
      });
      
      res.status(201).json(newGroup);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: 'Failed to create study group' });
    }
  });
  
  app.post('/api/groups/:id/join', async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const groupId = parseInt(req.params.id);
    if (isNaN(groupId)) return res.status(400).json({ error: 'Invalid group ID' });
    
    try {
      const group = await storage.getStudyGroupById(groupId);
      if (!group) return res.status(404).json({ error: 'Group not found' });
      
      const isAlreadyMember = await storage.isUserInGroup(req.user!.id, groupId);
      if (isAlreadyMember) return res.status(400).json({ error: 'Already a member of this group' });
      
      const parsedData = insertGroupMemberSchema.parse({
        groupId,
        userId: req.user!.id
      });
      
      const membership = await storage.addGroupMember(parsedData);
      res.status(201).json(membership);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: 'Failed to join study group' });
    }
  });
  
  // Meetings API
  app.get('/api/meetings', async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const meetings = await storage.getMeetings();
    res.json(meetings);
  });
  
  app.post('/api/meetings', async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const parsedData = insertMeetingSchema.parse({
        ...req.body,
        createdBy: req.user!.id
      });
      
      // Verify user is a member of the group
      const isGroupMember = await storage.isUserInGroup(req.user!.id, parsedData.groupId);
      if (!isGroupMember) return res.status(403).json({ error: 'You must be a member of the group to schedule a meeting' });
      
      const newMeeting = await storage.createMeeting(parsedData);
      res.status(201).json(newMeeting);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: 'Failed to create meeting' });
    }
  });
  
  // Notes API
  app.get('/api/notes', async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const notes = await storage.getNotes();
    res.json(notes);
  });
  
  app.post('/api/notes', async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const parsedData = insertNoteSchema.parse({
        ...req.body,
        uploadedBy: req.user!.id
      });
      
      // Verify user is a member of the group
      const isGroupMember = await storage.isUserInGroup(req.user!.id, parsedData.groupId);
      if (!isGroupMember) return res.status(403).json({ error: 'You must be a member of the group to upload notes' });
      
      const newNote = await storage.createNote(parsedData);
      res.status(201).json(newNote);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: 'Failed to upload note' });
    }
  });
  
  // Chat messages API
  app.get('/api/groups/:id/messages', async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const groupId = parseInt(req.params.id);
    if (isNaN(groupId)) return res.status(400).json({ error: 'Invalid group ID' });
    
    try {
      // Verify user is a member of the group
      const isGroupMember = await storage.isUserInGroup(req.user!.id, groupId);
      if (!isGroupMember) return res.status(403).json({ error: 'You must be a member of the group to access messages' });
      
      const messages = await storage.getMessagesByGroupId(groupId);
      
      // Get user details for each message
      const messagesWithUser = await Promise.all(messages.map(async (message) => {
        const user = await storage.getUser(message.userId);
        return {
          ...message,
          user: user ? { id: user.id, name: user.name, username: user.username } : null
        };
      }));
      
      res.json(messagesWithUser);
    } catch (error) {
      res.status(500).json({ error: 'Failed to retrieve messages' });
    }
  });

  return httpServer;
}
