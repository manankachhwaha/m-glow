// Home Screen - Map & List View

import { useState, useEffect } from 'react';
import { Search, MapPin, List, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';
import { VenueCard } from '@/ui/VenueCard';
import { CrowdFilter, TypeFilter, PriceFilter } from '@/ui/FilterChips';
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
  
  // Filters
  const [crowdFilter, setCrowdFilter] = useState<CrowdLevel | null>(null);
  const [typeFilter, setTypeFilter] = useState<VenueType | null>(null);
  const [priceFilter, setPriceFilter] = useState<PriceLevel | null>(null);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-50 backdrop-blur-md bg-background/80 border-b border-card-border/50">
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
                className="w-full pl-10 pr-4 py-3 bg-input border border-card-border/50 rounded-2xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-smooth"
              />
            </div>
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                'p-3 rounded-2xl transition-smooth',
                showFilters || hasActiveFilters
                  ? 'bg-primary text-primary-foreground glow-primary'
                  : 'glass-light hover:bg-primary/10'
              )}
            >
              <Filter className="w-5 h-5" />
            </button>
            
            <div className="flex rounded-2xl glass-light p-1">
              <button
                onClick={() => setViewMode('list')}
                className={cn(
                  'p-2 rounded-xl transition-smooth',
                  viewMode === 'list' && 'bg-primary text-primary-foreground'
                )}
              >
                <List className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={cn(
                  'p-2 rounded-xl transition-smooth',
                  viewMode === 'map' && 'bg-primary text-primary-foreground'
                )}
              >
                <MapPin className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Location indicator */}
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <MapPin className="w-4 h-4" />
            <span>Mumbai, Maharashtra</span>
          </div>
        </div>

        {/* Filters panel */}
        {showFilters && (
          <div className="px-4 pb-4 space-y-4 border-t border-card-border/50">
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
          // Map placeholder
          <div className="h-96 rounded-3xl glass-card flex items-center justify-center my-4">
            <div className="text-center">
              <MapPin className="w-12 h-12 text-primary mx-auto mb-2" />
              <p className="text-muted-foreground">Map view coming soon</p>
              <p className="text-xs text-muted-foreground">Interactive map with glowing pins for live venues</p>
            </div>
          </div>
        ) : (
          // List view
          <div className="py-4">
            {loading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }, (_, i) => (
                  <div key={i} className="h-64 rounded-3xl glass-card animate-pulse" />
                ))}
              </div>
            ) : venues.length === 0 ? (
              <div className="text-center py-12">
                <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No venues found</h3>
                <p className="text-muted-foreground">Try adjusting your filters or search terms</p>
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