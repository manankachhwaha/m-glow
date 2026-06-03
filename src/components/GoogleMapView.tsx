/**
 * Google Maps nightclub radar view.
 * Loads the Maps JS API via script tag (most reliable approach).
 * Fixed centre marker, sonar pulse, Places Autocomplete.
 */

import { useEffect, useRef, useState } from 'react';
import { Search, Navigation } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Venue } from '@/data/models';

const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string;
const MUMBAI  = { lat: 19.076, lng: 72.8777 };
const CYAN    = '#00F5FF';
const PURPLE  = '#7B2FFF';

// Google Maps standard Night/Dark style — natural dark grays, no purple tint
const DARK_MAP_STYLE = [
  { elementType: 'geometry',           stylers: [{ color: '#212121' }] },
  { elementType: 'labels.icon',        stylers: [{ visibility: 'off' }] },
  { elementType: 'labels.text.fill',   stylers: [{ color: '#757575' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#212121' }] },
  { featureType: 'administrative',                elementType: 'geometry',          stylers: [{ color: '#757575' }] },
  { featureType: 'administrative.country',        elementType: 'labels.text.fill',  stylers: [{ color: '#9e9e9e' }] },
  { featureType: 'administrative.land_parcel',    stylers: [{ visibility: 'off' }] },
  { featureType: 'administrative.locality',       elementType: 'labels.text.fill',  stylers: [{ color: '#bdbdbd' }] },
  { featureType: 'poi',                           elementType: 'labels.text.fill',  stylers: [{ color: '#757575' }] },
  { featureType: 'poi.park',                      elementType: 'geometry',          stylers: [{ color: '#181818' }] },
  { featureType: 'poi.park',                      elementType: 'labels.text.fill',  stylers: [{ color: '#616161' }] },
  { featureType: 'poi.park',                      elementType: 'labels.text.stroke',stylers: [{ color: '#1b1b1b' }] },
  { featureType: 'road',                          elementType: 'geometry.fill',     stylers: [{ color: '#2c2c2c' }] },
  { featureType: 'road',                          elementType: 'labels.text.fill',  stylers: [{ color: '#8a8a8a' }] },
  { featureType: 'road.arterial',                 elementType: 'geometry',          stylers: [{ color: '#373737' }] },
  { featureType: 'road.highway',                  elementType: 'geometry',          stylers: [{ color: '#3c3c3c' }] },
  { featureType: 'road.highway.controlled_access',elementType: 'geometry',          stylers: [{ color: '#4e4e4e' }] },
  { featureType: 'road.local',                    elementType: 'labels.text.fill',  stylers: [{ color: '#616161' }] },
  { featureType: 'transit',                       elementType: 'labels.text.fill',  stylers: [{ color: '#757575' }] },
  { featureType: 'water',                         elementType: 'geometry',          stylers: [{ color: '#000000' }] },
  { featureType: 'water',                         elementType: 'labels.text.fill',  stylers: [{ color: '#3d3d3d' }] },
];

function crowdColor(level?: string) {
  switch (level) {
    case 'busy':     return '#ff0080';
    case 'moderate': return '#ff8800';
    case 'quiet':    return '#00ff88';
    default:         return '#666688';
  }
}

function makePinSvg(color: string) {
  return encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="36" viewBox="0 0 28 36">
      <path d="M14 0C6.27 0 0 6.27 0 14c0 9.625 14 22 14 22S28 23.625 28 14C28 6.27 21.73 0 14 0z"
            fill="${color}" opacity="0.95"/>
      <circle cx="14" cy="14" r="6" fill="white" opacity="0.9"/>
    </svg>`
  );
}

// ── Fixed-centre SVG markers ─────────────────────────────────────────────────

function HighHeelSVG() {
  return (
    <svg width="34" height="44" viewBox="0 0 34 44" fill="none">
      <rect x="5" y="30" width="5" height="14" rx="2.5" fill="#FF1A5E"/>
      <path d="M10 41 Q20 43 30 37 L30 33 Q20 39 10 37Z" fill="#FF1A5E"/>
      <path d="M9 38 Q7 28 11 18 Q15 8 21 9 Q27 10 27 18 Q25 27 20 33 Q16 37 9 39Z" fill="#FF1A5E"/>
      <path d="M21 10 Q29 13 29 21" stroke="#FF8FBB" strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M14 16 Q16 12 20 11" stroke="#FF8FBB" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

function CrownSVG() {
  return (
    <svg width="40" height="36" viewBox="0 0 40 36" fill="none">
      <path d="M4 28 L4 16 L11 22 L20 6 L29 22 L36 16 L36 28Z" fill="#FFD700"/>
      <rect x="4" y="28" width="32" height="7" rx="3" fill="#FFD700"/>
      <path d="M4 28 L4 16 L11 22 L20 6 L29 22 L36 16 L36 28Z" stroke="#FFA500" strokeWidth="1" fill="none"/>
      <circle cx="12" cy="31.5" r="2.5" fill="#FF3366"/>
      <circle cx="20" cy="31.5" r="2.5" fill={CYAN}/>
      <circle cx="28" cy="31.5" r="2.5" fill="#FF3366"/>
      <circle cx="20" cy="7"    r="2.5" fill="#FF3366"/>
      <circle cx="11" cy="22"   r="2"   fill="#FFF8DC"/>
      <circle cx="29" cy="22"   r="2"   fill="#FFF8DC"/>
    </svg>
  );
}

// ── Script loader (singleton) ────────────────────────────────────────────────

let scriptPromise: Promise<void> | null = null;

function loadGoogleMaps(): Promise<void> {
  // Already loaded
  if (typeof google !== 'undefined' && google.maps?.Map) return Promise.resolve();

  if (!scriptPromise) {
    scriptPromise = new Promise<void>((resolve, reject) => {
      const cbName = '__gmInit_' + Date.now();
      (window as Record<string, unknown>)[cbName] = () => {
        delete (window as Record<string, unknown>)[cbName];
        resolve();
      };

      const el = document.createElement('script');
      el.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&libraries=places&callback=${cbName}&loading=async`;
      el.async = true;
      el.defer = true;
      el.onerror = () => { scriptPromise = null; reject(new Error('Maps script failed')); };
      document.head.appendChild(el);
    });
  }

  return scriptPromise;
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

  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');

  const center0 = initialCenter ?? MUMBAI;

  // ── Load Maps script ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!API_KEY) { setStatus('error'); return; }
    loadGoogleMaps()
      .then(() => setStatus('ready'))
      .catch(() => setStatus('error'));
  }, []);

  // ── Init map ───────────────────────────────────────────────────────────────
  useEffect(() => {
    if (status !== 'ready' || !containerRef.current || mapRef.current) return;

    const map = new google.maps.Map(containerRef.current, {
      center: center0,
      zoom: 14,
      // No custom styles — pure Google Maps default appearance
      disableDefaultUI: true,
      keyboardShortcuts: false,
      gestureHandling: 'greedy',
      clickableIcons: false,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
      rotateControl: false,
      scaleControl: false,
    });

    mapRef.current = map;
    infoRef.current = new google.maps.InfoWindow();

    // Keep radar circles centred as map pans
    map.addListener('center_changed', () => {
      const c = map.getCenter()!;
      radarRef.current?.setCenter(c);
      pulseRef.current?.setCenter(c);
    });

    // Notify parent after drag/zoom ends
    map.addListener('idle', () => {
      const c = map.getCenter()!;
      onCenterChange?.(c.lat(), c.lng());
    });

    // Places Autocomplete
    if (searchRef.current) {
      const ac = new google.maps.places.Autocomplete(searchRef.current, {
        types: ['geocode'],
        fields: ['geometry', 'name'],
      });
      ac.addListener('place_changed', () => {
        const place = ac.getPlace();
        if (!place.geometry?.location) return;
        map.panTo(place.geometry.location);
        map.setZoom(14);
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        onCenterChange?.(lat, lng);
        searchRef.current?.blur();
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  // ── Radar + pulse circles ──────────────────────────────────────────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!map || status !== 'ready') return;

    radarRef.current?.setMap(null);
    pulseRef.current?.setMap(null);
    if (pulseInterval.current) clearInterval(pulseInterval.current);

    const centre = map.getCenter()!;
    const baseR  = radiusKm * 1000;

    radarRef.current = new google.maps.Circle({
      map, center: centre, radius: baseR,
      strokeColor: CYAN,   strokeOpacity: 0.9, strokeWeight: 2.5,
      fillColor: PURPLE,   fillOpacity: 0.2,
      clickable: false, zIndex: 1,
    });

    pulseRef.current = new google.maps.Circle({
      map, center: centre, radius: baseR,
      strokeColor: CYAN, strokeOpacity: 0.8, strokeWeight: 2,
      fillOpacity: 0, clickable: false, zIndex: 2,
    });

    pulseStart.current = Date.now();

    pulseInterval.current = setInterval(() => {
      const pulse = pulseRef.current;
      const m     = mapRef.current;
      if (!pulse || !m) return;
      const progress = Math.min((Date.now() - pulseStart.current) / 2000, 1);
      pulse.setRadius(baseR * (1 + progress * 0.55));
      pulse.setOptions({ strokeOpacity: 0.8 * (1 - progress) });
      if (progress >= 1) {
        pulse.setCenter(m.getCenter()!);
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
  }, [status, radiusKm]);

  // ── Venue markers ──────────────────────────────────────────────────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!map || status !== 'ready') return;

    markersRef.current.forEach(m => m.setMap(null));
    markersRef.current = [];

    venues.forEach(venue => {
      if (!venue.lat || !venue.lng) return;

      const color = crowdColor(venue.current_crowd);
      const marker = new google.maps.Marker({
        position: { lat: venue.lat, lng: venue.lng },
        map,
        icon: {
          url: `data:image/svg+xml;charset=UTF-8,${makePinSvg(color)}`,
          scaledSize: new google.maps.Size(28, 36),
          anchor: new google.maps.Point(14, 36),
        },
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
          <div style="min-width:160px;font-family:sans-serif">
            <strong style="font-size:14px">${venue.name}</strong>
            <p style="margin:4px 0;font-size:12px;color:#666">${venue.address}</p>
            <div style="display:flex;gap:8px;font-size:12px;margin:6px 0">
              <span style="color:${color}">● ${crowdLabel}</span>
              <span>${priceStr}</span>
            </div>
            ${venue.open_hours ? `<p style="font-size:11px;color:#888">${venue.open_hours}</p>` : ''}
            <button id="gm-v-${venue.id}"
              style="margin-top:8px;width:100%;padding:6px;
                     background:linear-gradient(135deg,${CYAN},${PURPLE});
                     color:#fff;border:none;border-radius:6px;
                     font-size:12px;font-weight:600;cursor:pointer">
              View Details
            </button>
          </div>`);
        iw.open({ map, anchor: marker });
        setTimeout(() => {
          document.getElementById(`gm-v-${venue.id}`)
            ?.addEventListener('click', () => { iw.close(); onVenueClick?.(venue.id); });
        }, 50);
      });

      markersRef.current.push(marker);
    });
  }, [venues, onVenueClick, status]);

  // ── Recenter ───────────────────────────────────────────────────────────────
  const recenter = () => {
    mapRef.current?.panTo(center0);
    mapRef.current?.setZoom(14);
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className={cn('relative w-full rounded-3xl overflow-hidden', className)}
      style={{ background: '#212121' }}>

      {/* pac-container needs to float above everything */}
      <style>{`.pac-container { z-index: 99999 !important; border-radius: 10px; margin-top: 4px; }`}</style>

      {/* Map canvas — always rendered so the ref is available */}
      <div ref={containerRef} className="w-full h-full" />

      {/* Loading overlay */}
      {status === 'loading' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3"
          style={{ background: '#212121' }}>
          <div className="w-10 h-10 rounded-full border-2 border-t-transparent animate-spin"
            style={{ borderColor: `${CYAN} transparent ${CYAN} ${CYAN}` }} />
          <p className="text-sm font-medium" style={{ color: CYAN }}>Loading map…</p>
        </div>
      )}

      {/* Error overlay */}
      {status === 'error' && (
        <div className="absolute inset-0 flex items-center justify-center"
          style={{ background: '#212121' }}>
          <div className="text-center p-6">
            <p className="text-white/50 text-sm mb-1">Map unavailable</p>
            <p className="text-white/30 text-xs">Check that Maps JS, Places &amp; Geocoding APIs are enabled</p>
          </div>
        </div>
      )}

      {/* Search bar — always in DOM so searchRef is never null when autocomplete inits */}
      <div
        className="absolute top-3 left-3 right-12 z-10 flex items-center gap-2 px-3 py-2 rounded-xl"
        style={{
          background: 'rgba(33,33,33,0.92)',
          backdropFilter: 'blur(16px)',
          border: `1px solid rgba(0,245,255,0.22)`,
          opacity: status === 'ready' ? 1 : 0,
          pointerEvents: status === 'ready' ? 'auto' : 'none',
        }}
      >
        <Search className="w-4 h-4 flex-shrink-0" style={{ color: CYAN }} />
        <input
          ref={searchRef}
          type="text"
          placeholder="Search location…"
          className="flex-1 bg-transparent text-white text-sm outline-none placeholder:text-white/40"
          style={{ minWidth: 0 }}
        />
      </div>

      {/* Fixed centre pin */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10"
        style={{ paddingBottom: 20 }}>
        <div style={{
          filter: gender === 'female'
            ? 'drop-shadow(0 0 8px #FF1A5E) drop-shadow(0 0 20px #FF1A5E88)'
            : 'drop-shadow(0 0 8px #FFD700) drop-shadow(0 0 20px #FFD70088)',
        }}>
          {gender === 'female' ? <HighHeelSVG /> : <CrownSVG />}
        </div>
      </div>

      {/* Legend */}
      {status === 'ready' && (
        <div className="absolute bottom-10 left-3 z-10 p-3 rounded-xl text-xs space-y-1"
          style={{ background: 'rgba(30,30,30,0.9)', backdropFilter: 'blur(12px)',
                   border: `1px solid rgba(0,245,255,0.15)` }}>
          <div className="font-semibold mb-1" style={{ color: CYAN }}>Live Venues</div>
          {[['#ff0080','Busy'],['#ff8800','Moderate'],['#00ff88','Quiet']].map(([c,l]) => (
            <div key={l} className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ background: c }} />
              <span className="text-white/70">{l}</span>
            </div>
          ))}
          <div className="flex items-center gap-2 pt-1 mt-1"
            style={{ borderTop: `1px solid rgba(0,245,255,0.2)` }}>
            <div className="w-2 h-2 rounded-full" style={{ background: CYAN }} />
            <span className="text-white/70">Radar range</span>
          </div>
        </div>
      )}

      {/* Recenter */}
      {status === 'ready' && (
        <button onClick={recenter}
          className="absolute top-3 right-3 z-10 p-2 rounded-lg hover:opacity-80 transition-opacity"
          style={{ background: 'rgba(30,30,30,0.9)', backdropFilter: 'blur(12px)',
                   border: `1px solid rgba(0,245,255,0.2)` }}>
          <Navigation className="w-5 h-5" style={{ color: CYAN }} />
        </button>
      )}
    </div>
  );
}
