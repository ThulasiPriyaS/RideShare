import { useState, useEffect, useRef } from "react";
import { MapPin, Search } from "lucide-react";
import { Location } from "@shared/schema";

interface LocationSearchProps {
  placeholder: string;
  onLocationSelect: (location: Location) => void;
  initialValue?: string;
}

const LocationSearch: React.FC<LocationSearchProps> = ({ 
  placeholder, 
  onLocationSelect, 
  initialValue = "" 
}) => {
  const [searchTerm, setSearchTerm] = useState(initialValue);
  const [suggestions, setSuggestions] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Mock location suggestions - in a real app, this would come from a locations API
  const mockLocations: Location[] = [
    { id: "1", name: "Central Park", address: "New York, NY", latitude: 40.785091, longitude: -73.968285 },
    { id: "2", name: "Empire State Building", address: "350 5th Ave, New York, NY", latitude: 40.748817, longitude: -73.985428 },
    { id: "3", name: "Times Square", address: "Manhattan, NY", latitude: 40.758896, longitude: -73.985130 },
    { id: "4", name: "Brooklyn Bridge", address: "Brooklyn Bridge, New York, NY", latitude: 40.706086, longitude: -73.996864 },
    { id: "5", name: "Grand Central Terminal", address: "89 E 42nd St, New York, NY", latitude: 40.752726, longitude: -73.977229 },
    { id: "6", name: "Rockefeller Center", address: "45 Rockefeller Plaza, New York, NY", latitude: 40.758740, longitude: -73.978674 },
    { id: "7", name: "Madison Square Garden", address: "4 Pennsylvania Plaza, New York, NY", latitude: 40.750504, longitude: -73.993439 },
  ];

  // Function to search for locations based on search term
  const searchLocations = (term: string) => {
    setIsLoading(true);
    
    // Simulate API search delay
    setTimeout(() => {
      if (term.trim() === "") {
        setSuggestions([]);
      } else {
        const filteredLocations = mockLocations.filter(
          location => location.name.toLowerCase().includes(term.toLowerCase()) || 
                      location.address.toLowerCase().includes(term.toLowerCase())
        );
        setSuggestions(filteredLocations);
      }
      setIsLoading(false);
    }, 300);
  };

  // Handle input change and trigger search
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    searchLocations(value);
    
    if (value.trim() !== '') {
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  // Handle location selection from suggestions
  const handleSuggestionClick = (location: Location) => {
    setSearchTerm(location.name);
    onLocationSelect(location);
    setShowSuggestions(false);
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
      
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-10 mt-1 w-full bg-white rounded-lg shadow-lg max-h-60 overflow-auto">
          {suggestions.map((location) => (
            <div 
              key={location.id}
              className="px-4 py-2 hover:bg-[#F6F6F6] cursor-pointer"
              onClick={() => handleSuggestionClick(location)}
            >
              <div className="flex items-start">
                <MapPin className="h-5 w-5 mr-2 text-[#276EF1] flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-medium">{location.name}</div>
                  <div className="text-sm text-[#6E6E6E]">{location.address}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LocationSearch;