import { FileText, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface NoteCardProps {
  title: string;
  fileType: string;
  uploadDate: string;
  groupName: string;
  fileUrl: string;
}

export default function NoteCard({ 
  title, 
  fileType, 
  uploadDate, 
  groupName,
  fileUrl 
}: NoteCardProps) {
  const handleDownload = () => {
    // Create a temporary download link
    const link = document.createElement('a');
    link.href = fileUrl;
    link.setAttribute('download', `${title}.${fileType.toLowerCase()}`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-sm text-gray-500 mb-2">{groupName}</p>
        <div className="flex items-center text-gray-500 mb-3">
          <FileText className="h-5 w-5 mr-2" />
          <span>{fileType.toUpperCase()}</span>
        </div>
        <div className="flex items-center text-gray-500 mb-4">
          <Calendar className="h-5 w-5 mr-2" />
          <span>Uploaded: {uploadDate}</span>
        </div>
        <Button 
          className="w-full bg-primary hover:bg-primary/90"
          onClick={handleDownload}
        >
          Download
        </Button>
      </CardContent>
    </Card>
  );
}
