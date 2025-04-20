import { 
  users, type User, type InsertUser,
  studyGroups, type StudyGroup, type InsertStudyGroup,
  groupMembers, type GroupMember, type InsertGroupMember,
  meetings, type Meeting, type InsertMeeting,
  notes, type Note, type InsertNote,
  messages, type Message, type InsertMessage
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Study Group operations
  createStudyGroup(group: InsertStudyGroup): Promise<StudyGroup>;
  getStudyGroups(): Promise<StudyGroup[]>;
  getStudyGroupById(id: number): Promise<StudyGroup | undefined>;
  getStudyGroupsByUserId(userId: number): Promise<StudyGroup[]>;
  
  // Group Members operations
  addGroupMember(member: InsertGroupMember): Promise<GroupMember>;
  getGroupMembers(groupId: number): Promise<GroupMember[]>;
  isUserInGroup(userId: number, groupId: number): Promise<boolean>;
  getGroupMembershipCount(groupId: number): Promise<number>;
  
  // Meetings operations
  createMeeting(meeting: InsertMeeting): Promise<Meeting>;
  getMeetings(): Promise<Meeting[]>;
  getMeetingsByGroupId(groupId: number): Promise<Meeting[]>;
  
  // Notes operations
  createNote(note: InsertNote): Promise<Note>;
  getNotes(): Promise<Note[]>;
  getNotesByGroupId(groupId: number): Promise<Note[]>;
  
  // Messages operations
  createMessage(message: InsertMessage): Promise<Message>;
  getMessagesByGroupId(groupId: number): Promise<Message[]>;
  
  // Session store
  sessionStore: session.SessionStore;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private studyGroups: Map<number, StudyGroup>;
  private groupMembers: Map<number, GroupMember>;
  private meetings: Map<number, Meeting>;
  private notes: Map<number, Note>;
  private messages: Map<number, Message>;
  
  sessionStore: session.SessionStore;
  
  private userIdCounter: number;
  private groupIdCounter: number;
  private memberIdCounter: number;
  private meetingIdCounter: number;
  private noteIdCounter: number;
  private messageIdCounter: number;

  constructor() {
    this.users = new Map();
    this.studyGroups = new Map();
    this.groupMembers = new Map();
    this.meetings = new Map();
    this.notes = new Map();
    this.messages = new Map();
    
    this.userIdCounter = 1;
    this.groupIdCounter = 1;
    this.memberIdCounter = 1;
    this.meetingIdCounter = 1;
    this.noteIdCounter = 1;
    this.messageIdCounter = 1;
    
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // 24 hours
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const createdAt = new Date();
    const user: User = { ...insertUser, id, createdAt };
    this.users.set(id, user);
    return user;
  }
  
  // Study Group operations
  async createStudyGroup(insertGroup: InsertStudyGroup): Promise<StudyGroup> {
    const id = this.groupIdCounter++;
    const createdAt = new Date();
    const isActive = true;
    const group: StudyGroup = { ...insertGroup, id, createdAt, isActive };
    this.studyGroups.set(id, group);
    return group;
  }
  
  async getStudyGroups(): Promise<StudyGroup[]> {
    return Array.from(this.studyGroups.values());
  }
  
  async getStudyGroupById(id: number): Promise<StudyGroup | undefined> {
    return this.studyGroups.get(id);
  }
  
  async getStudyGroupsByUserId(userId: number): Promise<StudyGroup[]> {
    const memberships = Array.from(this.groupMembers.values())
      .filter(member => member.userId === userId)
      .map(member => member.groupId);
    
    return Array.from(this.studyGroups.values())
      .filter(group => memberships.includes(group.id) || group.createdBy === userId);
  }
  
  // Group Members operations
  async addGroupMember(insertMember: InsertGroupMember): Promise<GroupMember> {
    const id = this.memberIdCounter++;
    const joinedAt = new Date();
    const member: GroupMember = { ...insertMember, id, joinedAt };
    this.groupMembers.set(id, member);
    return member;
  }
  
  async getGroupMembers(groupId: number): Promise<GroupMember[]> {
    return Array.from(this.groupMembers.values())
      .filter(member => member.groupId === groupId);
  }
  
  async isUserInGroup(userId: number, groupId: number): Promise<boolean> {
    const members = await this.getGroupMembers(groupId);
    return members.some(member => member.userId === userId);
  }
  
  async getGroupMembershipCount(groupId: number): Promise<number> {
    const members = await this.getGroupMembers(groupId);
    return members.length;
  }
  
  // Meetings operations
  async createMeeting(insertMeeting: InsertMeeting): Promise<Meeting> {
    const id = this.meetingIdCounter++;
    const createdAt = new Date();
    const meeting: Meeting = { ...insertMeeting, id, createdAt };
    this.meetings.set(id, meeting);
    return meeting;
  }
  
  async getMeetings(): Promise<Meeting[]> {
    return Array.from(this.meetings.values());
  }
  
  async getMeetingsByGroupId(groupId: number): Promise<Meeting[]> {
    return Array.from(this.meetings.values())
      .filter(meeting => meeting.groupId === groupId);
  }
  
  // Notes operations
  async createNote(insertNote: InsertNote): Promise<Note> {
    const id = this.noteIdCounter++;
    const uploadedAt = new Date();
    const note: Note = { ...insertNote, id, uploadedAt };
    this.notes.set(id, note);
    return note;
  }
  
  async getNotes(): Promise<Note[]> {
    return Array.from(this.notes.values());
  }
  
  async getNotesByGroupId(groupId: number): Promise<Note[]> {
    return Array.from(this.notes.values())
      .filter(note => note.groupId === groupId);
  }
  
  // Messages operations
  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const id = this.messageIdCounter++;
    const sentAt = new Date();
    const message: Message = { ...insertMessage, id, sentAt };
    this.messages.set(id, message);
    return message;
  }
  
  async getMessagesByGroupId(groupId: number): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter(message => message.groupId === groupId)
      .sort((a, b) => a.sentAt.getTime() - b.sentAt.getTime());
  }
}

export const storage = new MemStorage();
