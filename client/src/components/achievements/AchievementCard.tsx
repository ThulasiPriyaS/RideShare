import { Achievement } from "@shared/schema";
import BadgeIcon from "@/components/ui/badge-icon";
import { Star, CheckCircle, Award, ShieldCheck } from "lucide-react";

interface AchievementCardProps {
  achievement: Achievement;
}

const AchievementCard: React.FC<AchievementCardProps> = ({ achievement }) => {
  const getIcon = () => {
    switch (achievement.type) {
      case "star":
        return <Star className="h-6 w-6 text-white" />;
      case "check":
        return <CheckCircle className="h-6 w-6 text-white" />;
      case "shield":
        return <ShieldCheck className="h-6 w-6 text-white" />;
      default:
        return <Award className="h-6 w-6 text-white" />;
    }
  };

  const getColor = () => {
    switch (achievement.type) {
      case "star":
        return "#F5A623";
      case "check":
        return "#27AE60";
      case "shield":
        return "#276EF1";
      default:
        return "#6E6E6E";
    }
  };

  const isNew = achievement.isNew;

  return (
    <div className="bg-white rounded-xl shadow-sm p-4 flex items-center">
      <div className="mr-4">
        <BadgeIcon 
          icon={getIcon()} 
          color={getColor()} 
          shine={isNew}
        />
      </div>
      <div className="flex-1">
        <h3 className="font-medium">{achievement.title}</h3>
        <p className="text-sm text-[#6E6E6E]">{achievement.description}</p>
        <div className="mt-1">
          <span className="text-xs font-semibold text-[#F5A623]">+{achievement.pointsAwarded} points</span>
        </div>
      </div>
    </div>
  );
};

export default AchievementCard;
