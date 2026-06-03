// Nightclub-Themed Home Screen - Map & List View

import { useState, useEffect, useCallback, useRef } from 'react';
import { Search, MapPin, List, Filter, RefreshCw, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { VenueCard } from '@/ui/VenueCard';
import { CrowdFilter, TypeFilter, PriceFilter } from '@/ui/FilterChips';
import { LeafletMapView } from '@/components/LeafletMapView';
import { RealDiscoBall } from '@/components/RealDiscoBall';
import { useAudio } from '@/hooks/use-audio';
import type { Venue, CrowdLevel, VenueType, PriceLevel } from '@/data/models';
import { calculateDistance } from '@/utils/time';

async function reverseGeocode(lat: number, lng: number): Promise<string> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
      { headers: { 'Accept-Language': 'en' } }
    );
    const data = await res.json();
    const a = data.address ?? {};
    const neighbourhood = a.neighbourhood || a.suburb || a.quarter || a.village || a.town || '';
    const city = a.city || a.county || a.state_district || a.state || '';
    if (neighbourhood && city) return `${neighbourhood}, ${city}`;
    if (city) return city;
    return data.display_name?.split(',')[0] ?? 'your area';
  } catch {
    return 'your area';
  }
}

// Real-time features removed for simplification

import { dataSource } from '@/data/sources';

interface HomeProps {
  onVenueClick?: (venueId: string) => void;
  onOpenChat?: (venueId: string, venueName: string) => void;
}

export function Home({ onVenueClick, onOpenChat }: HomeProps) {
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
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [radiusKm, setRadiusKm] = useState(5);
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number } | null>(null);
  const [locationLabel, setLocationLabel] = useState('Mumbai, Maharashtra');
  const [vibeArea, setVibeArea] = useState<string | null>(null);
  const [vibeVenues, setVibeVenues] = useState<Venue[] | null>(null);
  const gender = (localStorage.getItem('user_gender') as 'male' | 'female') ?? 'female';
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const touchStartY = useRef(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const PULL_THRESHOLD = 72;

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const scrollTop = scrollRef.current?.scrollTop ?? 0;
    if (scrollTop > 0) return;
    const delta = e.touches[0].clientY - touchStartY.current;
    if (delta > 0) setPullDistance(Math.min(delta, PULL_THRESHOLD + 20));
  };

  const handleTouchEnd = async () => {
    if (pullDistance >= PULL_THRESHOLD) {
      setIsRefreshing(true);
      setPullDistance(0);
      await loadVenues();
      setIsRefreshing(false);
    } else {
      setPullDistance(0);
    }
  };

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
    <div
      className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black relative overflow-hidden"
      ref={scrollRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull-to-refresh indicator */}
      {(pullDistance > 0 || isRefreshing) && (
        <div
          className="absolute top-0 left-0 right-0 z-50 flex items-center justify-center transition-all duration-200"
          style={{ height: isRefreshing ? 56 : pullDistance * 0.6 }}
        >
          <div className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-full bg-pink-500/20 backdrop-blur-md border border-pink-400/30 text-pink-300 text-sm',
            (pullDistance >= PULL_THRESHOLD || isRefreshing) ? 'opacity-100' : 'opacity-60'
          )}>
            <RefreshCw className={cn('w-4 h-4', isRefreshing && 'animate-spin')} />
            <span>{isRefreshing ? 'Refreshing…' : pullDistance >= PULL_THRESHOLD ? 'Release to refresh' : 'Pull to refresh'}</span>
          </div>
        </div>
      )}
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
          <div className="my-4 space-y-3">
            {/* Map — venues filtered to the selected radius */}
            <LeafletMapView
              venues={venues.filter(v => {
                if (!v.lat || !v.lng) return false;
                const center = userLocation ?? { lat: 19.076, lng: 72.8777 };
                return calculateDistance(center.lat, center.lng, v.lat, v.lng) <= radiusKm;
              })}
              onVenueClick={onVenueClick}
              userLocation={userLocation}
              radiusKm={radiusKm}
              className="h-96"
            />

            {/* Radius slider */}
            <div className="px-1 pb-1">
              <style>{`
                .radius-slider { -webkit-appearance: none; appearance: none; width: 100%; height: 4px; border-radius: 2px; outline: none; cursor: pointer; background: transparent; }
                .radius-slider::-webkit-slider-runnable-track { height: 4px; border-radius: 2px; background: linear-gradient(to right, #ff2d78 0%, #ff2d78 var(--pct,50%), rgba(255,255,255,0.12) var(--pct,50%), rgba(255,255,255,0.12) 100%); }
                .radius-slider::-moz-range-track { height: 4px; border-radius: 2px; background: rgba(255,255,255,0.12); }
                .radius-slider::-moz-range-progress { height: 4px; border-radius: 2px; background: #ff2d78; }
                .radius-slider::-webkit-slider-thumb { -webkit-appearance: none; appearance: none; width: 22px; height: 22px; border-radius: 50%; background: #ff2d78; border: 2px solid rgba(255,255,255,0.4); box-shadow: 0 0 12px rgba(255,45,120,0.7), 0 0 24px rgba(255,45,120,0.3); margin-top: -9px; cursor: pointer; transition: box-shadow 0.15s; }
                .radius-slider::-webkit-slider-thumb:hover { box-shadow: 0 0 18px rgba(255,45,120,0.9), 0 0 32px rgba(255,45,120,0.5); }
                .radius-slider::-moz-range-thumb { width: 22px; height: 22px; border-radius: 50%; background: #ff2d78; border: 2px solid rgba(255,255,255,0.4); box-shadow: 0 0 12px rgba(255,45,120,0.7); cursor: pointer; }
              `}</style>

              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-white/50 font-medium tracking-wide uppercase">Radius</span>
                <span className="text-sm font-bold tabular-nums" style={{ color: '#ff2d78', textShadow: '0 0 10px rgba(255,45,120,0.6)' }}>
                  {radiusKm === 0 ? 'All' : `${radiusKm} km`}
                </span>
              </div>

              <input
                type="range"
                min={0}
                max={10}
                step={0.5}
                value={radiusKm}
                className="radius-slider"
                style={{ '--pct': `${radiusKm * 10}%` } as React.CSSProperties}
                onChange={e => setRadiusKm(Number(e.target.value))}
              />

              <div className="flex justify-between mt-1 text-white/30 text-xs px-0.5">
                <span>0</span>
                <span>5 km</span>
                <span>10 km</span>
              </div>
            </div>
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