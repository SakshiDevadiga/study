import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useWebSocket } from "@/hooks/use-websocket";
import { StudyGroup, Message } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { format } from "date-fns";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface MessageWithUser extends Message {
  user: {
    id: number;
    name: string;
    username: string;
  } | null;
}

export default function ChatPage() {
  const { user } = useAuth();
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [chatMessages, setChatMessages] = useState<MessageWithUser[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { data: groups, isLoading: isLoadingGroups } = useQuery<StudyGroup[]>({
    queryKey: ["/api/groups/my"],
    onSuccess: (data) => {
      if (data.length > 0 && !selectedGroupId) {
        setSelectedGroupId(data[0].id);
      }
    },
  });
  
  const { 
    data: messages, 
    isLoading: isLoadingMessages 
  } = useQuery<MessageWithUser[]>({
    queryKey: ["/api/groups", selectedGroupId, "messages"],
    enabled: !!selectedGroupId,
    onSuccess: (data) => {
      setChatMessages(data);
    },
  });
  
  // WebSocket setup
  const { socket, isConnected, error: wsError } = useWebSocket();
  
  useEffect(() => {
    if (socket && isConnected) {
      socket.addEventListener("message", (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === "new_message") {
            // Add the new message to our state
            setChatMessages(prevMessages => [...prevMessages, data.data]);
          }
        } catch (error) {
          console.error("Error parsing WebSocket message:", error);
        }
      });
    }
    
    return () => {
      if (socket) {
        socket.removeEventListener("message", () => {});
      }
    };
  }, [socket, isConnected]);
  
  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);
  
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim() || !selectedGroupId || !socket || !isConnected || !user) return;
    
    // Send message via WebSocket
    socket.send(JSON.stringify({
      type: "chat_message",
      groupId: selectedGroupId,
      data: {
        content: message,
        groupId: selectedGroupId,
        userId: user.id
      }
    }));
    
    setMessage("");
  };
  
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };
  
  const getRandomColor = (id: number) => {
    const colors = [
      "bg-blue-500", 
      "bg-green-500", 
      "bg-purple-500", 
      "bg-yellow-500", 
      "bg-pink-500", 
      "bg-indigo-500"
    ];
    return colors[id % colors.length];
  };
  
  const selectedGroup = groups?.find(g => g.id === selectedGroupId);
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold">Group <span className="text-primary">Chat</span></h2>
        <p className="text-gray-600 mt-2">Communicate with your study group in real time.</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Chat Groups Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="p-4 border-b">
              <h3 className="font-medium">My Groups</h3>
            </div>
            
            {isLoadingGroups ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : groups && groups.length > 0 ? (
              <div className="overflow-y-auto max-h-[500px]">
                <ul className="divide-y divide-gray-200">
                  {groups.map(group => (
                    <li 
                      key={group.id}
                      className={`p-4 hover:bg-gray-50 cursor-pointer ${selectedGroupId === group.id ? 'bg-[#bbf7d0]' : ''}`}
                      onClick={() => setSelectedGroupId(group.id)}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`flex-shrink-0 h-10 w-10 rounded-full ${selectedGroupId === group.id ? 'bg-primary' : 'bg-gray-400'} flex items-center justify-center text-white font-medium`}>
                          {group.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{group.name}</p>
                          <p className="text-sm text-gray-500 truncate">
                            {group.memberCount || 0} members
                          </p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="p-4 text-center text-gray-500">
                No groups joined yet
              </div>
            )}
          </div>
        </div>
        
        {/* Chat Area */}
        <div className="lg:col-span-3">
          {selectedGroupId && selectedGroup ? (
            <div className="bg-white rounded-lg shadow-sm overflow-hidden flex flex-col h-[600px]">
              {/* Chat Header */}
              <div className="p-4 border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary flex items-center justify-center text-white font-medium">
                      {selectedGroup.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-medium">{selectedGroup.name}</h3>
                      <p className="text-sm text-gray-500">
                        {selectedGroup.memberCount || 0} members
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Chat Messages */}
              <div className="flex-grow p-4 overflow-y-auto space-y-4 bg-[#f0fdf4]">
                {isLoadingMessages ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : chatMessages && chatMessages.length > 0 ? (
                  <>
                    {chatMessages.map((msg, index) => (
                      <div 
                        key={index}
                        className={`flex items-start ${msg.userId === user?.id ? 'justify-end' : ''}`}
                      >
                        {msg.userId !== user?.id && (
                          <div className="flex-shrink-0 mr-3">
                            <Avatar>
                              <AvatarFallback className={getRandomColor(msg.userId)}>
                                {msg.user ? getInitials(msg.user.name) : "?"}
                              </AvatarFallback>
                            </Avatar>
                          </div>
                        )}
                        <div className={msg.userId === user?.id ? 'text-right' : ''}>
                          <div className="flex items-center">
                            {msg.userId !== user?.id && (
                              <p className="font-medium text-sm mr-2">
                                {msg.user ? msg.user.name : "Unknown User"}
                              </p>
                            )}
                            <span className={`text-xs text-gray-500 ${msg.userId === user?.id ? 'mr-2' : 'ml-2'}`}>
                              {format(new Date(msg.sentAt), 'h:mm a')}
                            </span>
                            {msg.userId === user?.id && (
                              <p className="font-medium text-sm">You</p>
                            )}
                          </div>
                          <div className={`mt-1 ${
                            msg.userId === user?.id 
                              ? 'bg-[#bbf7d0] text-right' 
                              : 'bg-white'
                            } p-3 rounded-lg shadow-sm inline-block max-w-xs sm:max-w-md`}
                          >
                            <p className="text-sm">{msg.content}</p>
                          </div>
                        </div>
                        {msg.userId === user?.id && (
                          <div className="flex-shrink-0 ml-3">
                            <Avatar>
                              <AvatarFallback className="bg-primary">
                                {user ? getInitials(user.name) : "?"}
                              </AvatarFallback>
                            </Avatar>
                          </div>
                        )}
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-gray-500">No messages yet. Start the conversation!</p>
                  </div>
                )}
              </div>
              
              {/* Message Input */}
              <div className="p-4 border-t">
                <form className="flex space-x-2" onSubmit={handleSendMessage}>
                  <Input 
                    type="text" 
                    placeholder="Type a message..." 
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="flex-grow"
                  />
                  <Button 
                    type="submit" 
                    className="bg-primary hover:bg-primary/90"
                    disabled={!isConnected || !message.trim()}
                  >
                    Send
                  </Button>
                </form>
                {!isConnected && !wsError && (
                  <p className="text-xs text-amber-600 mt-1">Connecting to chat server...</p>
                )}
                {wsError && (
                  <p className="text-xs text-red-600 mt-1">Chat connection error: {wsError}</p>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm p-8 flex items-center justify-center h-[600px]">
              <div className="text-center">
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Group Selected</h3>
                <p className="text-gray-500">Select a group from the sidebar to start chatting</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
