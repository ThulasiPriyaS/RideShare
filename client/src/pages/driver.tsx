import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import RealTimeMap from '@/components/map/RealTimeMap';
import { Car, Clock, Navigation, MapPin, Zap, CheckCircle, XCircle, Star } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import RideCompletion from '@/components/driver/RideCompletionWrapper';

// Driver interface
interface DriverState {
  isVerified: boolean;
  isActive: boolean;
  currentRide: any | null;
  pendingRide: any | null;
  earnings: number;
  rating: number;
  totalRides: number;
  vehicle: string;
  licensePlate: string;
}

// Mock initial state
const initialDriverState: DriverState = {
  isVerified: false,
  isActive: false,
  currentRide: null,
  pendingRide: null,
  earnings: 0,
  rating: 4.8,
  totalRides: 42,
  vehicle: '',
  licensePlate: '',
};

const DriverPage = () => {
  const [driverState, setDriverState] = useState<DriverState>(initialDriverState);
  const [isVerifying, setIsVerifying] = useState(false);
  const { toast } = useToast();

  // Check for pending rides from backend using Supabase real-time
  useEffect(() => {
    if (!driverState.isActive || driverState.currentRide || driverState.pendingRide) {
      return; // Don't check if not active or already have a ride
    }

    // Initial check for pending rides
    const checkForRides = async () => {
      try {
        const response = await apiRequest("GET", "/api/driver/pending-rides");
        const pendingRides = await response.json();
        
        if (pendingRides && pendingRides.length > 0) {
          handleNewRide(pendingRides[0]);
        }
      } catch (error) {
        console.error("Error checking for rides:", error);
      }
    };
    
    // Function to process a new ride
    const handleNewRide = (ride: any) => {
      // Parse locations from strings if needed
      let pickup, destination;
      
      try {
        pickup = typeof ride.pickupLocation === 'string' 
          ? JSON.parse(ride.pickupLocation) 
          : ride.pickupLocation;
          
        destination = typeof ride.destination === 'string' 
          ? JSON.parse(ride.destination) 
          : ride.destination;
      } catch (e) {
        // Use fallback locations if parsing fails
        pickup = {
          latitude: 40.748,
          longitude: -73.985,
          name: 'Pickup Location',
        };
        
        destination = {
          latitude: 40.758,
          longitude: -73.977,
          name: 'Destination',
        };
      }
      
      // Use the rider's name and rating if available (from priority matching)
      const riderName = ride.riderName || 'Rider';
      const riderRating = ride.riderRating || 4.5;
      
      setDriverState(prev => ({
        ...prev,
        pendingRide: {
          id: ride.id,
          userId: ride.riderId,
          userName: riderName,
          pickup,
          destination,
          distance: '1.2 miles', // Calculate based on coordinates
          estimatedTime: '9 mins', // Calculate based on distance
          fare: ride.fare || 12.50,
          paymentMethod: 'Card',
          rating: riderRating, // Use the rating from the server
          totalRides: ride.totalRides || 10, // Use totalRides from server if available
          isPriorityRider: riderRating >= 4.8, // Mark high-rated riders as priority
        }
      }));
      
      // Notify driver with a sound and toast
      toast({
        title: riderRating >= 4.8 ? "⭐ Priority ride request!" : "New ride request!",
        description: `${pickup.name} → ${destination.name}${riderRating >= 4.8 ? ' (High-rated rider)' : ''}`,
        variant: riderRating >= 4.8 ? "default" : undefined,
      });
    };

    // Check immediately on first load
    checkForRides();
    
    // Setup real-time updates for new rides
    import('@/lib/supabaseRealtime').then(({ subscribeToNewRides }) => {
      let unsubscribe: (() => void) | null = null;
      
      const setupRealtime = async () => {
        unsubscribe = await subscribeToNewRides(handleNewRide);
      };
      
      setupRealtime();
      
      return () => {
        if (unsubscribe) {
          unsubscribe();
        }
      };
    });
    
  }, [driverState.isActive, driverState.currentRide, driverState.pendingRide, toast]);

  // Handle driver verification
  const handleVerifyDriver = () => {
    setIsVerifying(true);
    
    // Simulate verification process
    setTimeout(() => {
      setDriverState({
        ...driverState,
        isVerified: true,
        vehicle: 'Toyota Camry',
        licensePlate: 'ABC-1234',
      });
      setIsVerifying(false);
      
      toast({
        title: 'Verification successful!',
        description: 'You can now start accepting rides.',
        variant: 'default',
      });
    }, 2000);
  };

  // Handle toggling active status
  const handleToggleActive = () => {
    setDriverState(prev => ({
      ...prev,
      isActive: !prev.isActive
    }));
    
    toast({
      title: driverState.isActive ? 'You are now offline' : 'You are now online',
      description: driverState.isActive 
        ? 'You will not receive any ride requests' 
        : 'You will start receiving ride requests',
      variant: 'default',
    });
  };

  // Handle accepting a ride
  const handleAcceptRide = async () => {
    if (!driverState.pendingRide) return;
    
    try {
      // Assume the driver is ID 1 for demo
      const driverId = 1;
      
      // Notify the server
      const response = await apiRequest('POST', '/api/driver/accept-ride', { 
        rideId: driverState.pendingRide.id,
        driverId: driverId
      });
      
      if (response.ok) {
        toast({
          title: driverState.pendingRide.isPriorityRider ? '⭐ Priority ride accepted!' : 'Ride accepted!',
          description: 'Navigate to pickup location.',
          variant: 'default',
        });
        
        // Move pending ride to current ride
        setDriverState(prev => ({
          ...prev,
          currentRide: prev.pendingRide,
          pendingRide: null,
        }));
      } else {
        console.log("Using demo mode due to server error");
        
        // For demo purposes: proceed with UI flow even if server returns error
        toast({
          title: driverState.pendingRide.isPriorityRider ? '⭐ Priority ride accepted!' : 'Ride accepted!',
          description: 'Demo Mode: Navigate to pickup location.',
          variant: 'default',
        });
        
        // Move pending ride to current ride anyway to showcase UI
        setDriverState(prev => ({
          ...prev,
          currentRide: prev.pendingRide,
          pendingRide: null,
        }));
      }
    } catch (error) {
      console.error("Error accepting ride:", error);
      
      // For demo purposes: proceed with UI flow even on connection error
      console.log("Using demo mode due to connection error");
      toast({
        title: driverState.pendingRide.isPriorityRider ? '⭐ Priority ride accepted! (Demo)' : 'Ride accepted! (Demo)',
        description: 'Demo Mode: Navigate to pickup location.',
        variant: 'default',
      });
      
      // Move pending ride to current ride anyway to showcase UI
      setDriverState(prev => ({
        ...prev,
        currentRide: prev.pendingRide,
        pendingRide: null,
      }));
    }
  };

  // Handle rejecting a ride
  const handleRejectRide = async () => {
    if (!driverState.pendingRide) return;
    
    try {
      // Notify the server
      const response = await apiRequest('POST', '/api/driver/reject-ride', { 
        rideId: driverState.pendingRide.id
      });
      
      if (response.ok) {
        toast({
          title: 'Ride rejected',
          description: 'You can continue receiving other requests.',
          variant: 'default',
        });
        
        setDriverState(prev => ({
          ...prev,
          pendingRide: null,
        }));
      } else {
        console.log("Using demo mode due to server error");
        
        // For demo purposes: proceed with UI flow even if server returns error
        toast({
          title: 'Ride rejected',
          description: 'Demo Mode: You can continue receiving other requests.',
          variant: 'default',
        });
        
        // Clear the pending ride anyway to allow new requests
        setDriverState(prev => ({
          ...prev,
          pendingRide: null,
        }));
      }
    } catch (error) {
      console.error("Error rejecting ride:", error);
      // For demo purposes, still proceed with UI flow
      toast({
        title: 'Ride rejected (Demo)',
        description: 'Demo Mode: You can continue receiving other requests.',
        variant: 'default',
      });
      
      // Still clear the pending ride to allow new requests
      setDriverState(prev => ({
        ...prev,
        pendingRide: null,
      }));
    }
  };

  // Handle completing a ride
  const handleCompleteRide = async () => {
    if (!driverState.currentRide) return;
    
    setDriverState(prev => ({
      ...prev,
      currentRide: {
        ...prev.currentRide,
        showCompletionUI: true
      }
    }));
  };
  
  // Handle when both rider and driver have confirmed the ride is complete
  const handleRideFullyComplete = async () => {
    if (!driverState.currentRide) return;
    
    const ride = driverState.currentRide;
    const fare = ride.fare;
    const isPriorityRider = ride.rating >= 4.8;
    
    // Add bonus for completing priority rides (10% bonus)
    const priorityBonus = isPriorityRider ? fare * 0.1 : 0;
    const totalEarnings = fare + priorityBonus;
    
    setDriverState(prev => ({
      ...prev,
      currentRide: null,
      earnings: prev.earnings + totalEarnings,
      totalRides: prev.totalRides + 1,
    }));
    
    // Show appropriate toast message based on rider priority status
    if (isPriorityRider) {
      toast({
        title: '⭐ Priority Ride Completed!',
        description: `You earned ₹${fare.toFixed(2)} + ₹${priorityBonus.toFixed(2)} priority bonus.`,
        variant: 'default',
      });
    } else {
      toast({
        title: 'Ride completed!',
        description: `You earned ₹${fare.toFixed(2)}.`,
        variant: 'default',
      });
    }
    
    // Show tip about priority riders occasionally
    if (Math.random() > 0.7) {
      setTimeout(() => {
        toast({
          title: 'Driver Tip',
          description: 'Rides with high-rated priority riders earn you extra bonuses!',
          variant: 'default',
        });
      }, 1500);
    }
  };

  // Verification screen
  if (!driverState.isVerified) {
    return (
      <div className="container max-w-md mx-auto py-8 px-4">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold mb-2">Driver Verification</h1>
          <p className="text-gray-600">Complete verification to start accepting rides</p>
        </div>
        
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Vehicle Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Vehicle Model</label>
              <input 
                type="text" 
                className="w-full p-2 border rounded-md"
                placeholder="e.g. Toyota Camry"
                value={driverState.vehicle}
                onChange={(e) => setDriverState(prev => ({ ...prev, vehicle: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">License Plate</label>
              <input 
                type="text" 
                className="w-full p-2 border rounded-md"
                placeholder="e.g. ABC-1234"
                value={driverState.licensePlate}
                onChange={(e) => setDriverState(prev => ({ ...prev, licensePlate: e.target.value }))}
              />
            </div>
          </div>
        </Card>
        
        <Button 
          className="w-full py-6" 
          onClick={handleVerifyDriver}
          disabled={isVerifying}
        >
          {isVerifying ? 'Verifying...' : 'Complete Verification'}
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-md pb-24 h-full flex flex-col">
      {/* Driver status bar */}
      <div className="p-4 bg-white sticky top-0 z-10 border-b">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="font-bold">{driverState.vehicle}</h2>
            <p className="text-sm text-gray-500">{driverState.licensePlate}</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={driverState.isActive ? "default" : "outline"}>
              {driverState.isActive ? 'Online' : 'Offline'}
            </Badge>
            <Button
              variant={driverState.isActive ? "destructive" : "default"}
              size="sm"
              onClick={handleToggleActive}
            >
              {driverState.isActive ? 'Go Offline' : 'Go Online'}
            </Button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 p-4 bg-white">
        <div className="text-center">
          <p className="text-sm text-gray-500">Rating</p>
          <div className="font-bold flex items-center justify-center">
            <Star className="h-4 w-4 text-yellow-500 mr-1" fill="currentColor" />
            {driverState.rating}
          </div>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-500">Earnings</p>
          <p className="font-bold">₹{driverState.earnings.toFixed(2)}</p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-500">Rides</p>
          <p className="font-bold">{driverState.totalRides}</p>
        </div>
      </div>

      {/* Map */}
      <div className="flex-1 min-h-[300px] overflow-hidden">
        <RealTimeMap 
          pickup={driverState.currentRide?.pickup}
          destination={driverState.currentRide?.destination}
          height="h-full"
          showLabels={true}
        />
      </div>

      {/* Ride details */}
      {driverState.currentRide && (
        <div className="p-4 bg-white border-t">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-full bg-[#276EF1]/20 flex items-center justify-center">
              <UserCog className="h-6 w-6 text-[#276EF1]" />
            </div>
            <div>
              <div className="font-semibold flex items-center">
                {driverState.currentRide.userName}
                {driverState.currentRide.rating >= 4.8 && (
                  <span className="ml-2 text-xs text-yellow-500 font-normal">Top Rated</span>
                )}
              </div>
              <div className="text-sm text-gray-500 flex items-center">
                <Star className={`h-3 w-3 mr-1 ${driverState.currentRide.rating >= 4.8 ? 'text-yellow-500' : 'text-gray-400'}`} fill="currentColor" />
                <span className={driverState.currentRide.rating >= 4.8 ? 'text-yellow-600 font-medium' : ''}>
                  {driverState.currentRide.rating}
                </span> • {driverState.currentRide.totalRides} rides
              </div>
            </div>
          </div>
          
          <div className="space-y-2 mb-4">
            <div className="flex items-center">
              <div className="mr-2">
                <div className="h-6 w-6 rounded-full bg-[#276EF1]/20 flex items-center justify-center">
                  <MapPin className="h-3 w-3 text-[#276EF1]" />
                </div>
              </div>
              <div className="text-sm">{driverState.currentRide.pickup.name}</div>
            </div>
            <div className="flex items-center">
              <div className="mr-2">
                <div className="h-6 w-6 rounded-full bg-[#27AE60]/20 flex items-center justify-center">
                  <Navigation className="h-3 w-3 text-[#27AE60]" />
                </div>
              </div>
              <div className="text-sm">{driverState.currentRide.destination.name}</div>
            </div>
          </div>
          
          <div className="flex items-center justify-between text-sm mb-4">
            <div className="flex items-center">
              <Clock className="h-4 w-4 text-gray-500 mr-1" />
              {driverState.currentRide.estimatedTime}
            </div>
            <div className="flex items-center">
              <MapPin className="h-4 w-4 text-gray-500 mr-1" />
              {driverState.currentRide.distance}
            </div>
            <div className="flex items-center font-medium">
              <Zap className="h-4 w-4 text-[#276EF1] mr-1" />
              ₹{driverState.currentRide.fare.toFixed(2)}
            </div>
          </div>
          
          {driverState.currentRide.showCompletionUI ? (
            <RideCompletion 
              rideId={driverState.currentRide.id}
              onComplete={handleRideFullyComplete}
            />
          ) : (
            <Button 
              className="w-full" 
              onClick={handleCompleteRide}
            >
              Complete Ride
            </Button>
          )}
        </div>
      )}

      {/* Ride request */}
      {driverState.pendingRide && !driverState.currentRide && (
        <div className="fixed inset-x-0 bottom-0 bg-white shadow-lg p-4 space-y-4 rounded-t-xl">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2">
              <h3 className="text-lg font-bold">New Ride Request</h3>
              {driverState.pendingRide.isPriorityRider && (
                <Badge className="bg-yellow-500 hover:bg-yellow-600 animate-pulse">⭐ Priority Rider</Badge>
              )}
            </div>
            <p className="text-sm text-gray-500">{driverState.pendingRide.distance} • {driverState.pendingRide.estimatedTime}</p>
          </div>
          
          <div className="flex items-center gap-2 mb-2">
            <div className="w-10 h-10 rounded-full bg-[#276EF1]/20 flex items-center justify-center">
              <UserCog className="h-6 w-6 text-[#276EF1]" />
            </div>
            <div>
              <div className="font-semibold flex items-center">
                {driverState.pendingRide.userName}
                {driverState.pendingRide.isPriorityRider && (
                  <span className="ml-2 text-xs text-yellow-500 font-normal">Top Rated</span>
                )}
              </div>
              <div className="text-sm text-gray-500 flex items-center">
                <Star className={`h-3 w-3 mr-1 ${driverState.pendingRide.isPriorityRider ? 'text-yellow-500' : 'text-gray-400'}`} fill="currentColor" />
                <span className={driverState.pendingRide.isPriorityRider ? 'text-yellow-600 font-medium' : ''}>
                  {driverState.pendingRide.rating}
                </span> • {driverState.pendingRide.totalRides} rides
              </div>
            </div>
          </div>
          
          <div className="space-y-2 mb-4">
            <div className="flex items-center">
              <div className="mr-2">
                <div className="h-6 w-6 rounded-full bg-[#276EF1]/20 flex items-center justify-center">
                  <MapPin className="h-3 w-3 text-[#276EF1]" />
                </div>
              </div>
              <div className="text-sm">{driverState.pendingRide.pickup.name}</div>
            </div>
            <div className="flex items-center">
              <div className="mr-2">
                <div className="h-6 w-6 rounded-full bg-[#27AE60]/20 flex items-center justify-center">
                  <Navigation className="h-3 w-3 text-[#27AE60]" />
                </div>
              </div>
              <div className="text-sm">{driverState.pendingRide.destination.name}</div>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              className="w-1/2 flex items-center justify-center" 
              onClick={handleRejectRide}
            >
              <XCircle className="mr-2 h-5 w-5" /> Decline
            </Button>
            <Button 
              className={`w-1/2 flex items-center justify-center ${driverState.pendingRide.isPriorityRider ? 'bg-yellow-500 hover:bg-yellow-600' : ''}`}
              onClick={handleAcceptRide}
            >
              <CheckCircle className="mr-2 h-5 w-5" /> 
              {driverState.pendingRide.isPriorityRider ? 'Accept Priority' : 'Accept'}
            </Button>
          </div>
        </div>
      )}

      {/* No rides message */}
      {!driverState.currentRide && !driverState.pendingRide && driverState.isActive && (
        <div className="p-4 mt-8 text-center">
          <div className="w-16 h-16 rounded-full bg-[#276EF1]/20 flex items-center justify-center mx-auto mb-4">
            <Car className="h-8 w-8 text-[#276EF1]" />
          </div>
          <h3 className="text-lg font-bold mb-2">Waiting for ride requests</h3>
          <p className="text-gray-500">You'll be notified when a new ride request comes in.</p>
        </div>
      )}

      {/* Offline message */}
      {!driverState.isActive && (
        <div className="p-4 mt-8 text-center">
          <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center mx-auto mb-4">
            <Car className="h-8 w-8 text-gray-500" />
          </div>
          <h3 className="text-lg font-bold mb-2">You're Offline</h3>
          <p className="text-gray-500 mb-4">Go online to start receiving ride requests.</p>
          <Button onClick={handleToggleActive}>Go Online</Button>
        </div>
      )}
    </div>
  );
};

export default DriverPage;

// Missing Component - Added to fix the error
const UserCog = ({ className = "" }) => {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 16.92v1.04a.73.73 0 0 1-.7.7l-1.18-.04a.3.3 0 0 0-.3.24l-.33.91a.3.3 0 0 0 .12.35l1.06.64c.25.15.3.49.12.7l-.9.91c-.2.2-.54.16-.7-.09l-.64-1.07a.3.3 0 0 0-.35-.12l-.9.33a.3.3 0 0 0-.25.3l.05 1.2a.73.73 0 0 1-.7.7h-1.04a.73.73 0 0 1-.7-.7l.04-1.19a.3.3 0 0 0-.24-.3l-.91-.33a.3.3 0 0 0-.35.12l-.64 1.07c-.14.23-.5.26-.7.09l-.9-.91a.5.5 0 0 1 .12-.7l1.06-.64a.3.3 0 0 0 .12-.35l-.33-.91a.3.3 0 0 0-.3-.24l-1.18.04a.73.73 0 0 1-.7-.7v-1.04c0-.38.3-.7.7-.7l1.18.04a.3.3 0 0 0 .3-.24l.33-.9a.3.3 0 0 0-.12-.35l-1.07-.65a.5.5 0 0 1-.12-.7l.9-.9c.2-.2.54-.16.7.1l.64 1.06a.3.3 0 0 0 .35.12l.9-.33a.3.3 0 0 0 .25-.3l-.05-1.19a.73.73 0 0 1 .7-.7h1.04c.38 0 .7.3.7.7l-.04 1.19a.3.3 0 0 0 .24.3l.9.33a.3.3 0 0 0 .36-.12l.64-1.07c.15-.24.48-.28.7-.1l.9.91a.5.5 0 0 1-.13.7l-1.06.64a.3.3 0 0 0-.12.35l.33.91a.3.3 0 0 0 .3.24l1.18-.04c.38 0 .7.3.7.7z" />
      <circle cx="18" cy="17.5" r="2" />
    </svg>
  );
};