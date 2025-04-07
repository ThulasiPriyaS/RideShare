import { useEffect, useState } from 'react';
import { Clock, MapPin, User, Car } from 'lucide-react';
import RealTimeMap from '@/components/map/RealTimeMap';
import { subscribeToRideUpdates } from '@/lib/supabaseRealtime';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Location } from '@shared/schema';

interface RideWaitingProps {
  rideId: number;
  onRideAccepted: (driverId: number) => void;
  onCancel: () => void;
  pickup: Location | null;
  destination: Location | null;
}

const RideWaiting: React.FC<RideWaitingProps> = ({ 
  rideId, 
  onRideAccepted, 
  onCancel,
  pickup,
  destination
}) => {
  const [elapsedTime, setElapsedTime] = useState(0);
  const [rideDetails, setRideDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Fetch initial ride details
  useEffect(() => {
    const fetchRide = async () => {
      try {
        const response = await apiRequest('GET', `/api/rides/${rideId}`);
        if (response.ok) {
          const data = await response.json();
          setRideDetails(data);
        }
      } catch (error) {
        console.error('Error fetching ride details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRide();
  }, [rideId]);

  // Setup real-time updates
  useEffect(() => {
    let unsubscribe: (() => void) | null = null;
    
    const setupRealtime = async () => {
      unsubscribe = await subscribeToRideUpdates(rideId, (updatedRide) => {
        console.log('Ride updated:', updatedRide);
        
        // Check if ride was accepted by a driver
        if ((updatedRide.status === 'in_progress' || updatedRide.status === 'accepted') && updatedRide.driverId) {
          // Fetch driver details to show in notification
          apiRequest('GET', `/api/drivers/${updatedRide.driverId}`)
            .then(response => response.json())
            .then(driverData => {
              toast({
                title: "Driver found!",
                description: `${driverData.name || 'Your driver'} (${driverData.vehicle}) is on the way!`,
              });
            })
            .catch(err => {
              console.error('Error fetching driver details:', err);
              toast({
                title: "Driver found!",
                description: "A driver has accepted your ride request.",
              });
            });
          
          onRideAccepted(updatedRide.driverId);
        }
        
        setRideDetails(updatedRide);
      });
    };
    
    setupRealtime();
    
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [rideId, onRideAccepted, toast]);

  // Timer for elapsed time
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedTime(prev => prev + 1);
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);

  // Format elapsed time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Handle canceling the ride
  const handleCancelRide = async () => {
    try {
      const response = await apiRequest('POST', `/api/rides/${rideId}/cancel`, {});
      
      if (response.ok) {
        toast({
          title: "Ride canceled",
          description: "Your ride request has been canceled.",
        });
        onCancel();
      } else {
        toast({
          title: "Error",
          description: "Could not cancel the ride. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error canceling ride:', error);
      toast({
        title: "Error",
        description: "Could not cancel the ride. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Map */}
      <div className="flex-1 relative">
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
          showLabels={true}
          height="h-full"
        />
        
        {/* Status overlay */}
        <div className="absolute inset-x-0 top-0 p-4">
          <div className="bg-white rounded-lg shadow-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center mr-3">
                  <Car className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">Finding your driver</h3>
                  <div className="text-sm text-gray-500 flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    <span>Elapsed: {formatTime(elapsedTime)}</span>
                  </div>
                </div>
              </div>
              
              <div className="w-10 h-10 flex items-center justify-center">
                <div className="w-5 h-5 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Bottom panel */}
        <div className="absolute inset-x-0 bottom-0 bg-white p-4 rounded-t-xl shadow-lg">
          <div className="space-y-4">
            <div className="flex space-x-2">
              <div className="w-6 flex flex-col items-center">
                <div className="w-3 h-3 rounded-full bg-primary"></div>
                <div className="w-0.5 h-10 bg-gray-200"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
              </div>
              
              <div className="space-y-2 flex-1">
                <div>
                  <div className="text-xs text-gray-500">PICKUP</div>
                  <div className="text-sm font-medium">{pickup?.name || 'Loading...'}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">DESTINATION</div>
                  <div className="text-sm font-medium">{destination?.name || 'Loading...'}</div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <div>
                <div className="text-xs text-gray-500">ESTIMATED FARE</div>
                <div className="text-xl font-bold">₹{rideDetails?.fare?.toFixed(2) || '0.00'}</div>
              </div>
              
              <Button 
                variant="outline" 
                className="border-red-500 text-red-500 hover:bg-red-50"
                onClick={handleCancelRide}
              >
                Cancel Ride
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RideWaiting;