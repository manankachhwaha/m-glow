// Google Maps Integration Component

import { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Star, Clock, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MAPS_CONFIG, isGoogleMapsConfigured, getGoogleMapsScriptUrl } from '@/config/maps';

interface GoogleMapsIntegrationProps {
  onPlaceSelect?: (place: PlaceResult) => void;
  className?: string;
}

interface PlaceResult {
  place_id: string;
  name: string;
  formatted_address: string;
  rating: number;
  price_level?: number;
  photos?: google.maps.places.PlacePhoto[];
  opening_hours?: {
    open_now: boolean;
  };
  types: string[];
}

export function GoogleMapsIntegration({ onPlaceSelect, className }: GoogleMapsIntegrationProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<PlaceResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<PlaceResult | null>(null);
  const [isConfigured, setIsConfigured] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [service, setService] = useState<google.maps.places.PlacesService | null>(null);

  // Check if Google Maps is properly configured
  useEffect(() => {
    setIsConfigured(isGoogleMapsConfigured());
  }, []);

  // Initialize Google Maps
  useEffect(() => {
    const initMap = () => {
      if (mapRef.current && !map) {
        const mapInstance = new google.maps.Map(mapRef.current, {
          center: MAPS_CONFIG.DEFAULT_CENTER,
          zoom: 13,
          styles: MAPS_CONFIG.DARK_STYLE
        });

        const placesService = new google.maps.places.PlacesService(mapInstance);
        setMap(mapInstance);
        setService(placesService);
      }
    };

    // Only initialize if Google Maps is configured
    if (!isConfigured) return;

    // Load Google Maps script if not already loaded
    if (!window.google) {
      const script = document.createElement('script');
      script.src = getGoogleMapsScriptUrl();
      script.async = true;
      script.defer = true;
      script.onload = initMap;
      script.onerror = () => {
        console.error('Failed to load Google Maps script');
      };
      document.head.appendChild(script);
    } else {
      initMap();
    }
  }, [isConfigured, map]);

  // Search for places
  const searchPlaces = async () => {
    if (!service || !searchQuery.trim()) return;

    setIsLoading(true);
    try {
      const request = {
        query: searchQuery,
        fields: ['place_id', 'name', 'formatted_address', 'rating', 'price_level', 'photos', 'opening_hours', 'types'],
        locationBias: new google.maps.LatLng(MAPS_CONFIG.DEFAULT_CENTER.lat, MAPS_CONFIG.DEFAULT_CENTER.lng),
        radius: MAPS_CONFIG.SEARCH_RADIUS
      };

      service.textSearch(request, (results, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && results) {
          const places: PlaceResult[] = results.map((place: google.maps.places.PlaceResult) => ({
            place_id: place.place_id,
            name: place.name,
            formatted_address: place.formatted_address,
            rating: place.rating || 0,
            price_level: place.price_level,
            photos: place.photos,
            opening_hours: place.opening_hours,
            types: place.types
          }));
          setSearchResults(places);
        }
        setIsLoading(false);
      });
    } catch (error) {
      console.error('Search error:', error);
      setIsLoading(false);
    }
  };

  const handlePlaceSelect = (place: PlaceResult) => {
    setSelectedPlace(place);
    onPlaceSelect?.(place);
    
    // Center map on selected place
    if (map && place.place_id) {
      const request = {
        placeId: place.place_id,
        fields: ['geometry']
      };
      
      service?.getDetails(request, (result, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && result?.geometry?.location) {
          map.setCenter(result.geometry.location);
          map.setZoom(16);
        }
      });
    }
  };

  const getPlaceTypeIcon = (types: string[]) => {
    if (types.includes('restaurant')) return '🍽️';
    if (types.includes('bar') || types.includes('night_club')) return '🍸';
    if (types.includes('cafe')) return '☕';
    if (types.includes('lodging')) return '🏨';
    return '📍';
  };

  const getPriceLevel = (level?: number) => {
    if (!level) return '';
    return '₹'.repeat(level);
  };

  // Show configuration warning if not set up
  if (!isConfigured) {
    return (
      <div className={cn('w-full h-full flex flex-col items-center justify-center', className)}>
        <div className="glass-card rounded-3xl p-8 text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-neon-orange mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-4">Google Maps Setup Required</h3>
          <div className="text-sm text-muted-foreground space-y-2 text-left">
            <p>To use Google Maps integration:</p>
            <ol className="list-decimal list-inside space-y-1 ml-4">
              <li>Get an API key from <span className="text-neon-cyan">Google Cloud Console</span></li>
              <li>Enable Maps JavaScript API & Places API</li>
              <li>Add your API key to environment variables</li>
              <li>Set <code className="text-neon-lime">VITE_GOOGLE_MAPS_API_KEY</code></li>
            </ol>
          </div>
          <div className="mt-6">
            <a 
              href="https://console.cloud.google.com/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-block px-6 py-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/80 transition-all duration-300"
            >
              Get API Key
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('w-full h-full flex flex-col', className)}>
      {/* Search Bar */}
      <div className="p-4 glass-card rounded-t-3xl">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neon-cyan" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && searchPlaces()}
              placeholder="Search for restaurants, bars, clubs..."
              className="w-full pl-10 pr-4 py-3 bg-input border border-card-border/50 rounded-2xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all duration-300"
            />
          </div>
          <button
            onClick={searchPlaces}
            disabled={isLoading || !searchQuery.trim()}
            className={cn(
              'px-6 py-3 rounded-2xl font-medium transition-all duration-300',
              isLoading || !searchQuery.trim()
                ? 'bg-muted text-muted-foreground cursor-not-allowed'
                : 'bg-primary text-primary-foreground hover:bg-primary/80'
            )}
          >
            {isLoading ? 'Searching...' : 'Search'}
          </button>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Search Results */}
        <div className="w-1/2 p-4 space-y-3 overflow-y-auto">
          {searchResults.length > 0 ? (
            searchResults.map((place) => (
              <div
                key={place.place_id}
                onClick={() => handlePlaceSelect(place)}
                className={cn(
                  'p-4 glass-card rounded-2xl cursor-pointer transition-all duration-300 hover:scale-105',
                  selectedPlace?.place_id === place.place_id && 'border-2 border-primary glow-primary'
                )}
              >
                <div className="flex items-start gap-3">
                  <div className="text-2xl">{getPlaceTypeIcon(place.types)}</div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-white mb-1">{place.name}</h3>
                    <p className="text-sm text-muted-foreground mb-2">{place.formatted_address}</p>
                    
                    <div className="flex items-center gap-4 text-sm">
                      {place.rating > 0 && (
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-neon-lime" />
                          <span className="text-white">{place.rating.toFixed(1)}</span>
                        </div>
                      )}
                      
                      {place.price_level && (
                        <div className="flex items-center gap-1">
                          <span className="text-neon-lime">{getPriceLevel(place.price_level)}</span>
                        </div>
                      )}
                      
                      {place.opening_hours && (
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span className={cn(
                            'text-sm',
                            place.opening_hours.open_now ? 'text-neon-green' : 'text-neon-red'
                          )}>
                            {place.opening_hours.open_now ? 'Open' : 'Closed'}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Search for places to get started</p>
            </div>
          )}
        </div>

        {/* Map */}
        <div className="w-1/2">
          <div ref={mapRef} className="w-full h-full rounded-r-3xl" />
        </div>
      </div>

      {/* Selected Place Details */}
      {selectedPlace && (
        <div className="p-4 glass-card rounded-b-3xl border-t border-card-border/50">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-white">{selectedPlace.name}</h3>
              <p className="text-sm text-muted-foreground">{selectedPlace.formatted_address}</p>
            </div>
            <button
              onClick={() => onPlaceSelect?.(selectedPlace)}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-xl hover:bg-primary/80 transition-all duration-300"
            >
              Add to App
            </button>
          </div>
        </div>
      )}
    </div>
  );
}


