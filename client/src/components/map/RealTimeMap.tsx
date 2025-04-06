import { useState, useEffect } from 'react';
import { Car, Navigation, MapPin } from 'lucide-react';
import MockMap from '@/lib/mockMap';

interface RealTimeMapProps {
  pickup?: {
    latitude: number;
    longitude: number;
    name: string;
  };
  destination?: {
    latitude: number;
    longitude: number;
    name: string;
  };
  driverLocation?: {
    latitude: number;
    longitude: number;
  };
  showLabels?: boolean;
  height?: string;
  interactive?: boolean;
  onMapClick?: (lat: number, lng: number) => void;
}

const RealTimeMap: React.FC<RealTimeMapProps> = ({
  pickup,
  destination,
  driverLocation,
  showLabels = false,
  height = "h-64",
  interactive = false,
  onMapClick
}) => {
  const [currentDriverLocation, setCurrentDriverLocation] = useState(driverLocation);
  const [isSimulating, setIsSimulating] = useState(false);

  // Simulate driver movement towards pickup or destination
  useEffect(() => {
    if (!driverLocation || !pickup || isSimulating) return;
    
    // Start driver simulation
    setIsSimulating(true);
    
    // Route points simulating a path (in a real app, this would be from a routing API)
    const simulateMovement = () => {
      const interval = setInterval(() => {
        setCurrentDriverLocation(prev => {
          if (!prev) return driverLocation;
          
          // Target is pickup location if driver hasn't reached pickup yet
          const target = pickup;
          
          // Move driver slightly towards target
          const latDiff = target.latitude - prev.latitude;
          const lngDiff = target.longitude - prev.longitude;
          
          // If driver is very close to target, stop simulation
          if (Math.abs(latDiff) < 0.0001 && Math.abs(lngDiff) < 0.0001) {
            clearInterval(interval);
            return prev;
          }
          
          // Move 10% of the remaining distance each time
          return {
            latitude: prev.latitude + latDiff * 0.1,
            longitude: prev.longitude + lngDiff * 0.1
          };
        });
      }, 2000); // Update every 2 seconds
      
      return () => clearInterval(interval);
    };
    
    const cleanup = simulateMovement();
    return cleanup;
  }, [driverLocation, pickup, isSimulating]);

  // Handle map click for interactive maps
  const handleMapClick = () => {
    if (interactive && onMapClick) {
      // Generate random coordinates near the current view
      const baseLat = 40.7128; // New York latitude
      const baseLng = -74.0060; // New York longitude
      const lat = baseLat + (Math.random() - 0.5) * 0.02;
      const lng = baseLng + (Math.random() - 0.5) * 0.02;
      
      onMapClick(lat, lng);
    }
  };

  return (
    <MockMap className={`relative rounded-xl overflow-hidden ${height}`}>
      {/* Display a simulated map with markers */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#E6EFFE] to-[#F3F8FF]">
        {/* Simulated roads */}
        <div className="absolute left-[10%] right-[10%] top-1/2 h-1 bg-[#E0E0E0] transform -translate-y-1/2"></div>
        <div className="absolute top-[10%] bottom-[10%] left-1/2 w-1 bg-[#E0E0E0] transform -translate-x-1/2"></div>
        <div className="absolute left-[30%] right-[10%] top-[30%] h-1 bg-[#E0E0E0] transform rotate-45"></div>
        
        {/* Pickup location marker */}
        {pickup && (
          <div className="absolute w-8 h-8" style={{ 
            left: `${((pickup.longitude + 74.01) / 0.02) * 20}%`, 
            top: `${((40.75 - pickup.latitude) / 0.05) * 20}%` 
          }}>
            <div className="w-8 h-8 rounded-full bg-[#276EF1]/20 flex items-center justify-center">
              <MapPin className="h-5 w-5 text-[#276EF1]" />
            </div>
            {showLabels && (
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 whitespace-nowrap">
                <div className="text-xs font-medium bg-white px-2 py-1 rounded shadow-sm">
                  Pickup
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Destination marker */}
        {destination && (
          <div className="absolute w-8 h-8" style={{ 
            left: `${((destination.longitude + 74.01) / 0.02) * 20}%`, 
            top: `${((40.75 - destination.latitude) / 0.05) * 20}%` 
          }}>
            <div className="w-8 h-8 rounded-full bg-[#27AE60]/20 flex items-center justify-center">
              <Navigation className="h-5 w-5 text-[#27AE60]" />
            </div>
            {showLabels && (
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 whitespace-nowrap">
                <div className="text-xs font-medium bg-white px-2 py-1 rounded shadow-sm">
                  Destination
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Driver location marker with animation */}
        {currentDriverLocation && (
          <div 
            className="absolute w-10 h-10 transition-all duration-1000 ease-in-out"
            style={{ 
              left: `${((currentDriverLocation.longitude + 74.01) / 0.02) * 20}%`, 
              top: `${((40.75 - currentDriverLocation.latitude) / 0.05) * 20}%` 
            }}
          >
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-[#F5A623] flex items-center justify-center animate-pulse">
                <Car className="h-6 w-6 text-white" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-[#27AE60] border-2 border-white"></div>
            </div>
            {showLabels && (
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 whitespace-nowrap">
                <div className="text-xs font-medium bg-white px-2 py-1 rounded shadow-sm">
                  Your Driver
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Interactive overlay for clickable map */}
      {interactive && (
        <div 
          className="absolute inset-0 cursor-pointer"
          onClick={handleMapClick}
        ></div>
      )}
      
      {/* Map controls */}
      <div className="absolute bottom-4 right-4 flex flex-col space-y-2">
        <button className="w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#6E6E6E]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </button>
        <button className="w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#6E6E6E]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
          </svg>
        </button>
      </div>
    </MockMap>
  );
};

export default RealTimeMap;