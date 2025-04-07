import React, { useState, useEffect } from 'react';
import RideCompletionComponent from '@/components/rider/RideCompletion';
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";

interface RideCompletionProps {
  rideId: number;
  onComplete: () => void;
}

const RideCompletion: React.FC<RideCompletionProps> = ({ 
  rideId, 
  onComplete
}) => {
  const [riderDetails, setRiderDetails] = useState<{ 
    name: string; 
    rating: number; 
    isPriority: boolean;
  } | null>(null);

  // Fetch rider details for the current ride
  useEffect(() => {
    const fetchRiderDetails = async () => {
      try {
        // In a real implementation, we would call the API to get rider details
        // Since this is a demo, we'll use simulated data
        const simulatedRider = {
          name: "Alex Johnson",
          rating: 4.8,
          isPriority: true
        };
        setRiderDetails(simulatedRider);
      } catch (error) {
        console.error("Error fetching rider details:", error);
      }
    };

    fetchRiderDetails();
  }, [rideId]);

  return (
    <div>
      {/* Priority Rider Badge - Only shown for high-rated riders */}
      {riderDetails?.isPriority && (
        <div className="mb-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center">
            <div className="mr-2 p-1 bg-yellow-100 rounded-full">
              <Star className="h-4 w-4 text-yellow-500" fill="currentColor" />
            </div>
            <div>
              <p className="text-sm font-medium text-yellow-700">Priority Rider</p>
              <p className="text-xs text-yellow-600">
                This rider has a high rating and contributes to driver bonuses!
              </p>
            </div>
          </div>
        </div>
      )}
      
      <RideCompletionComponent
        rideId={rideId}
        onComplete={onComplete}
        isRider={false}
      />
      
      {/* Additional UI for driver incentives - Only shown for priority riders */}
      {riderDetails?.isPriority && (
        <div className="mt-3 bg-gradient-to-r from-yellow-50 to-amber-50 p-3 rounded-lg border border-yellow-100">
          <p className="text-sm font-medium text-amber-700 mb-1">
            Priority Completion Bonus
          </p>
          <p className="text-xs text-amber-600 mb-2">
            You'll receive a 10% bonus for this ride with a high-rated rider!
          </p>
          <div className="flex items-center justify-between text-xs">
            <span className="text-amber-700">
              <Star className="h-3 w-3 inline mr-1 text-yellow-500" fill="currentColor" />
              Driver points: +5
            </span>
            <Badge className="bg-yellow-500 hover:bg-yellow-600 text-xs">
              Priority bonus
            </Badge>
          </div>
        </div>
      )}
    </div>
  );
};

export default RideCompletion;