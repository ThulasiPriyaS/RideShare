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

      <div className="space-y-3">
        {vehicleTypes.map((vehicle) => (
          <div 
            key={vehicle.id}
            className={`flex items-center p-3 rounded-lg border-2 cursor-pointer transition-all ${
              selectedVehicle === vehicle.id 
                ? `border-[${vehicle.color}] bg-[${vehicle.color}]/5` 
                : "border-transparent hover:border-gray-200"
            }`}
            onClick={() => handleVehicleSelection(vehicle)}
          >
            <div 
              className={`w-12 h-12 rounded-full flex items-center justify-center mr-3`}
              style={{ backgroundColor: `${vehicle.color}20` }}
            >
              <div className="text-[#276EF1]" style={{ color: vehicle.color }}>
                {getVehicleIcon(vehicle.icon)}
              </div>
            </div>
            <div className="flex-1">
              <div className="flex justify-between">
                <div>
                  <div className="font-medium">{vehicle.name}</div>
                  <div className="text-xs text-[#6E6E6E]">{vehicle.description}</div>
                </div>
                <div className="text-right">
                  <div className="font-semibold">${calculateFare(vehicle.baseRate).toFixed(2)}</div>
                  <div className="text-xs text-[#6E6E6E]">{vehicle.capacity} seats</div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VehicleSelection;