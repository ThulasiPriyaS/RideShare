import { RideHistory } from "@shared/schema";
import RatingStars from "@/components/ui/rating-stars";
import { formatRelative } from "date-fns";

interface RideHistoryCardProps {
  ride: RideHistory;
}

const RideHistoryCard: React.FC<RideHistoryCardProps> = ({ ride }) => {
  const formattedDate = formatRelative(new Date(ride.completedAt), new Date());
  
  return (
    <div className="bg-white rounded-xl shadow-sm p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="font-medium">{formattedDate}</div>
        <div className="text-sm font-semibold">${ride.fare.toFixed(2)}</div>
      </div>
      <div className="flex items-center mb-3">
        <div className="w-6 flex flex-col items-center mr-2">
          <div className="w-2 h-2 rounded-full bg-[#276EF1]"></div>
          <div className="w-0.5 h-8 bg-neutral-200"></div>
          <div className="w-2 h-2 rounded-full bg-[#27AE60]"></div>
        </div>
        <div className="flex-1">
          <div className="text-sm text-[#1A1A1A]">{ride.pickupLocation}</div>
          <div className="text-sm text-[#1A1A1A]">{ride.destination}</div>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="h-6 w-6 rounded-full bg-neutral-200 mr-2 overflow-hidden">
            {ride.driverPicture ? (
              <img 
                src={ride.driverPicture} 
                alt={ride.driverName} 
                className="h-6 w-6 object-cover" 
              />
            ) : (
              <div className="h-6 w-6 bg-[#276EF1] flex items-center justify-center text-white text-xs font-medium">
                {ride.driverName.substring(0, 2).toUpperCase()}
              </div>
            )}
          </div>
          <div className="text-sm">{ride.driverName}</div>
          <div className="ml-2 flex items-center">
            <RatingStars rating={ride.driverRating} />
            <span className="text-xs ml-1">{ride.driverRating.toFixed(1)}</span>
          </div>
        </div>
        <div className="text-sm text-[#F5A623] font-medium">+{ride.pointsEarned} pts</div>
      </div>
    </div>
  );
};

export default RideHistoryCard;
