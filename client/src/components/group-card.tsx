import { StudyGroup } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface GroupCardProps {
  group: StudyGroup;
  isMember: boolean;
  isOwner?: boolean;
  onJoin?: () => void;
}

export default function GroupCard({ group, isMember, isOwner = false, onJoin }: GroupCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold mb-2">{group.name}</h3>
        <p className="text-gray-500 text-sm mb-4">{group.description}</p>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500">
            Members: {group.memberCount || 0} | Active
          </span>
          {isMember ? (
            <Button 
              variant="outline" 
              className="text-primary border-primary hover:bg-primary/10"
            >
              {isOwner ? "Manage" : "View"}
            </Button>
          ) : (
            <Button 
              className="bg-primary hover:bg-primary/90"
              onClick={onJoin}
            >
              Join
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
