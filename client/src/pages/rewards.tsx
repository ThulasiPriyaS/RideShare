import { useQuery } from "@tanstack/react-query";
import { Badge, Achievement, User } from "@shared/schema";
import BadgeIcon from "@/components/ui/badge-icon";
import { Star, CheckCircle, Award, ShieldCheck } from "lucide-react";

const RewardsPage = () => {
  const { data: user } = useQuery<User>({ 
    queryKey: ['/api/user/current']
  });
  
  const { data: badges } = useQuery<Badge[]>({ 
    queryKey: ['/api/user/badges'],
    enabled: !!user
  });
  
  const { data: achievements } = useQuery<Achievement[]>({ 
    queryKey: ['/api/achievements/all']
  });

  const progressToNextLevel = user ? Math.round((user.points % 1000) / 10) : 0;

  const getIcon = (type: string) => {
    switch (type) {
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

  const getColor = (type: string) => {
    switch (type) {
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

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Rewards</h1>
      
      {/* Points and Level */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="font-semibold text-lg">Your Points</div>
          <div className="text-xl font-bold text-[#F5A623]">{user?.points.toLocaleString() || 0}</div>
        </div>
        <div className="mb-2">
          <div className="flex justify-between text-sm mb-1">
            <span>Level {user?.level || 0}</span>
            <span>Level {(user?.level || 0) + 1}</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full">
            <div 
              className="h-2 bg-[#F5A623] rounded-full" 
              style={{ width: `${progressToNextLevel}%` }}
            ></div>
          </div>
          <div className="text-xs text-center mt-1 text-[#6E6E6E]">
            {1000 - (user?.points || 0) % 1000} points to next level
          </div>
        </div>
      </div>
      
      {/* Badges */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Your Badges</h2>
          <span className="text-sm text-[#6E6E6E]">{badges?.length || 0} of 30</span>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 grid grid-cols-4 gap-4">
          {badges && badges.length > 0 ? (
            badges.map((badge) => (
              <div key={badge.id} className="flex flex-col items-center">
                <BadgeIcon 
                  icon={getIcon(badge.type)}
                  color={getColor(badge.type)}
                  size="lg"
                />
                <span className="text-xs text-center font-medium mt-1">{badge.name}</span>
              </div>
            ))
          ) : (
            <div className="col-span-4 text-center text-[#6E6E6E] py-4">
              No badges yet. Keep riding to earn them!
            </div>
          )}
        </div>
      </div>
      
      {/* Available Achievements */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Available Achievements</h2>
        </div>
        <div className="space-y-3">
          {achievements && achievements
            .filter(a => !a.achieved)
            .slice(0, 3)
            .map((achievement) => (
              <div key={achievement.id} className="bg-white rounded-xl shadow-sm p-4 flex items-center">
                <div className="mr-4">
                  <BadgeIcon 
                    icon={getIcon(achievement.type)} 
                    color="#6E6E6E"
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
            ))}
        </div>
      </div>
      
      {/* Points History */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">How to Earn Points</h2>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4">
          <ul className="space-y-3">
            <li className="flex justify-between items-center border-b pb-2">
              <span>Complete a ride</span>
              <span className="font-medium text-[#F5A623]">+20 pts</span>
            </li>
            <li className="flex justify-between items-center border-b pb-2">
              <span>Rate your driver</span>
              <span className="font-medium text-[#F5A623]">+5 pts</span>
            </li>
            <li className="flex justify-between items-center border-b pb-2">
              <span>Receive 5-star rating</span>
              <span className="font-medium text-[#F5A623]">+10 pts</span>
            </li>
            <li className="flex justify-between items-center border-b pb-2">
              <span>Unlock an achievement</span>
              <span className="font-medium text-[#F5A623]">+25-100 pts</span>
            </li>
            <li className="flex justify-between items-center">
              <span>Refer a friend</span>
              <span className="font-medium text-[#F5A623]">+200 pts</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default RewardsPage;
