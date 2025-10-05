// Home Screen - Map & List View

import { useState, useEffect } from 'react';
import { Search, MapPin, List, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';
import { VenueCard } from '@/ui/VenueCard';
import { CrowdFilter, TypeFilter, PriceFilter } from '@/ui/FilterChips';
import { MapView } from '@/components/MapView';
import { GoogleMapView } from '@/components/GoogleMapView';
import { useAudio } from '@/hooks/use-audio';
import type { Venue, CrowdLevel, VenueType, PriceLevel } from '@/data/models';
import { MockDataSource } from '@/data/sources/MockDataSource';

const dataSource = new MockDataSource();

interface HomeProps {
  onVenueClick?: (venueId: string) => void;
}

export function Home({ onVenueClick }: HomeProps) {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  // Button sounds disabled
  // const { playButtonClick } = useAudio();
  
  // Filters
  const [crowdFilter, setCrowdFilter] = useState<CrowdLevel | null>(null);
  const [typeFilter, setTypeFilter] = useState<VenueType | null>(null);
  const [priceFilter, setPriceFilter] = useState<PriceLevel | null>(null);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  const loadVenues = async () => {
    setLoading(true);
    try {
      const results = await dataSource.listVenues({
        lat: 19.0760,
        lng: 72.8777,
        level: crowdFilter || undefined,
        type: typeFilter || undefined,
        price: priceFilter || undefined,
        q: searchQuery || undefined
      });
      setVenues(results);
      
      // Load favorites
      const favs = await dataSource.getFavorites();
      setFavorites(new Set(favs));
    } catch (error) {
      console.error('Failed to load venues:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVenues();
  }, [crowdFilter, typeFilter, priceFilter, searchQuery]);

  // Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.log('Location access denied or failed:', error);
          // Use default Mumbai location
          setUserLocation({
            lat: 19.0760,
            lng: 72.8777
          });
        }
      );
    } else {
      // Use default Mumbai location
      setUserLocation({
        lat: 19.0760,
        lng: 72.8777
      });
    }
  }, []);

  const handleToggleFavorite = async (venueId: string) => {
    try {
      const isFavorite = await dataSource.toggleFavorite(venueId);
      setFavorites(prev => {
        const next = new Set(prev);
        if (isFavorite) {
          next.add(venueId);
        } else {
          next.delete(venueId);
        }
        return next;
      });
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    }
  };


  const clearFilters = () => {
    setCrowdFilter(null);
    setTypeFilter(null);
    setPriceFilter(null);
    setSearchQuery('');
  };

  const hasActiveFilters = crowdFilter || typeFilter || priceFilter || searchQuery;

  return (
    <div className="min-h-screen bg-background cyber-bg relative">
      {/* Animated cyberpunk background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-cyber opacity-5" />
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-border scan-line" />
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-border scan-line" style={{ animationDelay: '1s' }} />
      </div>
      {/* Enhanced Header with neon effects */}
      <div className="sticky top-0 z-50 backdrop-blur-md bg-background/90 border-b border-card-border/50 relative">
        <div className="absolute inset-0 bg-gradient-cyber opacity-10" />
        <div className="relative">
          <div className="px-4 py-4">
          {/* Top row */}
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search venues..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-input border border-card-border/50 rounded-2xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 focus:shadow-glow-primary transition-all duration-300"
              />
            </div>
            
            <button
              onClick={() => {
                setShowFilters(!showFilters);
              }}
              className={cn(
                'p-3 rounded-2xl transition-all duration-300 hover:scale-105',
                showFilters || hasActiveFilters
                  ? 'bg-primary text-primary-foreground glow-primary'
                  : 'glass-light hover:bg-primary/10 hover:shadow-glow-primary'
              )}
            >
              <Filter className="w-5 h-5" />
            </button>
            
            <div className="flex rounded-2xl glass-light p-1 border border-neon-cyan/20">
              <button
                onClick={() => {
                  setViewMode('list');
                }}
                className={cn(
                  'p-2 rounded-xl transition-all duration-300 hover:scale-105',
                  viewMode === 'list' && 'bg-primary text-primary-foreground glow-primary'
                )}
              >
                <List className="w-5 h-5" />
              </button>
              <button
                onClick={() => {
                  setViewMode('map');
                }}
                className={cn(
                  'p-2 rounded-xl transition-all duration-300 hover:scale-105',
                  viewMode === 'map' && 'bg-primary text-primary-foreground glow-primary'
                )}
              >
                <MapPin className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Enhanced location indicator with neon effects */}
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <MapPin className="w-4 h-4 text-neon-cyan drop-shadow-glow-cyan" />
            <span className="text-neon-cyan/80">Mumbai, Maharashtra</span>
          </div>
          </div>
        </div>

        {/* Enhanced Filters panel with neon borders */}
        {showFilters && (
          <div className="px-4 pb-4 space-y-4 border-t border-neon-cyan/30 bg-gradient-cyber/5">
            <div className="flex items-center justify-between pt-4">
              <h3 className="font-semibold">Filters</h3>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="text-sm text-primary hover:text-primary/80 transition-smooth"
                >
                  Clear all
                </button>
              )}
            </div>
            
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">
                  Crowd Level
                </label>
                <CrowdFilter selected={crowdFilter} onSelect={setCrowdFilter} />
              </div>
              
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">
                  Type
                </label>
                <TypeFilter selected={typeFilter} onSelect={setTypeFilter} />
              </div>
              
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">
                  Price Range
                </label>
                <PriceFilter selected={priceFilter} onSelect={setPriceFilter} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="px-4">
        {viewMode === 'map' ? (
          // Google Maps with Real Venue Locations
          <div className="my-4">
            <GoogleMapView 
              venues={venues}
              onVenueClick={onVenueClick}
              userLocation={userLocation}
              className="h-96"
            />
          </div>
        ) : (
          // List view
          <div className="py-4">
            {loading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }, (_, i) => (
                  <div key={i} className="h-64 rounded-3xl glass-card animate-pulse glow-cyber" />
                ))}
              </div>
            ) : venues.length === 0 ? (
              <div className="text-center py-12">
                <Search className="w-12 h-12 text-neon-cyan mx-auto mb-4 glow-cyber" />
                <h3 className="text-lg font-semibold mb-2 text-neon-cyan/80">No venues found</h3>
                <p className="text-neon-pink/60">Try adjusting your filters or search terms</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {venues.map((venue) => (
                  <VenueCard
                    key={venue.id}
                    venue={venue}
                    isFavorite={favorites.has(venue.id)}
                    onToggleFavorite={() => handleToggleFavorite(venue.id)}
                    onClick={() => onVenueClick?.(venue.id)}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}