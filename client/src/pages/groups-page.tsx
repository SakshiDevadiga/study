import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { StudyGroup } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Search, Plus } from "lucide-react";
import GroupCard from "@/components/group-card";
import CreateGroupDialog from "@/components/create-group-dialog";
import { useToast } from "@/hooks/use-toast";

export default function GroupsPage() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);
  const { toast } = useToast();

  const { 
    data: allGroups, 
    isLoading: isLoadingGroups 
  } = useQuery<StudyGroup[]>({
    queryKey: ["/api/groups"],
  });

  const { 
    data: myGroups, 
    isLoading: isLoadingMyGroups 
  } = useQuery<StudyGroup[]>({
    queryKey: ["/api/groups/my"],
  });

  const joinGroupMutation = useMutation({
    mutationFn: async (groupId: number) => {
      const res = await apiRequest("POST", `/api/groups/${groupId}/join`);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/groups"] });
      queryClient.invalidateQueries({ queryKey: ["/api/groups/my"] });
      toast({
        title: "Joined group",
        description: "You've successfully joined the group.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to join group",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Filter groups based on search term
  const filteredGroups = allGroups?.filter(group => 
    group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    group.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Filter my groups based on search term
  const filteredMyGroups = myGroups?.filter(group => 
    group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    group.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Check if user is in a group
  const isUserInGroup = (group: StudyGroup) => {
    return myGroups?.some(myGroup => myGroup.id === group.id) || false;
  };

  const handleJoinGroup = (groupId: number) => {
    joinGroupMutation.mutate(groupId);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold">Manage Your <span className="text-primary">Study Groups</span></h2>
        <p className="text-gray-600 mt-2">Create and organize study groups easily.</p>
      </div>
      
      <div className="mb-6 flex flex-col sm:flex-row justify-between gap-4">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input 
            type="text" 
            placeholder="Search groups..." 
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <Button 
          onClick={() => setIsCreateGroupOpen(true)}
          className="bg-primary hover:bg-primary/90"
        >
          <Plus className="h-5 w-5 mr-2" />
          Create Group
        </Button>
      </div>
      
      {/* Available Study Groups */}
      <div className="mb-10">
        <h3 className="text-xl font-semibold mb-4">Available Study Groups</h3>
        
        {isLoadingGroups ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredGroups && filteredGroups.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredGroups.map(group => (
              <GroupCard 
                key={group.id}
                group={group}
                isMember={isUserInGroup(group)}
                onJoin={() => handleJoinGroup(group.id)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 bg-white rounded-lg shadow-sm">
            <p className="text-gray-500">No study groups available</p>
          </div>
        )}
      </div>
      
      {/* My Groups Section */}
      <div>
        <h3 className="text-xl font-semibold mb-4">My Groups</h3>
        
        {isLoadingMyGroups ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredMyGroups && filteredMyGroups.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredMyGroups.map(group => (
              <GroupCard 
                key={group.id}
                group={group}
                isMember={true}
                isOwner={group.createdBy === user?.id}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 bg-white rounded-lg shadow-sm">
            <p className="text-gray-500">You haven't joined any groups yet</p>
          </div>
        )}
      </div>
      
      <CreateGroupDialog 
        open={isCreateGroupOpen}
        onOpenChange={setIsCreateGroupOpen}
      />
    </div>
  );
}
