import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Meeting, StudyGroup } from "@shared/schema";
import MeetingCard from "@/components/meeting-card";
import ScheduleMeetingDialog from "@/components/schedule-meeting-dialog";
import { Loader2 } from "lucide-react";

export default function MeetingsPage() {
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);

  const { data: meetings, isLoading: isLoadingMeetings } = useQuery<Meeting[]>({
    queryKey: ["/api/meetings"],
  });

  const { data: groups } = useQuery<StudyGroup[]>({
    queryKey: ["/api/groups/my"],
  });

  // Format date to display
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric' 
    });
  };

  // Get group name by id
  const getGroupName = (groupId: number): string => {
    const group = groups?.find(g => g.id === groupId);
    return group ? group.name : "Unknown Group";
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold">Schedule <span className="text-primary">Study Meetings</span></h2>
        <p className="text-gray-600 mt-2">Plan and organize study sessions.</p>
      </div>
      
      <div className="mb-6 flex justify-end">
        <Button 
          onClick={() => setIsScheduleDialogOpen(true)}
          className="bg-primary hover:bg-primary/90"
        >
          <Plus className="h-5 w-5 mr-2" />
          Schedule Meeting
        </Button>
      </div>
      
      {/* Upcoming Meetings */}
      <div>
        <h3 className="text-xl font-semibold mb-4">Upcoming Meetings</h3>
        
        {isLoadingMeetings ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : meetings && meetings.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {meetings.map(meeting => (
              <MeetingCard
                key={meeting.id}
                title={meeting.title}
                date={formatDate(meeting.date)}
                time={meeting.time}
                groupName={getGroupName(meeting.groupId)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 bg-white rounded-lg shadow-sm">
            <p className="text-gray-500">No upcoming meetings scheduled</p>
          </div>
        )}
      </div>
      
      <ScheduleMeetingDialog 
        open={isScheduleDialogOpen}
        onOpenChange={setIsScheduleDialogOpen}
        groups={groups || []}
      />
    </div>
  );
}
