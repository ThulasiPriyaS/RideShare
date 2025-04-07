import { useState } from "react";
import RiderDashboard from "@/components/rider/RiderDashboard";
import RideInProgress from "@/components/rider/RideInProgress";
import RideComplete from "@/components/rider/RideComplete";
import RideWaiting from "@/components/rider/RideWaiting";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Location, VehicleType, PaymentMethod } from "@shared/schema";

interface HomePageProps {
  setActiveTab: (tab: string) => void;
}

const HomePage: React.FC<HomePageProps> = ({ setActiveTab }) => {
  const [viewState, setViewState] = useState<"dashboard" | "inProgress" | "complete" | "waiting">("dashboard");
  const [currentRideId, setCurrentRideId] = useState<number | null>(null);
  const [rideDetails, setRideDetails] = useState<{
    pickup: Location | null;
    destination: Location | null;
    vehicle: VehicleType | null;
    payment: PaymentMethod | null;
    splitFare: boolean;
  }>({
    pickup: null,
    destination: null,
    vehicle: null,
    payment: null,
    splitFare: false
  });
  const { toast } = useToast();

  const handleRequestRide = async (
    pickup: Location,
    destination: Location,
    vehicle: VehicleType,
    payment: PaymentMethod,
    splitFare: boolean
  ) => {
    // Store ride details for future use
    setRideDetails({
      pickup,
      destination,
      vehicle,
      payment,
      splitFare
    });

    // Change to waiting state
    setViewState("waiting");
    
    try {
      // Send ride request to server
      const response = await apiRequest("POST", "/api/rides/request", {
        pickupLocation: JSON.stringify(pickup),
        destination: JSON.stringify(destination),
        vehicleType: vehicle.id,
        paymentMethod: payment.id,
        fare: vehicle.baseRate * 2.5, // Assuming 2.5 miles
        splitFare: splitFare,
        splitWith: splitFare ? ["friend@example.com"] : [] // Mock split
      });
      
      if (!response.ok) {
        throw new Error("Failed to request ride");
      }
      
      const data = await response.json();
      setCurrentRideId(data.id);
      setViewState("waiting");
      
      toast({
        title: "Ride requested!",
        description: "Looking for a driver...",
      });
    } catch (error) {
      console.error("Error requesting ride:", error);
      toast({
        title: "Error requesting ride",
        description: "Please try again",
        variant: "destructive",
      });
      setViewState("dashboard");
    }
  };

  const handleRideComplete = () => {
    if (currentRideId) {
      setViewState("complete");
      setActiveTab("rewards");
    }
  };

  const handleFinishRating = () => {
    setViewState("dashboard");
    setCurrentRideId(null);
    setActiveTab("home");
  };

  // For demo purposes, add a timeout to simulate ride completion
  if (viewState === "inProgress" && currentRideId) {
    setTimeout(() => {
      handleRideComplete();
    }, 15000); // 15 seconds to simulate a ride
  }

  return (
    <>
      {viewState === "dashboard" && (
        <RiderDashboard onRequestRide={handleRequestRide} />
      )}
      
      {viewState === "waiting" && currentRideId && (
        <RideWaiting 
          rideId={currentRideId} 
          onRideAccepted={(driverId) => {
            setViewState("inProgress");
          }}
          onCancel={() => {
            setViewState("dashboard");
            setCurrentRideId(null);
          }}
          pickup={rideDetails.pickup}
          destination={rideDetails.destination}
        />
      )}
      
      {viewState === "inProgress" && currentRideId && (
        <RideInProgress rideId={currentRideId} />
      )}
      
      {viewState === "complete" && currentRideId && (
        <RideComplete rideId={currentRideId} onFinish={handleFinishRating} />
      )}
    </>
  );
};

export default HomePage;
