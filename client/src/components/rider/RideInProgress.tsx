import { useQuery } from "@tanstack/react-query";
import { Phone, MessageSquare, Check, CreditCard, Banknote, Smartphone, Users } from "lucide-react";
import RealTimeMap from "@/components/map/RealTimeMap";
import RatingStars from "@/components/ui/rating-stars";
import { ActiveRide, Driver } from "@shared/schema";

interface RideInProgressProps {
  rideId: number;
}

const RideInProgress: React.FC<RideInProgressProps> = ({ rideId }) => {
  const { data: activeRide } = useQuery<ActiveRide>({ 
    queryKey: [`/api/rides/${rideId}`],
    refetchInterval: 5000 // Poll every 5 seconds for ride updates
  });
  
  const { data: driver } = useQuery<Driver>({ 
    queryKey: [`/api/drivers/${activeRide?.driverId}`],
    enabled: !!activeRide?.driverId
  });

  if (!activeRide || !driver) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="mb-4">Loading ride information...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 relative">
        {/* Map View */}
        <RealTimeMap 
          pickup={activeRide.pickupLocation ? {
            latitude: 40.7128 + (Math.random() - 0.5) * 0.01,
            longitude: -74.0060 + (Math.random() - 0.5) * 0.01,
            name: activeRide.pickupLocation
          } : undefined}
          destination={activeRide.destination ? {
            latitude: 40.7128 + (Math.random() - 0.5) * 0.02,
            longitude: -74.0060 + (Math.random() - 0.5) * 0.02,
            name: activeRide.destination
          } : undefined}
          driverLocation={activeRide.currentLocation}
          showLabels={true}
          height="h-full"
        />
        
        {/* Floating Driver Card */}
        <div className="absolute top-4 left-4 right-4 bg-white rounded-xl shadow-lg p-4">
          <div className="flex items-center mb-3">
            <div className="h-12 w-12 rounded-full bg-neutral-200 mr-3 overflow-hidden">
              <img 
                src={driver.profilePicture || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&h=96&ixid=MnwxfDB8MXxyYW5kb218MHx8cGVyc29ufHx8fHx8MTcxMDUzMjI0OA&ixlib=rb-4.0.3&q=80&utm_campaign=api-credit&utm_medium=referral&utm_source=unsplash_source&w=96"} 
                alt={driver.name} 
                className="h-12 w-12 object-cover" 
              />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div className="font-medium">{driver.name}</div>
                <div className="flex items-center">
                  <RatingStars rating={driver.rating} />
                  <span className="text-sm ml-1 font-medium">{driver.rating.toFixed(2)}</span>
                </div>
              </div>
              <div className="flex items-center mt-1">
                <div className="text-sm text-[#6E6E6E] flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span>Level {driver.level} Driver</span>
                </div>
                <div className="text-sm text-[#27AE60] ml-2 flex items-center">
                  <Check className="h-4 w-4 mr-1" />
                  <span>{driver.totalRides} rides</span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-[#276EF1]/10 rounded-full flex items-center justify-center">
                <Check className="h-5 w-5 text-[#276EF1]" />
              </div>
              <div className="ml-2">
                <div className="text-xs text-[#6E6E6E]">VEHICLE</div>
                <div className="text-sm font-medium">{driver.vehicle} • {driver.licensePlate}</div>
              </div>
            </div>
            <div className="flex">
              <button className="w-10 h-10 bg-[#276EF1]/10 rounded-full flex items-center justify-center mr-2">
                <Phone className="h-5 w-5 text-[#276EF1]" />
              </button>
              <button className="w-10 h-10 bg-[#276EF1]/10 rounded-full flex items-center justify-center">
                <MessageSquare className="h-5 w-5 text-[#276EF1]" />
              </button>
            </div>
          </div>
        </div>
        
        {/* Ride Status */}
        <div className="absolute bottom-0 left-0 right-0 bg-white p-4 shadow-lg rounded-t-2xl">
          <div className="flex items-center justify-between mb-3">
            <div className="font-medium text-lg">{activeRide.status}</div>
            <div className="bg-[#276EF1]/10 px-2 py-1 rounded-full text-[#276EF1] text-sm font-medium">
              {activeRide.estimatedTimeRemaining} away
            </div>
          </div>
          
          <div className="flex items-center mb-4">
            <div className="w-8 flex flex-col items-center">
              <div className="w-3 h-3 rounded-full bg-[#276EF1]"></div>
              <div className="w-1 h-10 bg-neutral-200"></div>
              <div className="w-3 h-3 rounded-full bg-[#27AE60]"></div>
            </div>
            <div className="flex-1">
              <div className="mb-2">
                <div className="text-xs text-[#6E6E6E]">PICKUP</div>
                <div className="text-sm">{activeRide.pickupLocation}</div>
              </div>
              <div>
                <div className="text-xs text-[#6E6E6E]">DESTINATION</div>
                <div className="text-sm">{activeRide.destination}</div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-[#6E6E6E]">ESTIMATED FARE</div>
              <div className="text-lg font-semibold">${activeRide.fare.toFixed(2)}</div>
            </div>
            <div className="flex flex-col items-end">
              <div className="text-xs text-[#6E6E6E]">POTENTIAL POINTS</div>
              <div className="text-lg font-semibold text-[#F5A623]">+{activeRide.potentialPoints} pts</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RideInProgress;
