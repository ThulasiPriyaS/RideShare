// Type definitions for Google Maps API
// These are minimal definitions needed for our application

declare global {
  interface Window {
    initGoogleMaps?: () => void;
    google?: typeof google;
  }

  namespace google {
    namespace maps {
      class Map {
        constructor(mapDiv: HTMLElement, opts?: MapOptions);
        setCenter(latLng: LatLng | LatLngLiteral): void;
        setZoom(zoom: number): void;
        setOptions(options: MapOptions): void;
        getCenter(): LatLng;
        getBounds(): LatLngBounds;
        panTo(latLng: LatLng | LatLngLiteral): void;
        fitBounds(bounds: LatLngBounds | LatLngBoundsLiteral): void;
      }

      class Marker {
        constructor(opts?: MarkerOptions);
        setPosition(latLng: LatLng | LatLngLiteral): void;
        setMap(map: Map | null): void;
        setIcon(icon: string | Icon | Symbol): void;
        setTitle(title: string): void;
        setLabel(label: string | MarkerLabel): void;
        setDraggable(draggable: boolean): void;
        setVisible(visible: boolean): void;
        addListener(eventName: string, handler: Function): MapsEventListener;
        getPosition(): LatLng;
      }

      class InfoWindow {
        constructor(opts?: InfoWindowOptions);
        open(map: Map, anchor?: MVCObject | Marker): void;
        close(): void;
        setContent(content: string | Node): void;
        setPosition(latLng: LatLng | LatLngLiteral): void;
        getPosition(): LatLng;
      }

      class DirectionsService {
        route(request: DirectionsRequest, callback: (result: DirectionsResult, status: DirectionsStatus) => void): void;
      }

      class DirectionsRenderer {
        constructor(opts?: DirectionsRendererOptions);
        setDirections(directions: DirectionsResult): void;
        setMap(map: Map | null): void;
        setOptions(options: DirectionsRendererOptions): void;
      }

      class LatLng {
        constructor(lat: number, lng: number, noWrap?: boolean);
        lat(): number;
        lng(): number;
        toString(): string;
      }

      class LatLngBounds {
        constructor(sw?: LatLng | LatLngLiteral, ne?: LatLng | LatLngLiteral);
        extend(latLng: LatLng | LatLngLiteral): LatLngBounds;
        getCenter(): LatLng;
        getSouthWest(): LatLng;
        getNorthEast(): LatLng;
        isEmpty(): boolean;
      }

      interface MapOptions {
        center?: LatLng | LatLngLiteral;
        zoom?: number;
        disableDefaultUI?: boolean;
        zoomControl?: boolean;
        mapTypeControl?: boolean;
        streetViewControl?: boolean;
        styles?: MapTypeStyle[];
        mapTypeId?: MapTypeId;
      }

      interface LatLngLiteral {
        lat: number;
        lng: number;
      }

      interface LatLngBoundsLiteral {
        east: number;
        north: number;
        south: number;
        west: number;
      }

      interface MarkerOptions {
        position: LatLng | LatLngLiteral;
        map?: Map;
        icon?: string | Icon | Symbol;
        title?: string;
        label?: string | MarkerLabel;
        draggable?: boolean;
        visible?: boolean;
      }

      interface MarkerLabel {
        color: string;
        fontFamily: string;
        fontSize: string;
        fontWeight: string;
        text: string;
      }

      interface InfoWindowOptions {
        content?: string | Node;
        position?: LatLng | LatLngLiteral;
        maxWidth?: number;
        pixelOffset?: Size;
      }

      interface DirectionsRequest {
        origin: string | LatLng | LatLngLiteral | Place;
        destination: string | LatLng | LatLngLiteral | Place;
        travelMode: TravelMode;
        transitOptions?: TransitOptions;
        drivingOptions?: DrivingOptions;
        unitSystem?: UnitSystem;
        waypoints?: DirectionsWaypoint[];
        optimizeWaypoints?: boolean;
        provideRouteAlternatives?: boolean;
        avoidFerries?: boolean;
        avoidHighways?: boolean;
        avoidTolls?: boolean;
        region?: string;
      }

      interface DirectionsWaypoint {
        location: string | LatLng | LatLngLiteral | Place;
        stopover?: boolean;
      }

      interface DirectionsRendererOptions {
        directions?: DirectionsResult;
        map?: Map;
        panel?: Element;
        polylineOptions?: PolylineOptions;
        suppressMarkers?: boolean;
        suppressInfoWindows?: boolean;
        suppressPolylines?: boolean;
      }

      interface PolylineOptions {
        path?: MVCArray<LatLng> | LatLng[] | LatLngLiteral[];
        strokeColor?: string;
        strokeOpacity?: number;
        strokeWeight?: number;
        visible?: boolean;
      }

      interface DirectionsResult {
        routes: DirectionsRoute[];
      }

      interface DirectionsRoute {
        legs: DirectionsLeg[];
        overview_path: LatLng[];
        overview_polyline: string;
        warnings: string[];
        way_points: LatLng[];
      }

      interface DirectionsLeg {
        arrival_time: Time;
        departure_time: Time;
        distance: Distance;
        duration: Duration;
        end_address: string;
        end_location: LatLng;
        start_address: string;
        start_location: LatLng;
        steps: DirectionsStep[];
      }

      interface DirectionsStep {
        distance: Distance;
        duration: Duration;
        end_location: LatLng;
        instructions: string;
        path: LatLng[];
        start_location: LatLng;
        transit: TransitDetails;
        travel_mode: TravelMode;
      }

      interface Distance {
        text: string;
        value: number;
      }

      interface Duration {
        text: string;
        value: number;
      }

      interface Time {
        text: string;
        time_zone: string;
        value: Date;
      }

      interface TransitDetails {
        arrival_stop: TransitStop;
        arrival_time: Time;
        departure_stop: TransitStop;
        departure_time: Time;
        headsign: string;
        headway: number;
        line: TransitLine;
        num_stops: number;
      }

      interface TransitStop {
        location: LatLng;
        name: string;
      }

      interface TransitLine {
        agencies: TransitAgency[];
        color: string;
        icon: string;
        name: string;
        short_name: string;
        text_color: string;
        url: string;
        vehicle: TransitVehicle;
      }

      interface TransitAgency {
        name: string;
        phone: string;
        url: string;
      }

      interface TransitVehicle {
        icon: string;
        local_icon: string;
        name: string;
        type: VehicleType;
      }

      interface TransitOptions {
        arrivalTime?: Date;
        departureTime?: Date;
        modes?: TransitMode[];
        routingPreference?: TransitRoutePreference;
      }

      interface DrivingOptions {
        departureTime?: Date;
        trafficModel?: TrafficModel;
      }

      enum TravelMode {
        BICYCLING = "BICYCLING",
        DRIVING = "DRIVING",
        TRANSIT = "TRANSIT",
        WALKING = "WALKING"
      }

      enum DirectionsStatus {
        INVALID_REQUEST = "INVALID_REQUEST",
        MAX_WAYPOINTS_EXCEEDED = "MAX_WAYPOINTS_EXCEEDED",
        NOT_FOUND = "NOT_FOUND",
        OK = "OK",
        OVER_QUERY_LIMIT = "OVER_QUERY_LIMIT",
        REQUEST_DENIED = "REQUEST_DENIED",
        UNKNOWN_ERROR = "UNKNOWN_ERROR",
        ZERO_RESULTS = "ZERO_RESULTS"
      }

      enum UnitSystem {
        IMPERIAL = 0,
        METRIC = 1
      }

      enum VehicleType {
        BUS = "BUS",
        CABLE_CAR = "CABLE_CAR",
        COMMUTER_TRAIN = "COMMUTER_TRAIN",
        FERRY = "FERRY",
        FUNICULAR = "FUNICULAR",
        GONDOLA_LIFT = "GONDOLA_LIFT",
        HEAVY_RAIL = "HEAVY_RAIL",
        HIGH_SPEED_TRAIN = "HIGH_SPEED_TRAIN",
        INTERCITY_BUS = "INTERCITY_BUS",
        METRO_RAIL = "METRO_RAIL",
        MONORAIL = "MONORAIL",
        OTHER = "OTHER",
        RAIL = "RAIL",
        SHARE_TAXI = "SHARE_TAXI",
        SUBWAY = "SUBWAY",
        TRAM = "TRAM",
        TROLLEYBUS = "TROLLEYBUS"
      }

      enum TransitMode {
        BUS = "BUS",
        RAIL = "RAIL",
        SUBWAY = "SUBWAY",
        TRAIN = "TRAIN",
        TRAM = "TRAM"
      }

      enum TransitRoutePreference {
        FEWER_TRANSFERS = "FEWER_TRANSFERS",
        LESS_WALKING = "LESS_WALKING"
      }

      enum TrafficModel {
        BEST_GUESS = "BEST_GUESS",
        OPTIMISTIC = "OPTIMISTIC",
        PESSIMISTIC = "PESSIMISTIC"
      }

      enum MapTypeId {
        HYBRID = "HYBRID",
        ROADMAP = "ROADMAP",
        SATELLITE = "SATELLITE",
        TERRAIN = "TERRAIN"
      }

      interface MapTypeStyle {
        elementType?: MapTypeStyleElementType;
        featureType?: MapTypeStyleFeatureType;
        stylers: MapTypeStyler[];
      }

      type MapTypeStyleFeatureType = string;
      type MapTypeStyleElementType = string;

      interface MapTypeStyler {
        [name: string]: string | number | boolean;
      }

      class MapsEventListener {}

      interface MVCObject {}

      interface Size {
        width: number;
        height: number;
      }

      interface Place {}

      interface Icon {}

      interface Symbol {}
      
      class MVCArray<T> {
        constructor(array?: T[]);
        push(element: T): number;
        getArray(): T[];
        getAt(i: number): T;
        insertAt(i: number, elem: T): void;
        removeAt(i: number): T;
        setAt(i: number, elem: T): void;
        clear(): void;
        forEach(callback: (elem: T, i: number) => void): void;
      }

      namespace places {
        class AutocompleteService {
          getPlacePredictions(
            request: AutocompletionRequest,
            callback: (results: AutocompletePrediction[] | null, status: PlacesServiceStatus) => void
          ): void;
        }

        class PlacesService {
          constructor(attrContainer: HTMLElement);
          getDetails(
            request: PlaceDetailsRequest,
            callback: (result: PlaceResult | null, status: PlacesServiceStatus) => void
          ): void;
        }

        interface AutocompletionRequest {
          input: string;
          types?: string[];
          bounds?: LatLngBounds | LatLngBoundsLiteral;
          componentRestrictions?: ComponentRestrictions;
          sessionToken?: AutocompleteSessionToken;
          location?: LatLng;
          radius?: number;
          origin?: LatLng | LatLngLiteral;
        }

        interface ComponentRestrictions {
          country: string | string[];
        }

        interface PlaceDetailsRequest {
          placeId: string;
          fields?: string[];
          sessionToken?: AutocompleteSessionToken;
        }

        interface AutocompletePrediction {
          description: string;
          matched_substrings: PredictionSubstring[];
          place_id: string;
          structured_formatting: AutocompleteStructuredFormatting;
          terms: PredictionTerm[];
          types: string[];
        }

        interface AutocompleteStructuredFormatting {
          main_text: string;
          main_text_matched_substrings: PredictionSubstring[];
          secondary_text: string;
        }

        interface PredictionTerm {
          offset: number;
          value: string;
        }

        interface PredictionSubstring {
          length: number;
          offset: number;
        }

        interface PlaceResult {
          address_components?: AddressComponent[];
          formatted_address?: string;
          geometry?: PlaceGeometry;
          name?: string;
          photos?: PlacePhoto[];
          place_id?: string;
          types?: string[];
        }

        interface AddressComponent {
          long_name: string;
          short_name: string;
          types: string[];
        }

        interface PlaceGeometry {
          location: LatLng;
          viewport: LatLngBounds;
        }

        interface PlacePhoto {
          height: number;
          width: number;
          html_attributions: string[];
          getUrl(opts: PhotoOptions): string;
        }

        interface PhotoOptions {
          maxHeight?: number;
          maxWidth?: number;
        }

        enum PlacesServiceStatus {
          INVALID_REQUEST = "INVALID_REQUEST",
          NOT_FOUND = "NOT_FOUND",
          OK = "OK",
          OVER_QUERY_LIMIT = "OVER_QUERY_LIMIT",
          REQUEST_DENIED = "REQUEST_DENIED",
          UNKNOWN_ERROR = "UNKNOWN_ERROR",
          ZERO_RESULTS = "ZERO_RESULTS"
        }

        class AutocompleteSessionToken {}
      }
    }
  }
}