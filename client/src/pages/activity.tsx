import { useQuery } from "@tanstack/react-query";
import { RideHistory, Achievement } from "@shared/schema";
import RideHistoryCard from "@/components/rides/RideHistoryCard";
import AchievementCard from "@/components/achievements/AchievementCard";

const ActivityPage = () => {
  const { data: rideHistory } = useQuery<RideHistory[]>({ 
    queryKey: ['/api/user/rides']
  });
  
  const { data: achievements } = useQuery<Achievement[]>({ 
    queryKey: ['/api/achievements/all']
  });

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Activity</h1>
      
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Recent Rides</h2>
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
      
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Your Achievements</h2>
        </div>
        <div className="space-y-3">
          {achievements && achievements.length > 0 ? (
            achievements.map((achievement) => (
              <AchievementCard key={achievement.id} achievement={achievement} />
            ))
          ) : (
            <div className="bg-white rounded-xl shadow-sm p-4 text-center text-[#6E6E6E]">
              No achievements yet. Complete rides to earn badges!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ActivityPage;
