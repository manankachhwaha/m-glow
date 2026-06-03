/**
 * Google Maps nightclub radar view.
 * Fixed centre marker (pin never moves), map slides underneath.
 * Sonar pulse circle (cyan/purple), dark radar style, Places Autocomplete.
 */

import { useEffect, useRef, useState } from 'react';
import { Search, Navigation } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Venue } from '@/data/models';

declare global { interface Window { google: typeof google } }

const API_KEY  = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string;
const MUMBAI   = { lat: 19.076, lng: 72.8777 };
const CYAN     = '#00F5FF';
const PURPLE   = '#7B2FFF';
const NEON_RED = '#FF1A5E';
const GOLD     = '#FFD700';

// ── Nightclub radar map style ────────────────────────────────────────────────
const NIGHTCLUB_STYLE: google.maps.MapTypeStyle[] = [
  { elementType: 'geometry',            stylers: [{ color: '#04040e' }] },
  { elementType: 'labels.icon',         stylers: [{ visibility: 'off' }] },
  { elementType: 'labels.text.fill',    stylers: [{ color: '#1a1a3a' }] },
  { elementType: 'labels.text.stroke',  stylers: [{ color: '#04040e' }] },
  { featureType: 'administrative',      elementType: 'geometry',              stylers: [{ visibility: 'off' }] },
  { featureType: 'administrative.locality', elementType: 'labels.text.fill', stylers: [{ color: '#5555aa' }] },
  { featureType: 'administrative.neighborhood', elementType: 'labels.text.fill', stylers: [{ color: '#333366' }] },
  { featureType: 'poi',                 stylers: [{ visibility: 'off' }] },
  { featureType: 'road',                elementType: 'geometry',              stylers: [{ color: '#0a0a1e' }] },
  { featureType: 'road',                elementType: 'geometry.stroke',       stylers: [{ color: '#050510' }] },
  { featureType: 'road',                elementType: 'labels.text.fill',      stylers: [{ color: '#2a2a55' }] },
  { featureType: 'road.highway',        elementType: 'geometry',              stylers: [{ color: '#14082e' }] },
  { featureType: 'road.highway',        elementType: 'geometry.stroke',       stylers: [{ color: '#0a0520' }] },
  { featureType: 'road.highway',        elementType: 'labels.text.fill',      stylers: [{ color: '#4433aa' }] },
  { featureType: 'road.local',          elementType: 'labels.text.fill',      stylers: [{ color: '#1a1a44' }] },
  { featureType: 'transit',             stylers: [{ visibility: 'off' }] },
  { featureType: 'water',               elementType: 'geometry',              stylers: [{ color: '#02020e' }] },
  { featureType: 'water',               elementType: 'labels.text.fill',      stylers: [{ color: '#0d0d2e' }] },
  { featureType: 'landscape',           elementType: 'geometry',              stylers: [{ color: '#060616' }] },
  { featureType: 'landscape.natural',   elementType: 'geometry',              stylers: [{ color: '#06060f' }] },
];

// ── Crowd colour helpers ─────────────────────────────────────────────────────
function crowdColor(level?: string) {
  switch (level) {
    case 'busy':     return '#ff0080';
    case 'moderate': return '#ff8800';
    case 'quiet':    return '#00ff88';
    default:         return '#666688';
  }
}

function makePinSvg(color: string) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="36" viewBox="0 0 28 36">
    <defs>
      <filter id="glow"><feGaussianBlur stdDeviation="2" result="blur"/>
        <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
    </defs>
    <path d="M14 0C6.27 0 0 6.27 0 14c0 9.625 14 22 14 22S28 23.625 28 14C28 6.27 21.73 0 14 0z"
          fill="${color}" filter="url(#glow)" opacity="0.95"/>
    <circle cx="14" cy="14" r="6" fill="white" opacity="0.9"/>
  </svg>`;
}

// ── Centre-pin SVGs (never move) ─────────────────────────────────────────────
function HighHeelSVG() {
  return (
    <svg width="34" height="44" viewBox="0 0 34 44" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="5" y="30" width="5" height="14" rx="2.5" fill={NEON_RED}/>
      <path d="M10 41 Q20 43 30 37 L30 33 Q20 39 10 37 Z" fill={NEON_RED}/>
      <path d="M9 38 Q7 28 11 18 Q15 8 21 9 Q27 10 27 18 Q25 27 20 33 Q16 37 9 39 Z" fill={NEON_RED}/>
      <path d="M21 10 Q29 13 29 21" stroke="#FF8FBB" strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M14 16 Q16 12 20 11" stroke="#FF8FBB" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

function CrownSVG() {
  return (
    <svg width="40" height="36" viewBox="0 0 40 36" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 28 L4 16 L11 22 L20 6 L29 22 L36 16 L36 28 Z" fill={GOLD}/>
      <rect x="4" y="28" width="32" height="7" rx="3" fill={GOLD}/>
      <path d="M4 28 L4 16 L11 22 L20 6 L29 22 L36 16 L36 28 Z" stroke="#FFA500" strokeWidth="1" fill="none"/>
      <circle cx="12" cy="31.5" r="2.5" fill="#FF3366"/>
      <circle cx="20" cy="31.5" r="2.5" fill={CYAN}/>
      <circle cx="28" cy="31.5" r="2.5" fill="#FF3366"/>
      <circle cx="20" cy="7"    r="2.5" fill="#FF3366"/>
      <circle cx="11" cy="22"   r="2"   fill="#FFF8DC"/>
      <circle cx="29" cy="22"   r="2"   fill="#FFF8DC"/>
    </svg>
  );
}

// ── Props ────────────────────────────────────────────────────────────────────
interface GoogleMapViewProps {
  venues: Venue[];
  onVenueClick?: (venueId: string) => void;
  className?: string;
  radiusKm?: number;
  gender?: 'male' | 'female';
  onCenterChange?: (lat: number, lng: number) => void;
  initialCenter?: { lat: number; lng: number };
}

// ── Component ────────────────────────────────────────────────────────────────
export function GoogleMapView({
  venues, onVenueClick, className,
  radiusKm = 5, gender = 'female',
  onCenterChange, initialCenter,
}: GoogleMapViewProps) {
  const containerRef  = useRef<HTMLDivElement>(null);
  const searchRef     = useRef<HTMLInputElement>(null);
  const mapRef        = useRef<google.maps.Map | null>(null);
  const radarRef      = useRef<google.maps.Circle | null>(null);
  const pulseRef      = useRef<google.maps.Circle | null>(null);
  const markersRef    = useRef<google.maps.Marker[]>([]);
  const infoRef       = useRef<google.maps.InfoWindow | null>(null);
  const pulseInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const pulseStart    = useRef(Date.now());
  const acRef         = useRef<google.maps.places.Autocomplete | null>(null);

  const [apiLoaded, setApiLoaded]   = useState(false);
  const [apiError, setApiError]     = useState(false);
  const [searching, setSearching]   = useState(false);

  const center0 = initialCenter ?? MUMBAI;

  // ── 1. Load Google Maps JS API ─────────────────────────────────────────────
  useEffect(() => {
    if (!API_KEY) { setApiError(true); return; }
    import('@googlemaps/js-api-loader').then(({ Loader }) => {
      new Loader({ apiKey: API_KEY, version: 'weekly', libraries: ['places', 'geocoding'] })
        .load()
        .then(() => setApiLoaded(true))
        .catch(() => setApiError(true));
    });
  }, []);

  // ── 2. Initialise map ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!apiLoaded || !containerRef.current || mapRef.current) return;

    const map = new window.google.maps.Map(containerRef.current, {
      center: center0,
      zoom: 14,
      styles: NIGHTCLUB_STYLE,
      disableDefaultUI: true,
      gestureHandling: 'greedy',
      clickableIcons: false,
    });

    mapRef.current = map;
    infoRef.current = new window.google.maps.InfoWindow();

    // Keep radar centred while user drags
    map.addListener('center_changed', () => {
      const c = map.getCenter()!;
      radarRef.current?.setCenter(c);
      pulseRef.current?.setCenter(c);
    });

    // Notify parent once drag finishes
    map.addListener('dragend', () => {
      const c = map.getCenter()!;
      onCenterChange?.(c.lat(), c.lng());
    });

    map.addListener('zoom_changed', () => {
      const c = map.getCenter()!;
      onCenterChange?.(c.lat(), c.lng());
    });

    // Places Autocomplete
    if (searchRef.current) {
      const ac = new window.google.maps.places.Autocomplete(searchRef.current, {
        types: ['geocode'],
        fields: ['geometry', 'name'],
      });
      acRef.current = ac;
      ac.addListener('place_changed', () => {
        const place = ac.getPlace();
        if (!place.geometry?.location) return;
        map.panTo(place.geometry.location);
        map.setZoom(14);
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        onCenterChange?.(lat, lng);
        if (searchRef.current) searchRef.current.blur();
      });
    }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiLoaded]);

  // ── 3. Radar + pulse circles ───────────────────────────────────────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !apiLoaded) return;

    radarRef.current?.setMap(null);
    pulseRef.current?.setMap(null);
    if (pulseInterval.current) clearInterval(pulseInterval.current);

    const centre = map.getCenter()!;
    const baseR  = radiusKm * 1000;

    radarRef.current = new window.google.maps.Circle({
      map, center: centre, radius: baseR,
      strokeColor: CYAN,   strokeOpacity: 0.9, strokeWeight: 2.5,
      fillColor: PURPLE,   fillOpacity: 0.2,
      clickable: false, zIndex: 1,
    });

    pulseRef.current = new window.google.maps.Circle({
      map, center: centre, radius: baseR,
      strokeColor: CYAN,   strokeOpacity: 0.8, strokeWeight: 2,
      fillOpacity: 0, clickable: false, zIndex: 2,
    });

    pulseStart.current = Date.now();

    pulseInterval.current = setInterval(() => {
      const pulse = pulseRef.current;
      if (!pulse || !map) return;
      const progress = Math.min((Date.now() - pulseStart.current) / 2000, 1);
      pulse.setRadius(baseR * (1 + progress * 0.55));
      pulse.setOptions({ strokeOpacity: 0.8 * (1 - progress) });
      if (progress >= 1) {
        pulse.setCenter(map.getCenter()!);
        pulse.setRadius(baseR);
        pulse.setOptions({ strokeOpacity: 0.8 });
        pulseStart.current = Date.now();
      }
    }, 50);

    return () => {
      radarRef.current?.setMap(null);
      pulseRef.current?.setMap(null);
      if (pulseInterval.current) clearInterval(pulseInterval.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiLoaded, radiusKm]);

  // ── 4. Venue markers ───────────────────────────────────────────────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !apiLoaded) return;

    markersRef.current.forEach(m => m.setMap(null));
    markersRef.current = [];

    venues.forEach(venue => {
      if (!venue.lat || !venue.lng) return;

      const color = crowdColor(venue.current_crowd);
      const icon: google.maps.Icon = {
        url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(makePinSvg(color))}`,
        scaledSize: new window.google.maps.Size(28, 36),
        anchor: new window.google.maps.Point(14, 36),
      };

      const marker = new window.google.maps.Marker({
        position: { lat: venue.lat, lng: venue.lng },
        map,
        icon,
        title: venue.name,
      });

      const priceStr   = '₹'.repeat(venue.price_level ?? 1);
      const crowdLabel = venue.current_crowd
        ? venue.current_crowd[0].toUpperCase() + venue.current_crowd.slice(1)
        : 'Unknown';

      marker.addListener('click', () => {
        const iw = infoRef.current;
        if (!iw) return;
        iw.setContent(`
          <div style="min-width:160px;font-family:sans-serif;background:#0a0a1e;color:#fff;padding:4px">
            <strong style="font-size:14px;color:#fff">${venue.name}</strong>
            <p style="margin:4px 0;font-size:12px;color:#888">${venue.address}</p>
            <div style="display:flex;gap:8px;font-size:12px;margin:6px 0">
              <span style="color:${color}">● ${crowdLabel}</span>
              <span style="color:#888">${priceStr}</span>
            </div>
            ${venue.open_hours ? `<p style="font-size:11px;color:#666;margin:2px 0">${venue.open_hours}</p>` : ''}
            <button id="gm-venue-${venue.id}"
              style="margin-top:8px;width:100%;padding:6px;
                     background:linear-gradient(135deg,${CYAN},${PURPLE});
                     color:#fff;border:none;border-radius:6px;font-size:12px;font-weight:600;cursor:pointer">
              View Details
            </button>
          </div>`);
        iw.open({ map, anchor: marker });
        setTimeout(() => {
          document.getElementById(`gm-venue-${venue.id}`)
            ?.addEventListener('click', () => { iw.close(); onVenueClick?.(venue.id); });
        }, 0);
      });

      markersRef.current.push(marker);
    });
  }, [venues, onVenueClick, apiLoaded]);

  // ── Recenter ───────────────────────────────────────────────────────────────
  const recenter = () => {
    mapRef.current?.panTo(center0);
    mapRef.current?.setZoom(14);
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  if (apiError) {
    return (
      <div className={cn('relative w-full rounded-3xl overflow-hidden flex items-center justify-center', className)}
        style={{ background: '#04040e', border: '1px solid rgba(0,245,255,0.2)' }}>
        <div className="text-center p-6">
          <p className="text-white/60 text-sm">Map unavailable — check API key</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('relative w-full rounded-3xl overflow-hidden', className)}>
      {/* Map canvas */}
      <div ref={containerRef} className="w-full h-full"
        style={{ background: '#04040e' }} />

      {!apiLoaded && (
        <div className="absolute inset-0 flex items-center justify-center"
          style={{ background: '#04040e' }}>
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 rounded-full border-2 border-t-transparent animate-spin"
              style={{ borderColor: `${CYAN} transparent ${CYAN} ${CYAN}` }} />
            <p className="text-sm" style={{ color: CYAN }}>Loading radar…</p>
          </div>
        </div>
      )}

      {/* ── Search bar ── */}
      <div className="absolute top-3 left-3 right-12 z-10 flex items-center gap-2 px-3 py-2 rounded-xl"
        style={{ background: 'rgba(4,4,14,0.82)', backdropFilter: 'blur(16px)', border: `1px solid rgba(0,245,255,0.22)` }}>
        <Search className="w-4 h-4 flex-shrink-0" style={{ color: CYAN }} />
        <input
          ref={searchRef}
          type="text"
          placeholder="Search location…"
          onFocus={() => setSearching(true)}
          onBlur={() => setSearching(false)}
          className="flex-1 bg-transparent text-white text-sm outline-none placeholder:text-white/35"
        />
        {searching && (
          <div className="w-3.5 h-3.5 rounded-full border-2 border-t-transparent flex-shrink-0 animate-spin"
            style={{ borderColor: `${CYAN} transparent ${CYAN} ${CYAN}` }} />
        )}
      </div>

      {/* ── Fixed centre pin ── */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10"
        style={{ paddingBottom: 20 }}>
        <div style={{
          filter: gender === 'female'
            ? `drop-shadow(0 0 8px ${NEON_RED}) drop-shadow(0 0 20px ${NEON_RED}88)`
            : `drop-shadow(0 0 8px ${GOLD}) drop-shadow(0 0 20px ${GOLD}88)`,
        }}>
          {gender === 'female' ? <HighHeelSVG /> : <CrownSVG />}
        </div>
      </div>

      {/* ── Legend ── */}
      <div className="absolute bottom-10 left-3 z-10 p-3 rounded-xl text-xs space-y-1"
        style={{ background: 'rgba(4,4,14,0.82)', backdropFilter: 'blur(12px)', border: `1px solid rgba(0,245,255,0.15)` }}>
        <div className="font-semibold mb-1" style={{ color: CYAN }}>Live Venues</div>
        {[['#ff0080','Busy'],['#ff8800','Moderate'],['#00ff88','Quiet']].map(([c,l]) => (
          <div key={l} className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ background: c }} />
            <span className="text-white/70">{l}</span>
          </div>
        ))}
        <div className="flex items-center gap-2 pt-1 mt-1" style={{ borderTop: `1px solid rgba(0,245,255,0.2)` }}>
          <div className="w-2 h-2 rounded-full" style={{ background: CYAN }} />
          <span className="text-white/70">Radar range</span>
        </div>
      </div>

      {/* ── Re-centre button ── */}
      <button onClick={recenter}
        className="absolute top-3 right-3 z-10 p-2 rounded-lg transition-opacity hover:opacity-80"
        style={{ background: 'rgba(4,4,14,0.82)', backdropFilter: 'blur(12px)', border: `1px solid rgba(0,245,255,0.2)` }}>
        <Navigation className="w-5 h-5" style={{ color: CYAN }} />
      </button>
    </div>
  );
}
