import { LeaderboardUser } from "@shared/schema";
import RatingStars from "@/components/ui/rating-stars";

interface LeaderboardCardProps {
  leaderboard: LeaderboardUser[];
  userRank: number;
}

const LeaderboardCard: React.FC<LeaderboardCardProps> = ({ 
  leaderboard,
  userRank
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="text-sm font-medium text-[#6E6E6E]">Top Riders This Week</div>
        <div className="bg-[#276EF1]/10 text-[#276EF1] text-xs font-semibold px-2 py-1 rounded-full">
          You: #{userRank}
        </div>
      </div>
      <div className="space-y-3">
        {leaderboard.length > 0 ? (
          leaderboard.map((user, index) => (
            <div key={user.id} className="flex items-center">
              <div className="w-6 text-center font-bold text-[#6E6E6E]">{index + 1}</div>
              <div className="h-8 w-8 rounded-full ml-2 flex items-center justify-center text-white font-medium text-sm" 
                style={{ 
                  backgroundColor: index === 0 
                    ? "#F5A623" 
                    : index === 1 
                      ? "#276EF1" 
                      : "#27AE60" 
                }}>
                {user.initials}
              </div>
              <div className="ml-2 flex-1">
                <div className="font-medium">{user.name}</div>
                <div className="flex items-center">
                  <RatingStars rating={user.rating} />
                  <span className="text-xs ml-1">{user.rating.toFixed(2)}</span>
                  <span className="text-xs ml-2 text-[#6E6E6E]">Level {user.level}</span>
                </div>
              </div>
              <div className="text-[#F5A623] font-bold">{user.points.toLocaleString()} pts</div>
            </div>
          ))
        ) : (
          <div className="text-center text-[#6E6E6E] py-4">
            No leaderboard data available.
          </div>
        )}
      </div>
    </div>
  );
};

export default LeaderboardCard;
