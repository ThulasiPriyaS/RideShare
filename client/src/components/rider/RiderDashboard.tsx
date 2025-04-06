import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { User, Achievement, LeaderboardUser } from "@shared/schema";
import { MapPin, Star, Check } from "lucide-react";
import MockMap from "@/lib/mockMap";
import AchievementCard from "@/components/achievements/AchievementCard";
import LeaderboardCard from "@/components/leaderboard/LeaderboardCard";
import { apiRequest } from "@/lib/queryClient";

interface RiderDashboardProps {
  onRequestRide: () => void;
}

const RiderDashboard: React.FC<RiderDashboardProps> = ({ onRequestRide }) => {
  const [destination, setDestination] = useState("");
  
  const { data: user } = useQuery<User>({ 
    queryKey: ['/api/user/current']
  });
  
  const { data: achievements } = useQuery<Achievement[]>({ 
    queryKey: ['/api/achievements/recent']
  });
  
  const { data: leaderboard } = useQuery<LeaderboardUser[]>({ 
    queryKey: ['/api/leaderboard']
  });

  const handleFindDrivers = async () => {
    if (!destination.trim()) return;
    
    try {
      await apiRequest("POST", "/api/rides/request", {
        destination,
        pickupLocation: "Current Location"
      });
      onRequestRide();
    } catch (error) {
      console.error("Error requesting ride:", error);
    }
  };

  return (
    <div className="p-4">
      {/* User Stats Section */}
      <div className="mb-6 bg-white rounded-xl shadow-sm p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Your Stats</h2>
          <button className="text-[#276EF1] text-sm font-medium">View All</button>
        </div>
        <div className="flex items-center justify-between">
          <div className="text-center">
            <div className="text-2xl font-bold text-[#276EF1]">{user?.rating?.toFixed(1) || "0.0"}</div>
            <div className="text-xs text-[#6E6E6E]">Rating</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-[#27AE60]">{user?.level || 0}</div>
            <div className="text-xs text-[#6E6E6E]">Level</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-[#F5A623]">{user?.badges?.length || 0}</div>
            <div className="text-xs text-[#6E6E6E]">Badges</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-[#6E6E6E]">{user?.totalRides || 0}</div>
            <div className="text-xs text-[#6E6E6E]">Rides</div>
          </div>
        </div>
      </div>

      {/* Request Ride Section */}
      <div className="mb-6">
        <div className="bg-white rounded-xl shadow-sm p-4">
          <h2 className="text-lg font-semibold mb-3">Request a Ride</h2>
          <div className="space-y-3">
            <div className="flex items-center border-b border-gray-200 pb-3">
              <div className="mr-3">
                <div className="h-8 w-8 rounded-full bg-[#276EF1] flex items-center justify-center">
                  <MapPin className="h-5 w-5 text-white" />
                </div>
              </div>
              <div className="flex-1">
                <div className="text-xs text-[#6E6E6E]">PICKUP LOCATION</div>
                <div className="text-[#1A1A1A]">Current Location</div>
              </div>
            </div>
            <div className="flex items-center">
              <div className="mr-3">
                <div className="h-8 w-8 rounded-full bg-[#27AE60] flex items-center justify-center">
                  <MapPin className="h-5 w-5 text-white" />
                </div>
              </div>
              <div className="flex-1">
                <div className="text-xs text-[#6E6E6E]">DESTINATION</div>
                <input 
                  type="text" 
                  placeholder="Where to?" 
                  className="w-full text-[#1A1A1A] focus:outline-none" 
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
        <button 
          className="w-full bg-[#276EF1] text-white font-semibold py-3 rounded-xl mt-3 shadow-lg shadow-[#276EF1]/20"
          onClick={handleFindDrivers}
        >
          Find Drivers
        </button>
      </div>

      {/* Map Section */}
      <div className="mb-6">
        <MockMap>
          <div className="absolute inset-0 bg-black/30 rounded-xl flex items-center justify-center flex-col">
            <button className="bg-white p-3 rounded-full shadow-lg mb-2">
              <MapPin className="h-6 w-6 text-[#276EF1]" />
            </button>
            <span className="text-white text-sm font-medium">Show on Map</span>
          </div>
        </MockMap>
      </div>

      {/* Achievements Section */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Recent Achievements</h2>
          <button className="text-[#276EF1] text-sm font-medium">View All</button>
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

      {/* Leaderboard Section */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Leaderboard</h2>
          <button className="text-[#276EF1] text-sm font-medium">View All</button>
        </div>
        <LeaderboardCard leaderboard={leaderboard || []} userRank={user?.leaderboardRank || 0} />
      </div>
    </div>
  );
};

export default RiderDashboard;
