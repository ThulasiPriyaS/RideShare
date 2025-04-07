import { useState } from "react";
import { Car, Bike, Users, Clock } from "lucide-react";
import { VehicleType } from "@shared/schema";

interface VehicleSelectionProps {
  onVehicleSelect: (vehicle: VehicleType) => void;
  estimatedTime: string;
  distance: string;
}

const VehicleSelection: React.FC<VehicleSelectionProps> = ({ onVehicleSelect, estimatedTime, distance }) => {
  // Available vehicle types with their details
  const vehicleTypes: VehicleType[] = [
    {
      id: "standard",
      name: "Standard",
      icon: "car",
      description: "Affordable, everyday rides",
      baseRate: 15,
      capacity: 4,
      color: "#276EF1"
    },
    {
      id: "premium",
      name: "Premium",
      icon: "car",
      description: "Luxury rides with top-rated drivers",
      baseRate: 25,
      capacity: 4,
      color: "#000000"
    },
    {
      id: "rideshare",
      name: "RideShare",
      icon: "users",
      description: "Share your ride, save money",
      baseRate: 10,
      capacity: 2,
      color: "#27AE60"
    },
    {
      id: "pinkbike",
      name: "Pink Bike",
      icon: "bike",
      description: "Quick, convenient rides on two wheels",
      baseRate: 8,
      capacity: 1,
      color: "#F06292"
    }
  ];

  const [selectedVehicle, setSelectedVehicle] = useState<string>(vehicleTypes[0].id);

  const handleVehicleSelection = (vehicle: VehicleType) => {
    setSelectedVehicle(vehicle.id);
    onVehicleSelect(vehicle);
  };

  const getVehicleIcon = (icon: string) => {
    switch (icon) {
      case "car":
        return <Car className="h-6 w-6" />;
      case "bike":
        return <Bike className="h-6 w-6" />;
      case "users":
        return <Users className="h-6 w-6" />;
      default:
        return <Car className="h-6 w-6" />;
    }
  };

  const calculateFare = (baseRate: number): number => {
    // Simple formula for calculating fare based on distance
    const distanceValue = parseFloat(distance.replace(/[^0-9.]/g, ""));
    return baseRate + (distanceValue * 2);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-4">
      <div className="flex items-center mb-4">
        <div className="mr-2">
          <Clock className="h-5 w-5 text-[#6E6E6E]" />
        </div>
        <div className="text-sm">
          <span className="font-medium">{estimatedTime}</span>
          <span className="text-[#6E6E6E] ml-2">{distance}</span>
        </div>
      </div>

      {/* Horizontal scrollable vehicle options */}
      <div className="overflow-x-auto pb-2 -mx-1 px-1">
        <div className="flex space-x-3 min-w-max">
          {vehicleTypes.map((vehicle) => (
            <div 
              key={vehicle.id}
              className={`flex-shrink-0 w-48 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                selectedVehicle === vehicle.id 
                  ? `border-${vehicle.color} bg-opacity-5` 
                  : "border-transparent hover:border-gray-200"
              }`}
              style={{ 
                borderColor: selectedVehicle === vehicle.id ? vehicle.color : 'transparent',
                backgroundColor: selectedVehicle === vehicle.id ? `${vehicle.color}10` : ''
              }}
              onClick={() => handleVehicleSelection(vehicle)}
            >
              <div className="flex items-center mb-2">
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center mr-2"
                  style={{ backgroundColor: `${vehicle.color}20` }}
                >
                  <div style={{ color: vehicle.color }}>
                    {getVehicleIcon(vehicle.icon)}
                  </div>
                </div>
                <div className="font-medium">{vehicle.name}</div>
              </div>
              
              <div className="text-xs text-[#6E6E6E] mb-1">{vehicle.description}</div>
              
              <div className="flex justify-between items-center">
                <div className="font-semibold">${calculateFare(vehicle.baseRate).toFixed(2)}</div>
                <div className="text-xs text-[#6E6E6E]">{vehicle.capacity} seats</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Scroll indicator */}
      <div className="flex justify-center mt-2">
        <div className="flex space-x-1">
          {vehicleTypes.map((vehicle, index) => (
            <div 
              key={vehicle.id}
              className={`w-2 h-2 rounded-full ${
                selectedVehicle === vehicle.id 
                  ? 'bg-gray-800' 
                  : 'bg-gray-300'
              }`}
            ></div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VehicleSelection;