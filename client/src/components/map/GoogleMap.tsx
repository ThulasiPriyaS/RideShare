import { useState, useEffect, useRef, useCallback } from 'react';
import { Car, Navigation, MapPin } from 'lucide-react';
import { loadGoogleMapsApi, isGoogleMapsLoaded } from '@/lib/googleMaps';

// Add window type declarations
declare global {
  interface Window {
    google?: typeof google;
  }
}

interface GoogleMapProps {
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

const GoogleMap: React.FC<GoogleMapProps> = ({
  pickup,
  destination,
  driverLocation,
  showLabels = false,
  height = "h-64",
  interactive = false,
  onMapClick
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const googleMapRef = useRef<google.maps.Map | null>(null);
  const pickupMarkerRef = useRef<google.maps.Marker | null>(null);
  const destMarkerRef = useRef<google.maps.Marker | null>(null);
  const driverMarkerRef = useRef<google.maps.Marker | null>(null);
  const directionsRendererRef = useRef<google.maps.DirectionsRenderer | null>(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Initialize Google Maps
  const initMap = useCallback(async () => {
    if (!mapRef.current) return;
    
    try {
      if (!isGoogleMapsLoaded()) {
        await loadGoogleMapsApi();
      }
      
      if (!window.google) {
        throw new Error('Google Maps failed to load');
      }
      
      // Create map instance
      const map = new window.google.maps.Map(mapRef.current, {
        center: { lat: 40.7128, lng: -74.0060 }, // New York by default
        zoom: 14,
        disableDefaultUI: true,
        zoomControl: true,
        mapTypeControl: false,
        streetViewControl: false,
      });
      
      googleMapRef.current = map;
      
      // Initialize directions renderer
      const directionsRenderer = new window.google.maps.DirectionsRenderer({
        suppressMarkers: true, // We'll use our own markers
        polylineOptions: {
          strokeColor: '#276EF1',
          strokeWeight: 5,
          strokeOpacity: 0.7
        }
      });
      directionsRenderer.setMap(map);
      directionsRendererRef.current = directionsRenderer;
      
      // Add click event listener if interactive
      if (interactive && onMapClick) {
        map.addListener('click', (e: google.maps.MapMouseEvent) => {
          if (e.latLng && onMapClick) {
            onMapClick(e.latLng.lat(), e.latLng.lng());
          }
        });
      }
      
      setIsLoading(false);
    } catch (err) {
      console.error('Error initializing map:', err);
      setError('Failed to load map. Please check your internet connection and try again.');
      setIsLoading(false);
    }
  }, [interactive, onMapClick]);
  
  // Update markers and directions when props change
  useEffect(() => {
    if (!googleMapRef.current || isLoading || !window.google) return;
    
    // Update pickup marker
    if (pickup) {
      const position = { lat: pickup.latitude, lng: pickup.longitude };
      
      if (!pickupMarkerRef.current) {
        pickupMarkerRef.current = new window.google.maps.Marker({
          position,
          map: googleMapRef.current,
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            fillColor: '#276EF1',
            fillOpacity: 0.9,
            strokeColor: '#ffffff',
            strokeWeight: 2,
            scale: 8
          },
          title: pickup.name || 'Pickup'
        });
      } else {
        pickupMarkerRef.current.setPosition(position);
      }
    } else if (pickupMarkerRef.current) {
      pickupMarkerRef.current.setMap(null);
      pickupMarkerRef.current = null;
    }
    
    // Update destination marker
    if (destination) {
      const position = { lat: destination.latitude, lng: destination.longitude };
      
      if (!destMarkerRef.current) {
        destMarkerRef.current = new window.google.maps.Marker({
          position,
          map: googleMapRef.current,
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            fillColor: '#27AE60',
            fillOpacity: 0.9,
            strokeColor: '#ffffff',
            strokeWeight: 2,
            scale: 8
          },
          title: destination.name || 'Destination'
        });
      } else {
        destMarkerRef.current.setPosition(position);
      }
    } else if (destMarkerRef.current) {
      destMarkerRef.current.setMap(null);
      destMarkerRef.current = null;
    }
    
    // Update driver marker
    if (driverLocation) {
      const position = { lat: driverLocation.latitude, lng: driverLocation.longitude };
      
      if (!driverMarkerRef.current) {
        driverMarkerRef.current = new window.google.maps.Marker({
          position,
          map: googleMapRef.current,
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            fillColor: '#F5A623',
            fillOpacity: 0.9,
            strokeColor: '#ffffff',
            strokeWeight: 2,
            scale: 10
          },
          title: 'Driver'
        });
      } else {
        driverMarkerRef.current.setPosition(position);
      }
    } else if (driverMarkerRef.current) {
      driverMarkerRef.current.setMap(null);
      driverMarkerRef.current = null;
    }
    
    // Calculate and display route if both pickup and destination are set
    if (pickup && destination && directionsRendererRef.current) {
      const directionsService = new window.google.maps.DirectionsService();
      
      directionsService.route(
        {
          origin: { lat: pickup.latitude, lng: pickup.longitude },
          destination: { lat: destination.latitude, lng: destination.longitude },
          travelMode: window.google.maps.TravelMode.DRIVING
        },
        (result: google.maps.DirectionsResult | null, status: google.maps.DirectionsStatus) => {
          if (status === window.google!.maps.DirectionsStatus.OK && result) {
            if (directionsRendererRef.current) {
              directionsRendererRef.current.setDirections(result);
            }
            
            // Fit bounds to show all markers and the route
            if (googleMapRef.current) {
              const bounds = new window.google.maps.LatLngBounds();
              bounds.extend({ lat: pickup.latitude, lng: pickup.longitude });
              bounds.extend({ lat: destination.latitude, lng: destination.longitude });
              
              if (driverLocation) {
                bounds.extend({ lat: driverLocation.latitude, lng: driverLocation.longitude });
              }
              
              googleMapRef.current.fitBounds(bounds);
            }
          }
        }
      );
    } else if (directionsRendererRef.current) {
      directionsRendererRef.current.setDirections({ routes: [] } as google.maps.DirectionsResult);
      
      // If only one location is set, center on it
      if (pickup && googleMapRef.current) {
        googleMapRef.current.setCenter({ lat: pickup.latitude, lng: pickup.longitude });
        googleMapRef.current.setZoom(15);
      } else if (destination && googleMapRef.current) {
        googleMapRef.current.setCenter({ lat: destination.latitude, lng: destination.longitude });
        googleMapRef.current.setZoom(15);
      } else if (driverLocation && googleMapRef.current) {
        googleMapRef.current.setCenter({ lat: driverLocation.latitude, lng: driverLocation.longitude });
        googleMapRef.current.setZoom(15);
      }
    }
  }, [pickup, destination, driverLocation, isLoading]);
  
  // Initialize map when component mounts
  useEffect(() => {
    initMap();
    
    // Cleanup function to remove markers and event listeners
    return () => {
      if (pickupMarkerRef.current) {
        pickupMarkerRef.current.setMap(null);
      }
      if (destMarkerRef.current) {
        destMarkerRef.current.setMap(null);
      }
      if (driverMarkerRef.current) {
        driverMarkerRef.current.setMap(null);
      }
      if (directionsRendererRef.current) {
        directionsRendererRef.current.setMap(null);
      }
    };
  }, [initMap]);
  
  // Handle window resize
  useEffect(() => {
    if (!window.google) return;
    
    const handleResize = () => {
      if (googleMapRef.current && window.google) {
        window.google.maps.event.trigger(googleMapRef.current, 'resize');
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  return (
    <div className={`relative rounded-xl overflow-hidden ${height}`}>
      {isLoading && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
          <div className="animate-spin w-10 h-10 border-4 border-[#276EF1] border-t-transparent rounded-full"></div>
        </div>
      )}
      
      {error && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
          <div className="text-red-500 text-center p-4">
            <p>{error}</p>
            <button 
              className="mt-2 px-4 py-2 bg-[#276EF1] text-white rounded-lg"
              onClick={() => {
                setError(null);
                setIsLoading(true);
                initMap();
              }}
            >
              Retry
            </button>
          </div>
        </div>
      )}
      
      <div ref={mapRef} className="w-full h-full"></div>
      
      {/* Map controls */}
      <div className="absolute bottom-4 right-4 flex flex-col space-y-2">
        <button 
          className="w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center"
          onClick={() => {
            if (googleMapRef.current) {
              googleMapRef.current.setZoom((googleMapRef.current.getZoom() || 14) + 1);
            }
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#6E6E6E]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </button>
        <button 
          className="w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center"
          onClick={() => {
            if (googleMapRef.current) {
              googleMapRef.current.setZoom((googleMapRef.current.getZoom() || 14) - 1);
            }
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#6E6E6E]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
          </svg>
        </button>
      </div>
      
      {/* Label overlays if showLabels is true */}
      {showLabels && (
        <div className="absolute top-4 left-4 right-4 flex justify-between">
          {pickup && (
            <div className="bg-white px-3 py-2 rounded-lg shadow-md flex items-center">
              <MapPin className="h-5 w-5 text-[#276EF1] mr-2" />
              <span className="font-medium text-sm">{pickup.name || 'Pickup'}</span>
            </div>
          )}
          
          {destination && (
            <div className="bg-white px-3 py-2 rounded-lg shadow-md flex items-center ml-auto">
              <Navigation className="h-5 w-5 text-[#27AE60] mr-2" />
              <span className="font-medium text-sm">{destination.name || 'Destination'}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GoogleMap;