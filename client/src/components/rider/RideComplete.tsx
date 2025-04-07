import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Check, CreditCard, Banknote, Smartphone, Car, Bike, Users, Star } from "lucide-react";
import { CompleteRide, Achievement } from "@shared/schema";
import RatingStars from "@/components/ui/rating-stars";
import BadgeIcon from "@/components/ui/badge-icon";
import { apiRequest, queryClient } from "@/lib/queryClient";
import RideCompletion from "@/components/rider/RideCompletion";
import UpiPayment from "@/components/payment/UpiPayment";
import GamifiedRating from "@/components/ui/gamified-rating";

interface RideCompleteProps {
  rideId: number;
  onFinish: () => void;
}

const RideComplete: React.FC<RideCompleteProps> = ({ rideId, onFinish }) => {
  const [rating, setRating] = useState(5);
  const [showDualConfirmation, setShowDualConfirmation] = useState(true);
  const [showUpiPayment, setShowUpiPayment] = useState(false);
  const [userRating, setUserRating] = useState<number | null>(null);
  const [isPriorityRider, setIsPriorityRider] = useState(false);
  const [completionStatus, setCompletionStatus] = useState({
    riderCompleted: false,
    driverCompleted: false,
    bothCompleted: false
  });
  
  const { data: ride } = useQuery<CompleteRide>({ 
    queryKey: [`/api/rides/${rideId}/complete`]
  });
  
  const { data: unlockedAchievement } = useQuery<Achievement>({ 
    queryKey: [`/api/rides/${rideId}/achievement`],
    enabled: !!ride
  });

  // Check completion status when component mounts and get user rating
  useEffect(() => {
    const checkCompletionStatus = async () => {
      try {
        const response = await apiRequest('GET', `/api/rides/${rideId}/complete-status`);
        if (response.ok) {
          const data = await response.json();
          setCompletionStatus({
            riderCompleted: data.riderCompleted,
            driverCompleted: data.driverCompleted,
            bothCompleted: data.bothCompleted
          });
          
          // If both have confirmed, move to the rating screen
          if (data.bothCompleted) {
            setShowDualConfirmation(false);
          }
        }
      } catch (error) {
        console.error("Failed to fetch ride completion status:", error);
      }
    };
    
    const getUserRating = async () => {
      try {
        const response = await apiRequest('GET', '/api/user/current');
        if (response.ok) {
          const userData = await response.json();
          setUserRating(userData.rating || null);
          
          // Set priority status based on high rating
          // Typically 4.8+ is considered a priority rider
          if (userData.rating && userData.rating >= 4.8) {
            setIsPriorityRider(true);
          }
        }
      } catch (error) {
        console.error("Failed to fetch user rating:", error);
      }
    };
    
    checkCompletionStatus();
    getUserRating();
  }, [rideId]);

  const submitRatingMutation = useMutation({
    mutationFn: async (data: { rating: number }) => {
      return apiRequest("POST", `/api/rides/${rideId}/rate`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/rides/${rideId}`] });
      queryClient.invalidateQueries({ queryKey: ['/api/user/current'] });
      onFinish();
    }
  });

  const handleSubmitRating = () => {
    submitRatingMutation.mutate({ rating });
  };

  const handleSkip = () => {
    onFinish();
  };
  
  const handleCompletionConfirmed = () => {
    setShowDualConfirmation(false);
    // Check if payment method is UPI and should show UPI payment screen
    if (ride?.paymentMethod === 'upi') {
      setShowUpiPayment(true);
    }
  };

  const handlePaymentComplete = () => {
    setShowUpiPayment(false);
  };

  if (!ride) {
    return (
      <div className="p-4 flex items-center justify-center">
        <div>Loading ride summary...</div>
      </div>
    );
  }

  // Show dual confirmation component if needed
  if (showDualConfirmation) {
    return (
      <RideCompletion 
        rideId={rideId} 
        onComplete={handleCompletionConfirmed}
        isRider={true}
      />
    );
  }

  // Show UPI payment if method is UPI
  if (showUpiPayment && ride.paymentMethod === 'upi') {
    return (
      <div className="p-4">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <UpiPayment
            amount={ride.fare}
            merchantUpi="merchant@upi"
            merchantName="RideShare Driver"
            onPaymentComplete={handlePaymentComplete}
          />
        </div>
      </div>
    );
  }

  // Once confirmed, show rating and ride summary
  return (
    <div className="p-4">
      <div className="bg-white rounded-xl shadow-lg p-6 text-center">
        <div className="w-20 h-20 bg-[#27AE60]/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Check className="h-12 w-12 text-[#27AE60]" />
        </div>
        
        <h2 className="text-xl font-bold mb-1">Ride Completed!</h2>
        <p className="text-[#6E6E6E] mb-4">
          {unlockedAchievement 
            ? "You've earned points and unlocked an achievement!" 
            : "You've earned points for this ride!"}
        </p>
        
        <div className="flex justify-center items-center mb-6">
          <div className="text-center mr-6">
            <div className="text-2xl font-bold text-[#F5A623]">+{ride.pointsEarned}</div>
            <div className="text-sm text-[#6E6E6E]">Points</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-[#276EF1]">₹{ride.fare.toFixed(2)}</div>
            <div className="text-sm text-[#6E6E6E]">Fare</div>
          </div>
        </div>
        
        {/* Ride Details */}
        <div className="bg-neutral-50 rounded-lg p-4 mb-6">
          <div className="flex justify-between mb-2">
            <div className="flex items-center">
              {ride.vehicleType && (
                <div className="mr-2">
                  {ride.vehicleType === 'standard' || ride.vehicleType === 'premium' ? (
                    <Car className="h-5 w-5 text-[#276EF1]" />
                  ) : ride.vehicleType === 'pinkbike' ? (
                    <Bike className="h-5 w-5 text-[#F06292]" />
                  ) : (
                    <Users className="h-5 w-5 text-[#27AE60]" />
                  )}
                </div>
              )}
              <div>
                <span className="text-sm font-medium">
                  {ride.vehicleType 
                    ? ride.vehicleType.charAt(0).toUpperCase() + ride.vehicleType.slice(1) 
                    : "Standard"}
                </span>
              </div>
            </div>
            
            {ride.paymentMethod && (
              <div className="flex items-center">
                <div className="mr-2">
                  {ride.paymentMethod === 'cash' ? (
                    <Banknote className="h-5 w-5 text-[#6E6E6E]" />
                  ) : ride.paymentMethod === 'upi' ? (
                    <Smartphone className="h-5 w-5 text-[#6E6E6E]" />
                  ) : (
                    <CreditCard className="h-5 w-5 text-[#6E6E6E]" />
                  )}
                </div>
                <div>
                  <span className="text-sm font-medium">
                    {ride.paymentMethod.charAt(0).toUpperCase() + ride.paymentMethod.slice(1)}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Unlocked Achievement */}
        {unlockedAchievement && (
          <div className="bg-neutral-100 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <div className="mr-4 relative badge-shine">
                <BadgeIcon 
                  icon={<Check className="h-6 w-6 text-white" />}
                  color="#F5A623"
                  shine
                  pulse
                />
              </div>
              <div className="flex-1 text-left">
                <h3 className="font-semibold">{unlockedAchievement.title}</h3>
                <p className="text-sm text-[#6E6E6E]">{unlockedAchievement.description}</p>
                <div className="mt-1">
                  <span className="text-xs font-semibold text-[#F5A623]">
                    +{unlockedAchievement.pointsAwarded} bonus points
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Priority Rider Status */}
        {isPriorityRider && (
          <div className="bg-yellow-50 rounded-lg p-4 mb-6 border border-yellow-200">
            <div className="flex items-center">
              <div className="mr-4">
                <div className="h-10 w-10 rounded-full bg-yellow-100 flex items-center justify-center">
                  <Star className="h-5 w-5 text-yellow-500" fill="currentColor" />
                </div>
              </div>
              <div className="flex-1 text-left">
                <h3 className="font-semibold text-yellow-700">Priority Rider Status</h3>
                <p className="text-sm text-yellow-600">
                  Your high rating ({userRating?.toFixed(1)}/5.0) gives you priority matching with drivers.
                </p>
                <p className="text-xs mt-1 text-yellow-700 font-medium">
                  Keep it up to enjoy faster pickups and premium service!
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* Gamified Rating */}
        <div>
          <div className="text-center mb-3">
            <p className="text-sm text-gray-600">Rate your driver</p>
            <p className="text-xs text-yellow-600 mb-2">
              High driver ratings help improve the service for everyone
            </p>
          </div>
          <GamifiedRating
            initialRating={rating}
            onRatingChange={setRating}
            onComplete={handleSubmitRating}
          />
          <div className="mt-3 text-center text-xs text-gray-500">
            <p>Your rating helps match quality drivers with priority riders like you.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RideComplete;
