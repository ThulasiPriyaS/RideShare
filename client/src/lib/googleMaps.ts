import { getGoogleMapsApiKey } from './apiConfig';

// Add the types to the window object
declare global {
  interface Window {
    initGoogleMaps?: () => void;
    google?: typeof google;
  }
}

let googleMapsScriptLoaded = false;
let googleMapsApiKey: string | null = null;

/**
 * Loads the Google Maps API script
 */
export async function loadGoogleMapsApi(): Promise<void> {
  if (googleMapsScriptLoaded) return;
  
  try {
    // Get API key from server
    googleMapsApiKey = await getGoogleMapsApiKey();
    
    return new Promise<void>((resolve, reject) => {
      // Create script element
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${googleMapsApiKey}&libraries=places&callback=initGoogleMaps`;
      script.async = true;
      script.defer = true;
      
      // Define callback
      window.initGoogleMaps = function() {
        googleMapsScriptLoaded = true;
        resolve();
      };
      
      // Handle errors
      script.onerror = function() {
        reject(new Error('Google Maps script failed to load'));
      };
      
      // Add script to document
      document.head.appendChild(script);
    });
  } catch (error) {
    console.error('Error loading Google Maps API:', error);
    throw error;
  }
}

/**
 * Checks if Google Maps API is loaded
 */
export function isGoogleMapsLoaded(): boolean {
  return googleMapsScriptLoaded && !!window.google?.maps;
}

/**
 * Gets directions between two points
 */
export async function getDirections(
  origin: { lat: number; lng: number },
  destination: { lat: number; lng: number }
): Promise<google.maps.DirectionsResult | null> {
  if (!isGoogleMapsLoaded()) {
    await loadGoogleMapsApi();
  }
  
  if (!window.google) {
    throw new Error('Google Maps API not loaded');
  }
  
  const directionsService = new window.google.maps.DirectionsService();
  
  return new Promise((resolve, reject) => {
    directionsService.route(
      {
        origin: origin,
        destination: destination,
        travelMode: window.google!.maps.TravelMode.DRIVING,
      },
      (result: google.maps.DirectionsResult | null, status: google.maps.DirectionsStatus) => {
        if (status === window.google!.maps.DirectionsStatus.OK) {
          resolve(result);
        } else {
          reject(new Error(`Failed to get directions: ${status}`));
        }
      }
    );
  });
}

/**
 * Gets place predictions for a search query
 */
export async function getPlacePredictions(
  query: string
): Promise<google.maps.places.AutocompletePrediction[]> {
  if (!isGoogleMapsLoaded()) {
    await loadGoogleMapsApi();
  }
  
  if (!window.google) {
    throw new Error('Google Maps API not loaded');
  }
  
  const autocompleteService = new window.google.maps.places.AutocompleteService();
  
  return new Promise((resolve, reject) => {
    autocompleteService.getPlacePredictions(
      { input: query, types: ['geocode', 'establishment'] },
      (predictions: google.maps.places.AutocompletePrediction[] | null, status: google.maps.places.PlacesServiceStatus) => {
        if (status === window.google!.maps.places.PlacesServiceStatus.OK && predictions) {
          resolve(predictions);
        } else {
          resolve([]);
        }
      }
    );
  });
}

/**
 * Gets place details for a place ID
 */
export async function getPlaceDetails(
  placeId: string
): Promise<google.maps.places.PlaceResult | null> {
  if (!isGoogleMapsLoaded()) {
    await loadGoogleMapsApi();
  }
  
  if (!window.google) {
    throw new Error('Google Maps API not loaded');
  }
  
  // Need a dummy div for PlacesService
  let dummyDiv = document.getElementById('google-maps-dummy');
  if (!dummyDiv) {
    dummyDiv = document.createElement('div');
    dummyDiv.id = 'google-maps-dummy';
    dummyDiv.style.display = 'none';
    document.body.appendChild(dummyDiv);
  }
  
  const placesService = new window.google.maps.places.PlacesService(dummyDiv);
  
  return new Promise((resolve, reject) => {
    placesService.getDetails(
      { placeId: placeId, fields: ['geometry', 'name', 'formatted_address'] },
      (result: google.maps.places.PlaceResult | null, status: google.maps.places.PlacesServiceStatus) => {
        if (status === window.google!.maps.places.PlacesServiceStatus.OK && result) {
          resolve(result);
        } else {
          reject(new Error(`Failed to get place details: ${status}`));
        }
      }
    );
  });
}