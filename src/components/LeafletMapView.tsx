// Leaflet + OpenStreetMap venue map (no API key required)

import { useEffect, useRef } from 'react';
import { Navigation } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Venue } from '@/data/models';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet's broken default icon paths in Vite
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

interface LeafletMapViewProps {
  venues: Venue[];
  onVenueClick?: (venueId: string) => void;
  className?: string;
  userLocation?: { lat: number; lng: number } | null;
}

const MUMBAI = { lat: 19.076, lng: 72.8777 };

function crowdColor(level?: string) {
  switch (level) {
    case 'busy':     return '#ff0080';
    case 'moderate': return '#ff8800';
    case 'quiet':    return '#00ff88';
    default:         return '#888888';
  }
}

function venueIcon(type?: string) {
  switch (type) {
    case 'restaurant': return '🍽️';
    case 'club':       return '🎵';
    case 'event':      return '🎉';
    default:           return '📍';
  }
}

function makeMarkerIcon(color: string) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="36" viewBox="0 0 28 36">
      <path d="M14 0C6.27 0 0 6.27 0 14c0 9.625 14 22 14 22S28 23.625 28 14C28 6.27 21.73 0 14 0z"
            fill="${color}" opacity="0.9"/>
      <circle cx="14" cy="14" r="6" fill="white" opacity="0.9"/>
    </svg>`;
  return L.divIcon({
    html: svg,
    className: '',
    iconSize: [28, 36],
    iconAnchor: [14, 36],
    popupAnchor: [0, -36],
  });
}

function makeUserIcon() {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20">
      <circle cx="10" cy="10" r="8" fill="#00ddff" opacity="0.9" stroke="white" stroke-width="2"/>
    </svg>`;
  return L.divIcon({
    html: svg,
    className: '',
    iconSize: [20, 20],
    iconAnchor: [10, 10],
    popupAnchor: [0, -12],
  });
}

export function LeafletMapView({ venues, onVenueClick, className, userLocation }: LeafletMapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const venueMarkersRef = useRef<L.Marker[]>([]);

  // Initialize map once
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: [MUMBAI.lat, MUMBAI.lng],
      zoom: 13,
      zoomControl: false,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      className: 'map-tiles-dark',
    }).addTo(map);

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update user location marker
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (userMarkerRef.current) {
      userMarkerRef.current.remove();
      userMarkerRef.current = null;
    }

    if (userLocation) {
      const marker = L.marker([userLocation.lat, userLocation.lng], { icon: makeUserIcon() })
        .addTo(map)
        .bindPopup('<b>You are here</b>');
      userMarkerRef.current = marker;
      map.setView([userLocation.lat, userLocation.lng], 15);
    }
  }, [userLocation]);

  // Update venue markers
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
          <div style="font-size:18px;margin-bottom:4px">${venueIcon(venue.type)}</div>
          <strong style="font-size:14px">${venue.name}</strong>
          <p style="margin:4px 0;font-size:12px;color:#666">${venue.address}</p>
          <div style="display:flex;gap:8px;font-size:12px;margin:6px 0">
            <span style="color:${color}">● ${crowdLabel}</span>
            <span>${priceStr}</span>
          </div>
          ${venue.open_hours ? `<p style="font-size:11px;color:#888;margin:2px 0">${venue.open_hours}</p>` : ''}
          <button
            id="lf-venue-${venue.id}"
            style="margin-top:8px;width:100%;padding:6px;background:linear-gradient(135deg,#00ff88,#0088ff);
                   color:#fff;border:none;border-radius:6px;font-size:12px;font-weight:600;cursor:pointer"
          >View Details</button>
        </div>
      `);

      marker.on('popupopen', () => {
        setTimeout(() => {
          document.getElementById(`lf-venue-${venue.id}`)
            ?.addEventListener('click', () => onVenueClick?.(venue.id));
        }, 0);
      });

      venueMarkersRef.current.push(marker);
    });
  }, [venues, onVenueClick]);

  const recenter = () => {
    if (!mapRef.current) return;
    const center = userLocation ?? MUMBAI;
    mapRef.current.setView([center.lat, center.lng], 15);
  };

  return (
    <div className={cn('relative w-full rounded-3xl overflow-hidden', className)}>
      {/* Dark overlay filter for the tiles */}
      <style>{`
        .map-tiles-dark { filter: brightness(0.6) saturate(0.4) hue-rotate(180deg); }
        .leaflet-popup-content-wrapper { border-radius: 12px; }
        .leaflet-attribution-flag { display: none !important; }
      `}</style>

      <div ref={containerRef} className="w-full h-full" />

      {/* Legend */}
      <div className="absolute bottom-10 left-3 z-[1000] bg-black/70 backdrop-blur-md text-white p-3 rounded-xl text-xs space-y-1">
        <div className="font-semibold mb-1">Live Venues</div>
        {[['busy','#ff0080','Busy'],['moderate','#ff8800','Moderate'],['quiet','#00ff88','Quiet']].map(([,c,l]) => (
          <div key={l} className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ background: c }} />
            <span className="text-white/80">{l}</span>
          </div>
        ))}
        {userLocation && (
          <div className="flex items-center gap-2 pt-1 mt-1 border-t border-white/20">
            <div className="w-2 h-2 rounded-full bg-cyan-400" />
            <span className="text-white/80">You</span>
          </div>
        )}
      </div>

      {/* Re-center button */}
      <button
        onClick={recenter}
        className="absolute top-3 right-3 z-[1000] p-2 bg-black/60 backdrop-blur-md rounded-lg hover:bg-black/80 transition-all"
        title="Center map"
      >
        <Navigation className="w-5 h-5 text-cyan-400" />
      </button>
    </div>
  );
}
