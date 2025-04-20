import { CalendarDays, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface MeetingCardProps {
  title: string;
  date: string;
  time: string;
  groupName: string;
}

export default function MeetingCard({ 
  title, 
  date, 
  time, 
  groupName 
}: MeetingCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-sm text-gray-500 mb-2">{groupName}</p>
        <div className="flex items-center text-gray-500 mb-3">
          <CalendarDays className="h-5 w-5 mr-2" />
          <span>Date: {date}</span>
        </div>
        <div className="flex items-center text-gray-500 mb-4">
          <Clock className="h-5 w-5 mr-2" />
          <span>Time: {time}</span>
        </div>
        <Button className="w-full bg-primary hover:bg-primary/90">
          Join Meeting
        </Button>
      </CardContent>
    </Card>
  );
}
