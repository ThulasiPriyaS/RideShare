import { useState } from "react";
import RiderDashboard from "@/components/rider/RiderDashboard";
import RideInProgress from "@/components/rider/RideInProgress";
import RideComplete from "@/components/rider/RideComplete";

interface HomePageProps {
  setActiveTab: (tab: string) => void;
}

const HomePage: React.FC<HomePageProps> = ({ setActiveTab }) => {
  const [viewState, setViewState] = useState<"dashboard" | "inProgress" | "complete">("dashboard");
  const [currentRideId, setCurrentRideId] = useState<number | null>(null);

  const handleRequestRide = async () => {
    // Simulate a ride request and get the ride ID
    // In a real implementation, this would come from the API
    setCurrentRideId(Date.now()); // Using timestamp as mock ID
    setViewState("inProgress");
    setActiveTab("request");
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
