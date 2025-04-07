import { useState } from "react";
import { ChevronDown, ChevronUp, Compass } from "lucide-react";
import LocationSearch from "./LocationSearch";
import VehicleSelection from "./VehicleSelection";
import PaymentSelection from "./PaymentSelection";
import RealTimeMap from "../map/RealTimeMap";
import { Location, VehicleType, PaymentMethod } from "@shared/schema";
import { Button } from "@/components/ui/button";

interface RiderDashboardProps {
  onRequestRide: (
    pickup: Location,
    destination: Location,
    vehicle: VehicleType,
    payment: PaymentMethod,
    splitFare: boolean
  ) => void;
}

const RiderDashboard: React.FC<RiderDashboardProps> = ({ onRequestRide }) => {
  const [pickup, setPickup] = useState<Location | null>(null);
  const [destination, setDestination] = useState<Location | null>(null);
  const [isSearchExpanded, setIsSearchExpanded] = useState(true);
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleType | null>(null);
  const [showVehicleSelection, setShowVehicleSelection] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod | null>(null);
  const [showPaymentSelection, setShowPaymentSelection] = useState(false);
  const [isSplitFareEnabled, setIsSplitFareEnabled] = useState(false);
  const [isRequestingRide, setIsRequestingRide] = useState(false);

  // Random driver location for demonstration
  const driverLocation = {
    latitude: 40.7128 + (Math.random() - 0.5) * 0.01,
    longitude: -74.0060 + (Math.random() - 0.5) * 0.01
  };

  const handlePickupSelect = (location: Location) => {
    setPickup(location);
    
    // Auto-expand destination search when pickup is selected
    if (!destination) {
      setIsSearchExpanded(true);
    } else {
      // If both locations are set, show vehicle selection
      setShowVehicleSelection(true);
    }
  };

  const handleDestinationSelect = (location: Location) => {
    setDestination(location);
    
    // If both locations are set, show vehicle selection
    if (pickup) {
      setShowVehicleSelection(true);
    }
  };

  const handleVehicleSelect = (vehicle: VehicleType) => {
    setSelectedVehicle(vehicle);
    setShowPaymentSelection(true);
  };

  const handlePaymentSelect = (payment: PaymentMethod) => {
    setSelectedPayment(payment);
  };

  const toggleSplitFare = () => {
    setIsSplitFareEnabled(!isSplitFareEnabled);
  };

  const handleRequestRide = () => {
    if (pickup && destination && selectedVehicle && selectedPayment) {
      setIsRequestingRide(true);
      
      // Send the ride request with all details to the parent component
      onRequestRide(
        pickup,
        destination,
        selectedVehicle,
        selectedPayment,
        isSplitFareEnabled
      );
    }
  };

  const canRequestRide = pickup && destination && selectedVehicle && selectedPayment;

  return (
    <div className="flex flex-col h-full">
      {/* Map View */}
      <div className="relative flex-grow overflow-hidden" style={{ height: "calc(100vh - 64px)" }}>
        <RealTimeMap 
          pickup={pickup ? {
            latitude: pickup.latitude,
            longitude: pickup.longitude,
            name: pickup.name
          } : undefined}
          destination={destination ? {
            latitude: destination.latitude,
            longitude: destination.longitude,
            name: destination.name
          } : undefined}
          driverLocation={driverLocation}
          showLabels={true}
          height="h-full"
          interactive={true}
          onMapClick={(lat, lng) => {
            console.log("Map clicked at:", lat, lng);
          }}
        />
        
        {/* Search panel overlaid on the map */}
        <div className="absolute inset-x-0 bottom-0 bg-white rounded-t-3xl shadow-lg transition-transform duration-300 transform">
          {/* Drag handle */}
          <div 
            className="flex justify-center py-2 cursor-pointer"
            onClick={() => setIsSearchExpanded(!isSearchExpanded)}
          >
            <div className="w-10 h-1 bg-gray-300 rounded-full"></div>
          </div>
          
          <div className={`px-4 pb-4 overflow-auto ${isSearchExpanded ? 'max-h-[60vh]' : 'max-h-24'} transition-all duration-300`}>
            <div className="flex items-center mb-2">
              <div className="flex-1">
                <h2 className="text-xl font-bold">Where to?</h2>
              </div>
              <button className="p-2 rounded-full bg-gray-100">
                {isSearchExpanded ? 
                  <ChevronDown className="h-5 w-5 text-gray-600" /> : 
                  <ChevronUp className="h-5 w-5 text-gray-600" />
                }
              </button>
            </div>
            
            {/* Location search inputs */}
            <div className="mb-4 space-y-4">
              <div className="border-b border-gray-200 pb-2">
                <LocationSearch 
                  placeholder="Pickup location"
                  onLocationSelect={handlePickupSelect}
                  initialValue={pickup?.name || ""}
                />
              </div>
              <div className="border-b border-gray-200 pb-2">
                <LocationSearch 
                  placeholder="Where to?"
                  onLocationSelect={handleDestinationSelect}
                  initialValue={destination?.name || ""}
                />
              </div>
            </div>
            
            {/* Saved places shortcuts */}
            <div className="flex space-x-4 mb-4">
              <div className="flex-1 p-3 bg-gray-50 rounded-lg text-center">
                <div className="flex items-center justify-center mb-1">
                  <div className="w-8 h-8 rounded-full bg-[#276EF1]/10 flex items-center justify-center">
                    <Compass className="h-4 w-4 text-[#276EF1]" />
                  </div>
                </div>
                <div className="text-xs font-medium">Home</div>
              </div>
              <div className="flex-1 p-3 bg-gray-50 rounded-lg text-center">
                <div className="flex items-center justify-center mb-1">
                  <div className="w-8 h-8 rounded-full bg-[#276EF1]/10 flex items-center justify-center">
                    <Compass className="h-4 w-4 text-[#276EF1]" />
                  </div>
                </div>
                <div className="text-xs font-medium">Work</div>
              </div>
              <div className="flex-1 p-3 bg-gray-50 rounded-lg text-center">
                <div className="flex items-center justify-center mb-1">
                  <div className="w-8 h-8 rounded-full bg-[#276EF1]/10 flex items-center justify-center">
                    <Compass className="h-4 w-4 text-[#276EF1]" />
                  </div>
                </div>
                <div className="text-xs font-medium">Gym</div>
              </div>
            </div>
            
            {/* Vehicle selection */}
            {showVehicleSelection && (
              <div className="mb-4">
                <VehicleSelection 
                  onVehicleSelect={handleVehicleSelect}
                  estimatedTime="12 min"
                  distance="2.5 miles"
                />
              </div>
            )}
            
            {/* Payment selection */}
            {showPaymentSelection && (
              <div className="mb-4">
                <PaymentSelection 
                  onPaymentSelect={handlePaymentSelect}
                  onToggleSplitFare={toggleSplitFare}
                  isSplitFareEnabled={isSplitFareEnabled}
                />
              </div>
            )}
            
            {/* Request ride button */}
            {canRequestRide && (
              <div className="mt-4 mb-6">
                <Button 
                  className="w-full py-6 text-lg rounded-xl"
                  onClick={handleRequestRide}
                >
                  Request Ride
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RiderDashboard;