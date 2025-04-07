import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { CheckIcon } from "lucide-react";

interface RideCompletionProps {
  rideId: number;
  onComplete: () => void;
  isRider: boolean;
}

// Export named component for reuse in driver component
export const RideCompletion: React.FC<RideCompletionProps> = ({ 
  rideId, 
  onComplete,
  isRider = true
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [rating, setRating] = useState<number>(5);
  const [status, setStatus] = useState<{
    riderCompleted: boolean;
    driverCompleted: boolean;
    bothCompleted: boolean;
  }>({
    riderCompleted: false,
    driverCompleted: false,
    bothCompleted: false
  });

  // Fetch current status
  const fetchStatus = async () => {
    try {
      const response = await apiRequest('GET', `/api/rides/${rideId}/complete-status`);
      if (response.ok) {
        const data = await response.json();
        setStatus({
          riderCompleted: data.riderCompleted,
          driverCompleted: data.driverCompleted,
          bothCompleted: data.bothCompleted
        });
        
        if (data.bothCompleted) {
          toast({
            title: "Ride Completed",
            description: "Thank you for riding with us!",
            variant: "default"
          });
          onComplete();
        }
      }
    } catch (error) {
      console.error("Failed to fetch ride status:", error);
    }
  };

  useEffect(() => {
    fetchStatus();
    
    // Poll for status updates every 5 seconds
    const interval = setInterval(fetchStatus, 5000);
    return () => clearInterval(interval);
  }, [rideId]);

  const handleCompleteRide = async () => {
    setLoading(true);
    
    try {
      // For the rider, we also send a rating
      // Send the right endpoint based on user type
      const endpoint = isRider ? `/api/rides/${rideId}/rider-complete` : `/api/rides/${rideId}/driver-complete`;
      const payload = isRider ? { rating } : {};
      const response = await apiRequest('POST', endpoint, payload);
      
      if (response.ok) {
        const data = await response.json();
        
        toast({
          title: "Thank you!",
          description: data.message,
          variant: "default"
        });
        
        // Refresh status
        await fetchStatus();
        
        if (data.bothCompleted) {
          onComplete();
        }
      } else {
        toast({
          title: "Error",
          description: "Could not complete the ride. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error completing ride:", error);
      toast({
        title: "Error",
        description: "Could not complete the ride. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="p-4 rounded-lg bg-white shadow-md">
      <div className="text-center mb-4">
        <h3 className="text-lg font-semibold">Ride Completion</h3>
        <p className="text-sm text-gray-500">Both rider and driver must confirm to complete the ride</p>
      </div>
      
      <div className="flex items-center justify-around mb-4">
        <div className="flex flex-col items-center">
          <div className={`h-12 w-12 rounded-full flex items-center justify-center ${status.riderCompleted ? 'bg-green-100 text-green-600' : 'bg-gray-100'}`}>
            {status.riderCompleted ? (
              <CheckIcon className="h-6 w-6" />
            ) : (
              <span className="text-gray-500">R</span>
            )}
          </div>
          <div className="mt-2 text-sm font-medium">Rider</div>
          <div className="text-xs text-gray-500">
            {status.riderCompleted ? "Confirmed" : "Pending"}
          </div>
        </div>
        
        <div className="h-0.5 w-16 bg-gray-200" />
        
        <div className="flex flex-col items-center">
          <div className={`h-12 w-12 rounded-full flex items-center justify-center ${status.driverCompleted ? 'bg-green-100 text-green-600' : 'bg-gray-100'}`}>
            {status.driverCompleted ? (
              <CheckIcon className="h-6 w-6" />
            ) : (
              <span className="text-gray-500">D</span>
            )}
          </div>
          <div className="mt-2 text-sm font-medium">Driver</div>
          <div className="text-xs text-gray-500">
            {status.driverCompleted ? "Confirmed" : "Pending"}
          </div>
        </div>
      </div>
      
      {isRider && !status.riderCompleted && (
        <div className="mb-4">
          <div className="text-sm font-medium mb-2">Rate your driver:</div>
          <div className="flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className={`h-10 w-10 rounded-full flex items-center justify-center ${
                  rating >= star ? 'bg-yellow-100 text-yellow-500' : 'bg-gray-100 text-gray-400'
                }`}
              >
                ★
              </button>
            ))}
          </div>
        </div>
      )}
      
      {isRider ? (
        status.riderCompleted ? (
          <div className="p-3 rounded-md bg-green-50 text-green-700 text-center text-sm">
            {status.driverCompleted 
              ? "Ride completed successfully. Thank you!" 
              : "Waiting for the driver to confirm..."}
          </div>
        ) : (
          <Button
            onClick={handleCompleteRide}
            disabled={loading}
            className="w-full"
          >
            {loading ? "Processing..." : "Complete Ride"}
          </Button>
        )
      ) : (
        status.driverCompleted ? (
          <div className="p-3 rounded-md bg-green-50 text-green-700 text-center text-sm">
            {status.riderCompleted 
              ? "Ride completed successfully. Thank you!" 
              : "Waiting for the rider to confirm..."}
          </div>
        ) : (
          <Button
            onClick={handleCompleteRide}
            disabled={loading}
            className="w-full"
          >
            {loading ? "Processing..." : "Confirm Ride Completion"}
          </Button>
        )
      )}
      
      {/* Show confirmation messages */}
      {status.driverCompleted && !status.riderCompleted && isRider && (
        <div className="mt-3 text-center text-amber-600 text-sm">
          <p>Driver has confirmed ride completion</p>
        </div>
      )}
      
      {status.riderCompleted && !status.driverCompleted && !isRider && (
        <div className="mt-3 text-center text-amber-600 text-sm">
          <p>Rider has confirmed ride completion</p>
        </div>
      )}
    </div>
  );
};

export default RideCompletion;