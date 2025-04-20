import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Search, Loader2 } from "lucide-react";
import { Note, StudyGroup } from "@shared/schema";
import NoteCard from "@/components/note-card";
import UploadNoteDialog from "@/components/upload-note-dialog";

export default function NotesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  
  const { data: notes, isLoading: isLoadingNotes } = useQuery<Note[]>({
    queryKey: ["/api/notes"],
  });
  
  const { data: groups } = useQuery<StudyGroup[]>({
    queryKey: ["/api/groups/my"],
  });
  
  // Filter notes based on search term
  const filteredNotes = notes?.filter(note => 
    note.title.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Format date for display
  const formatDate = (date: Date): string => {
    return new Date(date).toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short'
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
        <h2 className="text-2xl font-bold">Share and Access <span className="text-primary">Study Notes</span></h2>
        <p className="text-gray-600 mt-2">Upload and download materials easily.</p>
      </div>
      
      <div className="mb-6 flex flex-col sm:flex-row justify-between gap-4">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input 
            type="text" 
            placeholder="Search notes..." 
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <Button 
          onClick={() => setIsUploadDialogOpen(true)}
          className="bg-primary hover:bg-primary/90"
        >
          <Plus className="h-5 w-5 mr-2" />
          Upload Notes
        </Button>
      </div>
      
      {/* Notes Cards */}
      {isLoadingNotes ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filteredNotes && filteredNotes.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredNotes.map(note => (
            <NoteCard
              key={note.id}
              title={note.title}
              fileType={note.fileType}
              uploadDate={formatDate(note.uploadedAt)}
              groupName={getGroupName(note.groupId)}
              fileUrl={note.fileUrl}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-8 bg-white rounded-lg shadow-sm">
          <p className="text-gray-500">No study notes available</p>
        </div>
      )}
      
      <UploadNoteDialog 
        open={isUploadDialogOpen}
        onOpenChange={setIsUploadDialogOpen}
        groups={groups || []}
      />
    </div>
  );
}
