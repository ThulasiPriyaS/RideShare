import { useQuery } from "@tanstack/react-query";
import { User, Badge, RideHistory } from "@shared/schema";
import RatingStars from "@/components/ui/rating-stars";
import RideHistoryCard from "@/components/rides/RideHistoryCard";
import BadgeIcon from "@/components/ui/badge-icon";
import { Award, CheckCircle, Star, LucideIcon, ShieldCheck, Calendar } from "lucide-react";

interface UserProfileProps {
  userId?: number;
}

const UserProfile: React.FC<UserProfileProps> = ({ userId }) => {
  const { data: user } = useQuery<User>({ 
    queryKey: userId ? [`/api/users/${userId}`] : ['/api/user/current']
  });
  
  const { data: badges } = useQuery<Badge[]>({ 
    queryKey: userId ? [`/api/users/${userId}/badges`] : ['/api/user/badges'],
    enabled: !!user
  });
  
  const { data: rideHistory } = useQuery<RideHistory[]>({ 
    queryKey: userId ? [`/api/users/${userId}/rides`] : ['/api/user/rides'],
    enabled: !!user
  });

  if (!user) {
    return <div className="p-4 text-center">Loading profile...</div>;
  }

  const getBadgeIcon = (type: string): React.ReactNode => {
    switch (type) {
      case "star":
        return <Star className="h-8 w-8 text-white" />;
      case "check":
        return <CheckCircle className="h-8 w-8 text-white" />;
      case "shield":
        return <ShieldCheck className="h-8 w-8 text-white" />;
      default:
        return <Award className="h-8 w-8 text-white" />;
    }
  };

  const getBadgeColor = (type: string): string => {
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
      {/* Profile Card */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="flex items-center">
          <div className="h-16 w-16 rounded-full bg-neutral-200 mr-4 overflow-hidden">
            <img 
              src={user.profilePicture || "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&h=128&ixid=MnwxfDB8MXxyYW5kb218MHx8cGVyc29ufHx8fHx8MTcxMDUzMjI0OA&ixlib=rb-4.0.3&q=80&utm_campaign=api-credit&utm_medium=referral&utm_source=unsplash_source&w=128"} 
              alt="Profile" 
              className="h-16 w-16 object-cover" 
            />
          </div>
          <div>
            <h2 className="text-xl font-bold">{user.name}</h2>
            <div className="flex items-center">
              <RatingStars rating={user.rating} />
              <span className="text-sm ml-1">{user.rating.toFixed(1)} Rating</span>
              <div className="ml-3 bg-[#276EF1]/10 px-2 py-0.5 rounded-full flex items-center">
                <ShieldCheck className="h-3 w-3 text-[#276EF1]" />
                <span className="text-xs font-medium text-[#276EF1] ml-1">Level {user.level}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-6 flex items-center justify-between">
          <div className="text-center">
            <div className="text-2xl font-bold text-[#276EF1]">{user.points.toLocaleString()}</div>
            <div className="text-xs text-[#6E6E6E]">Points</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-[#27AE60]">{user.totalRides}</div>
            <div className="text-xs text-[#6E6E6E]">Rides</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-[#F5A623]">{badges?.length || 0}</div>
            <div className="text-xs text-[#6E6E6E]">Badges</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-[#6E6E6E]">#{user.leaderboardRank}</div>
            <div className="text-xs text-[#6E6E6E]">Rank</div>
          </div>
        </div>
      </div>
      
      {/* Badge Collection */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Your Badges</h2>
          <span className="text-sm text-[#6E6E6E]">{badges?.length || 0} of 30</span>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="grid grid-cols-4 gap-4">
            {badges && badges.map((badge) => (
              <div key={badge.id} className="flex flex-col items-center">
                <BadgeIcon 
                  icon={getBadgeIcon(badge.type)}
                  color={getBadgeColor(badge.type)}
                  size="lg"
                />
                <span className="text-xs text-center font-medium mt-1">{badge.name}</span>
              </div>
            ))}
            
            {badges && badges.length < 8 && Array.from({ length: 8 - badges.length }).map((_, i) => (
              <div key={`locked-${i}`} className="flex flex-col items-center">
                <div className="h-14 w-14 rounded-full bg-neutral-200 flex items-center justify-center mb-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-neutral-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-xs text-center text-neutral-400">Locked</span>
              </div>
            ))}
          </div>
          <button className="w-full mt-4 py-2 text-sm font-medium text-[#276EF1]">See All Badges</button>
        </div>
      </div>
      
      {/* Ride History */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Ride History</h2>
          <button className="text-[#276EF1] text-sm font-medium">View All</button>
        </div>
        <div className="space-y-3">
          {rideHistory && rideHistory.length > 0 ? (
            rideHistory.map((ride) => (
              <RideHistoryCard key={ride.id} ride={ride} />
            ))
          ) : (
            <div className="bg-white rounded-xl shadow-sm p-4 text-center text-[#6E6E6E]">
              No ride history available.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
