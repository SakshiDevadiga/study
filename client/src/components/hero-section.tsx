import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

export default function HeroSection() {
  const [, navigate] = useLocation();
  
  return (
    <div className="bg-[#f0fdf4] py-12 lg:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Study Together, <span className="text-primary">Achieve More</span>
          </h2>
          <p className="max-w-2xl mx-auto text-gray-600 text-lg mb-8">
            Join StudyMate to collaborate with fellow students, schedule study sessions, share notes, and achieve your academic goals together.
          </p>
          <div className="flex justify-center space-x-4">
            <Button 
              onClick={() => navigate("/groups")}
              className="bg-primary hover:bg-primary/90"
            >
              Join Study Groups
            </Button>
            <Button 
              onClick={() => navigate("/meetings")}
              variant="outline" 
              className="border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Schedule Meetings
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
