// Nightclub Radar Map — CartoDB Dark Matter, fixed center pin, sonar pulse

import { useEffect, useRef, useState } from 'react';
import { Search, Navigation } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Venue } from '@/data/models';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({ iconUrl: markerIcon, iconRetinaUrl: markerIcon2x, shadowUrl: markerShadow });

const MUMBAI = { lat: 19.076, lng: 72.8777 };
const CYAN = '#00F5FF';
const PURPLE = '#7B2FFF';

// ── Gender SVGs ──────────────────────────────────────────────────────────────

function HighHeelSVG() {
  return (
    <svg width="34" height="44" viewBox="0 0 34 44" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Slim stiletto heel */}
      <rect x="5" y="30" width="5" height="14" rx="2.5" fill="#FF1A5E"/>
      {/* Arch sole connecting heel to toe box */}
      <path d="M10 41 Q20 43 30 37 L30 33 Q20 39 10 37 Z" fill="#FF1A5E"/>
      {/* Main upper */}
      <path d="M9 38 Q7 28 11 18 Q15 8 21 9 Q27 10 27 18 Q25 27 20 33 Q16 37 9 39 Z" fill="#FF1A5E"/>
      {/* Ankle strap */}
      <path d="M21 10 Q29 13 29 21" stroke="#FF8FBB" strokeWidth="2.5" strokeLinecap="round"/>
      {/* Highlight */}
      <path d="M14 16 Q16 12 20 11" stroke="#FF8FBB" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

function CrownSVG() {
  return (
    <svg width="40" height="36" viewBox="0 0 40 36" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Crown body */}
      <path d="M4 28 L4 16 L11 22 L20 6 L29 22 L36 16 L36 28 Z" fill="#FFD700"/>
      {/* Base band */}
      <rect x="4" y="28" width="32" height="7" rx="3" fill="#FFD700"/>
      {/* Crown outlines for depth */}
      <path d="M4 28 L4 16 L11 22 L20 6 L29 22 L36 16 L36 28 Z" stroke="#FFA500" strokeWidth="1" fill="none"/>
      {/* Jewels */}
      <circle cx="12" cy="31.5" r="2.5" fill="#FF3366"/>
      <circle cx="20" cy="31.5" r="2.5" fill="#00DDFF"/>
      <circle cx="28" cy="31.5" r="2.5" fill="#FF3366"/>
      {/* Top gems */}
      <circle cx="20" cy="7" r="2.5" fill="#FF3366"/>
      <circle cx="11" cy="22" r="2" fill="#FFF8DC"/>
      <circle cx="29" cy="22" r="2" fill="#FFF8DC"/>
    </svg>
  );
}

// ── Crowd helpers ────────────────────────────────────────────────────────────

function crowdColor(level?: string) {
  switch (level) {
    case 'busy':     return '#ff0080';
    case 'moderate': return '#ff8800';
    case 'quiet':    return '#00ff88';
    default:         return '#888888';
  }
}

function makeMarkerIcon(color: string) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="36" viewBox="0 0 28 36">
    <path d="M14 0C6.27 0 0 6.27 0 14c0 9.625 14 22 14 22S28 23.625 28 14C28 6.27 21.73 0 14 0z" fill="${color}" opacity="0.9"/>
    <circle cx="14" cy="14" r="6" fill="white" opacity="0.9"/>
  </svg>`;
  return L.divIcon({ html: svg, className: '', iconSize: [28, 36], iconAnchor: [14, 36], popupAnchor: [0, -36] });
}

// ── Types ────────────────────────────────────────────────────────────────────

interface LeafletMapViewProps {
  venues: Venue[];
  onVenueClick?: (venueId: string) => void;
  className?: string;
  radiusKm?: number;
  gender?: 'male' | 'female';
  onCenterChange?: (lat: number, lng: number) => void;
  initialCenter?: { lat: number; lng: number };
}

// ── Component ────────────────────────────────────────────────────────────────

export function LeafletMapView({
  venues, onVenueClick, className,
  radiusKm = 5, gender = 'female',
  onCenterChange, initialCenter,
}: LeafletMapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const radarCircleRef = useRef<L.Circle | null>(null);
  const pulseCircleRef = useRef<L.Circle | null>(null);
  const venueMarkersRef = useRef<L.Marker[]>([]);
  const pulseIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pulseStartRef = useRef(Date.now());

  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);

  const center0 = initialCenter ?? MUMBAI;

  // ── Init map ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: [center0.lat, center0.lng],
      zoom: 14,
      zoomControl: false,
    });

    // CartoDB Dark Matter tiles
    L.tileLayer(
      'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
      {
        attribution: '©OpenStreetMap contributors ©CARTO',
        subdomains: 'abcd',
        maxZoom: 19,
      }
    ).addTo(map);

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Notify parent whenever dragging stops
    map.on('moveend', () => {
      const c = map.getCenter();
      onCenterChange?.(c.lat, c.lng);
    });

    mapRef.current = map;
    return () => { map.remove(); mapRef.current = null; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Radar circle (static) + pulse ring ────────────────────────────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Clear previous
    radarCircleRef.current?.remove();
    pulseCircleRef.current?.remove();
    if (pulseIntervalRef.current) clearInterval(pulseIntervalRef.current);

    const getCenter = () => map.getCenter();

    // Static radar circle
    radarCircleRef.current = L.circle([getCenter().lat, getCenter().lng], {
      radius: radiusKm * 1000,
      color: CYAN,
      weight: 2.5,
      opacity: 0.9,
      fillColor: PURPLE,
      fillOpacity: 0.2,
      interactive: false,
    }).addTo(map);

    // Pulse ring
    pulseCircleRef.current = L.circle([getCenter().lat, getCenter().lng], {
      radius: radiusKm * 1000,
      color: CYAN,
      weight: 2,
      opacity: 0.8,
      fillOpacity: 0,
      interactive: false,
    }).addTo(map);
    pulseStartRef.current = Date.now();

    // Keep circles centered on map center as user drags
    map.on('move', () => {
      const c = map.getCenter();
      radarCircleRef.current?.setLatLng(c);
      pulseCircleRef.current?.setLatLng(c);
    });

    // Pulse animation loop (20 fps)
    const tick = () => {
      const pulse = pulseCircleRef.current;
      if (!pulse) return;
      const progress = Math.min((Date.now() - pulseStartRef.current) / 2000, 1);
      pulse.setRadius(radiusKm * 1000 * (1 + progress * 0.55));
      pulse.setStyle({ opacity: 0.8 * (1 - progress) });
      if (progress >= 1) {
        pulse.setLatLng(map.getCenter());
        pulse.setRadius(radiusKm * 1000);
        pulse.setStyle({ opacity: 0.8 });
        pulseStartRef.current = Date.now();
      }
    };
    pulseIntervalRef.current = setInterval(tick, 50);

    return () => {
      radarCircleRef.current?.remove();
      pulseCircleRef.current?.remove();
      if (pulseIntervalRef.current) clearInterval(pulseIntervalRef.current);
      map.off('move');
    };
  }, [radiusKm]);

  // ── Venue markers ─────────────────────────────────────────────────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    venueMarkersRef.current.forEach(m => m.remove());
    venueMarkersRef.current = [];

    venues.forEach(venue => {
      if (!venue.lat || !venue.lng) return;
      const color = crowdColor(venue.current_crowd);
      const marker = L.marker([venue.lat, venue.lng], { icon: makeMarkerIcon(color) }).addTo(map);

      const priceStr = '₹'.repeat(venue.price_level ?? 1);
      const crowdLabel = venue.current_crowd
        ? venue.current_crowd.charAt(0).toUpperCase() + venue.current_crowd.slice(1)
        : 'Unknown';

      marker.bindPopup(`
        <div style="min-width:160px;font-family:sans-serif">
          <strong style="font-size:14px">${venue.name}</strong>
          <p style="margin:4px 0;font-size:12px;color:#666">${venue.address}</p>
          <div style="display:flex;gap:8px;font-size:12px;margin:6px 0">
            <span style="color:${color}">● ${crowdLabel}</span>
            <span>${priceStr}</span>
          </div>
          ${venue.open_hours ? `<p style="font-size:11px;color:#888;margin:2px 0">${venue.open_hours}</p>` : ''}
          <button id="lf-venue-${venue.id}"
            style="margin-top:8px;width:100%;padding:6px;
                   background:linear-gradient(135deg,${CYAN},${PURPLE});
                   color:#fff;border:none;border-radius:6px;font-size:12px;font-weight:600;cursor:pointer">
            View Details
          </button>
        </div>`);

      marker.on('popupopen', () => {
        setTimeout(() => {
          document.getElementById(`lf-venue-${venue.id}`)
            ?.addEventListener('click', () => onVenueClick?.(venue.id));
        }, 0);
      });
      venueMarkersRef.current.push(marker);
    });
  }, [venues, onVenueClick]);

  // ── Search (Nominatim) ────────────────────────────────────────────────────
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim() || !mapRef.current) return;
    setSearching(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`,
        { headers: { 'Accept-Language': 'en' } }
      );
      const data = await res.json();
      if (data.length > 0) {
        mapRef.current.flyTo([parseFloat(data[0].lat), parseFloat(data[0].lon)], 14, { duration: 1.2 });
      }
    } catch {
      // silently ignore
    } finally {
      setSearching(false);
    }
  };

  const recenter = () => {
    if (!mapRef.current) return;
    mapRef.current.flyTo([center0.lat, center0.lng], 14, { duration: 0.8 });
  };

  return (
    <div className={cn('relative w-full rounded-3xl overflow-hidden', className)}>
      <style>{`
        .leaflet-tile-pane { filter: brightness(0.9) saturate(1.1); }
        .leaflet-popup-content-wrapper { border-radius: 12px; }
        .leaflet-attribution-flag { display: none !important; }
      `}</style>

      {/* Map canvas */}
      <div ref={containerRef} className="w-full h-full" />

      {/* ── Search bar overlay (top) ── */}
      <form
        onSubmit={handleSearch}
        className="absolute top-3 left-3 right-12 z-[1000] flex items-center gap-2"
      >
        <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-xl"
          style={{ background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(16px)', border: '1px solid rgba(0,245,255,0.2)' }}>
          <Search className="w-4 h-4 flex-shrink-0" style={{ color: CYAN }} />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search any location…"
            className="flex-1 bg-transparent text-white text-sm outline-none placeholder:text-white/40"
          />
          {searching && <div className="w-4 h-4 rounded-full border-2 border-t-transparent animate-spin flex-shrink-0" style={{ borderColor: `${CYAN} transparent ${CYAN} ${CYAN}` }} />}
        </div>
      </form>

      {/* ── Fixed center pin (never moves) ── */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-[999]"
        style={{ paddingBottom: 20 }}>
        <div style={{
          filter: gender === 'female'
            ? 'drop-shadow(0 0 8px #FF1A5E) drop-shadow(0 0 18px #FF1A5E)'
            : 'drop-shadow(0 0 8px #FFD700) drop-shadow(0 0 18px #FFA500)',
        }}>
          {gender === 'female' ? <HighHeelSVG /> : <CrownSVG />}
        </div>
      </div>

      {/* ── Legend ── */}
      <div className="absolute bottom-10 left-3 z-[1000] text-white p-3 rounded-xl text-xs space-y-1"
        style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(12px)', border: '1px solid rgba(0,245,255,0.15)' }}>
        <div className="font-semibold mb-1" style={{ color: CYAN }}>Live Venues</div>
        {[['#ff0080','Busy'],['#ff8800','Moderate'],['#00ff88','Quiet']].map(([c,l]) => (
          <div key={l} className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ background: c }} />
            <span className="text-white/80">{l}</span>
          </div>
        ))}
        <div className="flex items-center gap-2 pt-1 mt-1" style={{ borderTop: '1px solid rgba(0,245,255,0.2)' }}>
          <div className="w-2 h-2 rounded-full" style={{ background: CYAN }} />
          <span className="text-white/80">Radar range</span>
        </div>
      </div>

      {/* ── Recenter ── */}
      <button onClick={recenter}
        className="absolute top-3 right-3 z-[1000] p-2 rounded-lg hover:opacity-80 transition-all"
        style={{ background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(12px)', border: '1px solid rgba(0,245,255,0.2)' }}
        title="Reset view">
        <Navigation className="w-5 h-5" style={{ color: CYAN }} />
      </button>
    </div>
  );
}
