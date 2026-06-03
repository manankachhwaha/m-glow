// Nightclub-Themed Home Screen - Map & List View

import { useState, useEffect, useCallback, useRef } from 'react';
import { Search, MapPin, List, Filter, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { VenueCard } from '@/ui/VenueCard';
import { CrowdFilter, TypeFilter, PriceFilter } from '@/ui/FilterChips';
import { LeafletMapView } from '@/components/LeafletMapView';
import { RealDiscoBall } from '@/components/RealDiscoBall';
import { useAudio } from '@/hooks/use-audio';
import type { Venue, CrowdLevel, VenueType, PriceLevel } from '@/data/models';
import { MockDataSource } from '@/data/sources/MockDataSource';
// Real-time features removed for simplification

const dataSource = new MockDataSource();

interface HomeProps {
  onVenueClick?: (venueId: string) => void;
  onOpenChat?: (venueId: string, venueName: string) => void;
}

export function Home({ onVenueClick, onOpenChat }: HomeProps) {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [latestPostUrls, setLatestPostUrls] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');

  // Filters
  const [crowdFilter, setCrowdFilter] = useState<CrowdLevel | null>(null);
  const [typeFilter, setTypeFilter] = useState<VenueType | null>(null);
  const [priceFilter, setPriceFilter] = useState<PriceLevel | null>(null);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  const loadVenues = useCallback(async () => {
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

      // Build latest-post-per-venue map so cards show live photos
      const posts = await dataSource.listTodayPosts();
      const latest: Record<string, string> = {};
      for (const post of posts) {
        if (!latest[post.venue_id]) latest[post.venue_id] = post.media_url;
      }
      setLatestPostUrls(latest);
    } catch (error) {
      console.error('Failed to load venues:', error);
    } finally {
      setLoading(false);
    }
  }, [crowdFilter, typeFilter, priceFilter, searchQuery]);

  useEffect(() => {
    loadVenues();
  }, [loadVenues]);

  // Refresh when an owner uploads a new photo
  useEffect(() => {
    const handler = () => loadVenues();
    window.addEventListener('venue-post-uploaded', handler);
    return () => window.removeEventListener('venue-post-uploaded', handler);
  }, [loadVenues]);

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

  // Real-time features removed for simplification

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
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black relative overflow-hidden">
      {/* Nightclub Disco Lights Background */}
      <div className="fixed inset-0 pointer-events-none">
        {/* Rotating disco lights */}
        <div className="absolute top-10 left-10 w-32 h-32 rounded-full bg-gradient-to-r from-pink-500/20 to-purple-500/20 blur-xl animate-spin" style={{ animationDuration: '4s' }} />
        <div className="absolute top-20 right-20 w-24 h-24 rounded-full bg-gradient-to-r from-blue-500/20 to-cyan-500/20 blur-xl animate-spin" style={{ animationDuration: '3s', animationDirection: 'reverse' }} />
        <div className="absolute bottom-20 left-20 w-28 h-28 rounded-full bg-gradient-to-r from-green-500/20 to-lime-500/20 blur-xl animate-spin" style={{ animationDuration: '5s' }} />
        <div className="absolute bottom-10 right-10 w-20 h-20 rounded-full bg-gradient-to-r from-yellow-500/20 to-orange-500/20 blur-xl animate-spin" style={{ animationDuration: '3.5s', animationDirection: 'reverse' }} />
        
        {/* Moving light beams */}
        <div className="absolute top-0 left-1/4 w-1 h-full bg-gradient-to-b from-pink-500/30 via-transparent to-transparent animate-pulse" style={{ animationDuration: '2s' }} />
        <div className="absolute top-0 right-1/4 w-1 h-full bg-gradient-to-b from-blue-500/30 via-transparent to-transparent animate-pulse" style={{ animationDuration: '2.5s', animationDelay: '0.5s' }} />
        <div className="absolute top-0 left-3/4 w-1 h-full bg-gradient-to-b from-green-500/30 via-transparent to-transparent animate-pulse" style={{ animationDuration: '1.8s', animationDelay: '1s' }} />
      </div>

      {/* Real Disco Ball with Light Reflections */}
      <RealDiscoBall />
      {/* Nightclub-themed Header */}
      <div className="relative z-10 sticky top-0 backdrop-blur-md bg-black/40 border-b border-white/20">
        <div className="relative">
          <div className="px-4 py-4">
          {/* Top row */}
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-pink-400 drop-shadow-glow" />
              <input
                type="text"
                placeholder="Search venues..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-black/40 backdrop-blur-xl border border-white/20 rounded-2xl text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-pink-400/50 focus:border-pink-400/50 transition-all duration-300"
              />
              
              {/* Status Indicator */}
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-black/30 backdrop-blur-xl border border-white/10">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
                  <span className="text-xs text-white/80 font-medium">ONLINE</span>
                </div>
              </div>
            </div>
            
            <button
              onClick={() => {
                setShowFilters(!showFilters);
              }}
              className={cn(
                'p-3 rounded-3xl transition-all duration-500 hover:scale-110',
                showFilters || hasActiveFilters
                  ? 'bg-gradient-to-r from-pink-500/50 to-purple-500/50 text-white shadow-[0_0_30px_rgba(236,72,153,0.4)]'
                  : 'bg-black/30 backdrop-blur-2xl border border-white/10 hover:border-pink-400/30 hover:bg-black/40'
              )}
              style={{
                backdropFilter: 'blur(20px) saturate(180%)',
                boxShadow: showFilters || hasActiveFilters
                  ? '0 8px 32px rgba(236,72,153,0.3), inset 0 1px 0 rgba(255,255,255,0.1)'
                  : '0 8px 32px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.1)'
              }}
            >
              <Filter className="w-5 h-5" />
            </button>
            
            <div 
              className="flex rounded-3xl p-1 border border-white/10"
              style={{
                background: 'linear-gradient(135deg, rgba(0,0,0,0.4) 0%, rgba(20,20,20,0.3) 50%, rgba(0,0,0,0.4) 100%)',
                backdropFilter: 'blur(20px) saturate(180%)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)'
              }}
            >
              <button
                onClick={() => {
                  setViewMode('list');
                }}
                className={cn(
                  'p-2.5 rounded-2xl transition-all duration-500 hover:scale-110',
                  viewMode === 'list' 
                    ? 'bg-gradient-to-r from-pink-500/50 to-purple-500/50 text-white shadow-[0_0_20px_rgba(236,72,153,0.4)]' 
                    : 'text-white/60 hover:text-pink-400 hover:bg-white/5'
                )}
                style={{
                  backdropFilter: 'blur(20px) saturate(180%)'
                }}
              >
                <List className="w-5 h-5" />
              </button>
              <button
                onClick={() => {
                  setViewMode('map');
                }}
                className={cn(
                  'p-2.5 rounded-2xl transition-all duration-500 hover:scale-110',
                  viewMode === 'map' 
                    ? 'bg-gradient-to-r from-pink-500/50 to-purple-500/50 text-white shadow-[0_0_20px_rgba(236,72,153,0.4)]' 
                    : 'text-white/60 hover:text-pink-400 hover:bg-white/5'
                )}
                style={{
                  backdropFilter: 'blur(20px) saturate(180%)'
                }}
              >
                <MapPin className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Nightclub-themed location indicator */}
          <div className="flex items-center gap-2 text-white/70 text-sm">
            <MapPin className="w-4 h-4 text-pink-400 drop-shadow-glow" />
            <span className="text-white/80">Mumbai, Maharashtra</span>
          </div>
          </div>
        </div>

        {/* Ultra Cool Filters panel */}
        {showFilters && (
          <div 
            className="px-6 pb-6 space-y-5 border-t border-white/10"
            style={{
              background: 'linear-gradient(135deg, rgba(0,0,0,0.3) 0%, rgba(20,20,20,0.2) 50%, rgba(0,0,0,0.3) 100%)',
              backdropFilter: 'blur(25px) saturate(180%)'
            }}
          >
            <div className="flex items-center justify-between pt-5">
              <h3 className="font-semibold text-white text-lg">Filters</h3>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="text-sm text-pink-400 hover:text-pink-300 transition-all duration-300 hover:scale-105 bg-black/20 backdrop-blur-xl rounded-xl px-3 py-1.5 border border-white/10"
                  style={{
                    backdropFilter: 'blur(20px) saturate(180%)',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.1)'
                  }}
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
        
        {/* Live Updates Panel removed for simplification */}
      </div>

      {/* Nightclub-themed Content */}
      <div className="relative z-10 px-4">
        {viewMode === 'map' ? (
          // Google Maps with Real Venue Locations
          <div className="my-4">
            <LeafletMapView
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
                  <div key={i} className="h-64 rounded-3xl bg-black/40 backdrop-blur-xl border border-white/20 animate-pulse" />
                ))}
              </div>
            ) : venues.length === 0 ? (
              <div className="text-center py-12">
                <Search className="w-12 h-12 text-pink-400 mx-auto mb-4 drop-shadow-glow" />
                <h3 className="text-lg font-semibold mb-2 text-white/80">No venues found</h3>
                <p className="text-white/60">Try adjusting your filters or search terms</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {venues.map((venue) => (
                  <VenueCard
                    key={venue.id}
                    venue={venue}
                    latestPostUrl={latestPostUrls[venue.id]}
                    isFavorite={favorites.has(venue.id)}
                    onToggleFavorite={() => handleToggleFavorite(venue.id)}
                    onClick={() => onVenueClick?.(venue.id)}
                    onOpenChat={onOpenChat ? () => onOpenChat(venue.id, venue.name) : undefined}
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