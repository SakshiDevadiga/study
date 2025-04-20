import { useAuth } from "@/hooks/use-auth";
import HeroSection from "@/components/hero-section";
import FeatureSection from "@/components/feature-section";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

export default function HomePage() {
  const { user } = useAuth();
  const [, navigate] = useLocation();

  return (
    <div className="flex flex-col">
      <HeroSection />
      <FeatureSection />
      
      <div className="py-12 bg-[#f0fdf4]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Get Started?</h2>
          <p className="max-w-2xl mx-auto text-gray-600 mb-8">
            Join study groups, schedule meetings, and start collaborating with fellow students.
          </p>
          <div className="flex justify-center space-x-4">
            <Button 
              onClick={() => navigate("/groups")} 
              className="bg-primary hover:bg-primary/90"
            >
              Explore Groups
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
