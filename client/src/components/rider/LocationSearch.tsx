import { useState, useEffect, useRef, useCallback } from "react";
import { MapPin, Search } from "lucide-react";
import { Location } from "@shared/schema";
import { getPlacePredictions, getPlaceDetails, loadGoogleMapsApi, isGoogleMapsLoaded } from "@/lib/googleMaps";

interface LocationSearchProps {
  placeholder: string;
  onLocationSelect: (location: Location) => void;
  initialValue?: string;
}

interface Prediction {
  place_id: string;
  description: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
}

const LocationSearch: React.FC<LocationSearchProps> = ({ 
  placeholder, 
  onLocationSelect, 
  initialValue = "" 
}) => {
  const [searchTerm, setSearchTerm] = useState(initialValue);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [useGooglePlaces, setUseGooglePlaces] = useState(true);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const searchTimeout = useRef<NodeJS.Timeout>();

  // Mock location suggestions - fallback if Google Places API is unavailable
  const mockLocations: Location[] = [
    { id: "1", name: "Central Park", address: "New York, NY", latitude: 40.785091, longitude: -73.968285 },
    { id: "2", name: "Empire State Building", address: "350 5th Ave, New York, NY", latitude: 40.748817, longitude: -73.985428 },
    { id: "3", name: "Times Square", address: "Manhattan, NY", latitude: 40.758896, longitude: -73.985130 },
    { id: "4", name: "Brooklyn Bridge", address: "Brooklyn Bridge, New York, NY", latitude: 40.706086, longitude: -73.996864 },
    { id: "5", name: "Grand Central Terminal", address: "89 E 42nd St, New York, NY", latitude: 40.752726, longitude: -73.977229 },
    { id: "6", name: "Rockefeller Center", address: "45 Rockefeller Plaza, New York, NY", latitude: 40.758740, longitude: -73.978674 },
    { id: "7", name: "Madison Square Garden", address: "4 Pennsylvania Plaza, New York, NY", latitude: 40.750504, longitude: -73.993439 },
  ];

  // Initialize Google Maps API when component mounts
  useEffect(() => {
    const initGoogleMaps = async () => {
      try {
        if (!isGoogleMapsLoaded()) {
          await loadGoogleMapsApi();
        }
      } catch (error) {
        console.error('Failed to load Google Maps API:', error);
        setUseGooglePlaces(false);
      }
    };

    initGoogleMaps();
  }, []);

  // Function to search for locations using Google Places API
  const searchLocationsWithGoogle = useCallback(async (term: string) => {
    if (term.trim() === "") {
      setPredictions([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const results = await getPlacePredictions(term);
      setPredictions(results);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching place predictions:', error);
      setUseGooglePlaces(false);
      
      // Fallback to mock data
      const filteredLocations = mockLocations.filter(
        location => location.name.toLowerCase().includes(term.toLowerCase()) || 
                    location.address.toLowerCase().includes(term.toLowerCase())
      );
      
      // Convert mock locations to prediction format
      const mockPredictions = filteredLocations.map(location => ({
        place_id: location.id,
        description: `${location.name}, ${location.address}`,
        structured_formatting: {
          main_text: location.name,
          secondary_text: location.address
        }
      }));
      
      setPredictions(mockPredictions);
      setIsLoading(false);
    }
  }, [mockLocations]);

  // Function to search for locations using mock data
  const searchLocationsWithMock = useCallback((term: string) => {
    if (term.trim() === "") {
      setPredictions([]);
      setIsLoading(false);
      return;
    }

    const filteredLocations = mockLocations.filter(
      location => location.name.toLowerCase().includes(term.toLowerCase()) || 
                  location.address.toLowerCase().includes(term.toLowerCase())
    );
    
    // Convert mock locations to prediction format
    const mockPredictions = filteredLocations.map(location => ({
      place_id: location.id,
      description: `${location.name}, ${location.address}`,
      structured_formatting: {
        main_text: location.name,
        secondary_text: location.address
      }
    }));
    
    setPredictions(mockPredictions);
    setIsLoading(false);
  }, [mockLocations]);

  // Handle input change and trigger search with debounce
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }
    
    if (value.trim() === '') {
      setPredictions([]);
      setShowSuggestions(false);
      return;
    }
    
    setIsLoading(true);
    setShowSuggestions(true);
    
    searchTimeout.current = setTimeout(() => {
      if (useGooglePlaces) {
        searchLocationsWithGoogle(value);
      } else {
        searchLocationsWithMock(value);
      }
    }, 300);
  };

  // Handle location selection from suggestions
  const handleSuggestionClick = async (prediction: Prediction) => {
    setIsLoading(true);
    
    try {
      let selectedLocation: Location;
      
      if (useGooglePlaces && !prediction.place_id.match(/^\d+$/)) {
        // This is a real Google Places result
        const placeDetails = await getPlaceDetails(prediction.place_id);
        
        if (placeDetails && placeDetails.geometry) {
          selectedLocation = {
            id: prediction.place_id,
            name: placeDetails.name || prediction.structured_formatting.main_text,
            address: placeDetails.formatted_address || prediction.structured_formatting.secondary_text,
            latitude: placeDetails.geometry.location.lat(),
            longitude: placeDetails.geometry.location.lng()
          };
        } else {
          throw new Error('Place details not found');
        }
      } else {
        // This is a mock result
        const mockLocation = mockLocations.find(loc => loc.id === prediction.place_id);
        
        if (mockLocation) {
          selectedLocation = mockLocation;
        } else {
          throw new Error('Mock location not found');
        }
      }
      
      setSearchTerm(selectedLocation.name);
      onLocationSelect(selectedLocation);
      setShowSuggestions(false);
    } catch (error) {
      console.error('Error getting place details:', error);
      
      // Fallback to showing just the prediction text
      const fallbackLocation: Location = {
        id: prediction.place_id,
        name: prediction.structured_formatting.main_text,
        address: prediction.structured_formatting.secondary_text,
        latitude: 0,
        longitude: 0
      };
      
      setSearchTerm(fallbackLocation.name);
      onLocationSelect(fallbackLocation);
      setShowSuggestions(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Close suggestions dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [wrapperRef]);

  return (
    <div className="relative" ref={wrapperRef}>
      <div className="relative">
        <input
          type="text"
          placeholder={placeholder}
          className="w-full text-[#1A1A1A] focus:outline-none py-2"
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={() => searchTerm.trim() !== '' && setShowSuggestions(true)}
        />
        {isLoading ? (
          <div className="absolute right-0 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin h-4 w-4 border-2 border-[#276EF1] border-t-transparent rounded-full"></div>
          </div>
        ) : (
          <Search className="absolute right-0 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#6E6E6E]" />
        )}
      </div>
      
      {showSuggestions && predictions.length > 0 && (
        <div className="absolute z-10 mt-1 w-full bg-white rounded-lg shadow-lg max-h-60 overflow-auto">
          {predictions.map((prediction) => (
            <div 
              key={prediction.place_id}
              className="px-4 py-2 hover:bg-[#F6F6F6] cursor-pointer"
              onClick={() => handleSuggestionClick(prediction)}
            >
              <div className="flex items-start">
                <MapPin className="h-5 w-5 mr-2 text-[#276EF1] flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-medium">{prediction.structured_formatting.main_text}</div>
                  <div className="text-sm text-[#6E6E6E]">{prediction.structured_formatting.secondary_text}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Source toggle (hidden by default, but useful for debugging) */}
      {false && (
        <div className="absolute right-0 bottom-0 transform translate-y-full mt-1">
          <button 
            className="text-xs text-[#6E6E6E] underline"
            onClick={() => setUseGooglePlaces(!useGooglePlaces)}
          >
            Using {useGooglePlaces ? 'Google Places' : 'Mock Data'}
          </button>
        </div>
      )}
    </div>
  );
};

export default LocationSearch;