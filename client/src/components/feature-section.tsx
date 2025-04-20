import { Users, CalendarDays, BookOpen, MessageSquare } from "lucide-react";

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className="bg-[#f0fdf4] rounded-lg p-6 shadow-sm">
      <div className="flex justify-center mb-4">
        <div className="p-2 rounded-full bg-[#bbf7d0]">
          {icon}
        </div>
      </div>
      <h3 className="text-center text-lg font-semibold mb-2">{title}</h3>
      <p className="text-center text-gray-600">{description}</p>
    </div>
  );
}

export default function FeatureSection() {
  const features = [
    {
      icon: <Users className="h-8 w-8 text-primary" />,
      title: "Group Management",
      description: "Create and manage study groups effortlessly."
    },
    {
      icon: <CalendarDays className="h-8 w-8 text-primary" />,
      title: "Meeting Scheduler",
      description: "Schedule and organize study sessions."
    },
    {
      icon: <BookOpen className="h-8 w-8 text-primary" />,
      title: "Notes Sharing",
      description: "Share and access study materials."
    },
    {
      icon: <MessageSquare className="h-8 w-8 text-primary" />,
      title: "Group Chat",
      description: "Communicate with your study group in real-time."
    }
  ];
  
  return (
    <div className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => (
            <FeatureCard 
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
