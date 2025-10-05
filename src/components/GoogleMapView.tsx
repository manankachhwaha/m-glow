// Google Maps View with Real Venue Locations

import { useState, useEffect, useRef, useCallback } from 'react';
import { MapPin, Users, Star, Navigation, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MAPS_CONFIG, isGoogleMapsConfigured, getGoogleMapsScriptUrl } from '@/config/maps';
import { GoogleMapsSetup } from './GoogleMapsSetup';
import type { Venue } from '@/data/models';

interface GoogleMapViewProps {
  venues: Venue[];
  onVenueClick?: (venueId: string) => void;
  className?: string;
  userLocation?: { lat: number; lng: number } | null;
}

export function GoogleMapView({ venues, onVenueClick, className, userLocation }: GoogleMapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [markers, setMarkers] = useState<google.maps.Marker[]>([]);
  const [isConfigured, setIsConfigured] = useState(false);
  const [userMarker, setUserMarker] = useState<google.maps.Marker | null>(null);

  // Check if Google Maps is configured
  useEffect(() => {
    setIsConfigured(isGoogleMapsConfigured());
  }, []);

  // Initialize Google Maps
  useEffect(() => {
    const initMap = () => {
      if (mapRef.current && !map && isConfigured) {
        const mapInstance = new google.maps.Map(mapRef.current, {
          center: userLocation || MAPS_CONFIG.DEFAULT_CENTER,
          zoom: userLocation ? 15 : 13,
          styles: MAPS_CONFIG.DARK_STYLE,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
        });

        setMap(mapInstance);
      }
    };

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
  }, [isConfigured, map, userLocation]);

  // Add user location marker
  useEffect(() => {
    if (!map || !userLocation) return;

    // Remove existing user marker
    if (userMarker) {
      userMarker.setMap(null);
    }

    // Create user location marker
    const marker = new google.maps.Marker({
      position: userLocation,
      map: map,
      title: 'Your Location',
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 8,
        fillColor: '#00ff88',
        fillOpacity: 1,
        strokeColor: '#ffffff',
        strokeWeight: 2,
      },
    });

    setUserMarker(marker);

    // Center map on user location
    map.setCenter(userLocation);
    map.setZoom(15);
  }, [map, userLocation, userMarker]);

  // Add venue markers
  useEffect(() => {
    if (!map) return;

    // Clear existing markers
    markers.forEach(marker => marker.setMap(null));
    setMarkers([]);

    const newMarkers: google.maps.Marker[] = [];

    venues.forEach((venue) => {
      if (venue.lat && venue.lng) {
        const marker = new google.maps.Marker({
          position: { lat: venue.lat, lng: venue.lng },
          map: map,
          title: venue.name,
          icon: {
            path: google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
            scale: 6,
            fillColor: getCrowdColor(venue.current_crowd),
            fillOpacity: 0.8,
            strokeColor: '#ffffff',
            strokeWeight: 1,
          },
        });

        // Create info window
        const infoWindow = new google.maps.InfoWindow({
          content: createInfoWindowContent(venue, userLocation),
        });

        // Add click listeners
        marker.addListener('click', () => {
          // Close other info windows
          newMarkers.forEach(m => {
            const iw = (m as google.maps.Marker & { infoWindow?: google.maps.InfoWindow }).infoWindow;
            if (iw) iw.close();
          });
          
          infoWindow.open(map, marker);
        });

        // Store info window reference
        (marker as google.maps.Marker & { infoWindow: google.maps.InfoWindow }).infoWindow = infoWindow;

        // Add venue click handler
        google.maps.event.addListener(infoWindow, 'domready', () => {
          const button = document.getElementById(`venue-button-${venue.id}`);
          if (button) {
            button.addEventListener('click', () => {
              onVenueClick?.(venue.id);
            });
          }
        });

        newMarkers.push(marker);
      }
    });

    setMarkers(newMarkers);
  }, [map, venues, userLocation, onVenueClick, createInfoWindowContent, markers]);

  const getCrowdColor = (crowdLevel?: string) => {
    switch (crowdLevel) {
      case 'busy': return '#ff0080';
      case 'moderate': return '#ff8800';
      case 'quiet': return '#00ff88';
      default: return '#888888';
    }
  };

  const calculateDistance = (venue: Venue, userLoc?: { lat: number; lng: number } | null) => {
    if (!userLoc || !venue.lat || !venue.lng) return null;
    
    const R = 6371; // Earth's radius in km
    const dLat = (venue.lat - userLoc.lat) * Math.PI / 180;
    const dLng = (venue.lng - userLoc.lng) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(userLoc.lat * Math.PI / 180) * Math.cos(venue.lat * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    
    return distance < 1 ? `${Math.round(distance * 1000)}m` : `${distance.toFixed(1)}km`;
  };

  const createInfoWindowContent = useCallback((venue: Venue, userLoc?: { lat: number; lng: number } | null) => {
    const distance = calculateDistance(venue, userLoc);
    
    return `
      <div style="padding: 12px; min-width: 200px; color: #333;">
        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
          <span style="font-size: 18px;">${getVenueIcon(venue.type)}</span>
          <h3 style="margin: 0; font-size: 16px; font-weight: 600;">${venue.name}</h3>
        </div>
        
        <p style="margin: 4px 0; font-size: 14px; color: #666;">${venue.address}</p>
        
        <div style="display: flex; align-items: center; gap: 12px; margin: 8px 0;">
          ${venue.elegance ? `
            <div style="display: flex; align-items: center; gap: 4px;">
              <span style="color: #ffd700;">⭐</span>
              <span style="font-size: 14px;">${(venue.elegance * 5).toFixed(1)}</span>
            </div>
          ` : ''}
          
          ${venue.current_crowd ? `
            <div style="display: flex; align-items: center; gap: 4px;">
              <span style="color: ${getCrowdColor(venue.current_crowd)};">👥</span>
              <span style="font-size: 14px; text-transform: capitalize;">${venue.current_crowd}</span>
            </div>
          ` : ''}
          
          ${distance ? `
            <div style="display: flex; align-items: center; gap: 4px;">
              <span style="color: #00ff88;">📍</span>
              <span style="font-size: 14px;">${distance}</span>
            </div>
          ` : ''}
        </div>
        
        <button 
          id="venue-button-${venue.id}"
          style="
            background: linear-gradient(135deg, #00ff88, #0088ff);
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            margin-top: 8px;
            width: 100%;
          "
        >
          View Details
        </button>
      </div>
    `;
  }, [calculateDistance, getCrowdColor, getVenueIcon]);

  const getVenueIcon = (type?: string) => {
    switch (type) {
      case 'restaurant': return '🍽️';
      case 'bar': return '🍸';
      case 'club': return '🎵';
      case 'cafe': return '☕';
      case 'lounge': return '🛋️';
      default: return '📍';
    }
  };

  // Show setup helper if not configured
  if (!isConfigured) {
    return (
      <div className={cn('w-full h-full flex items-center justify-center p-4', className)}>
        <GoogleMapsSetup />
      </div>
    );
  }

  return (
    <div className={cn('relative w-full h-full rounded-3xl overflow-hidden', className)}>
      <div ref={mapRef} className="w-full h-full" />
      
      {/* Map legend */}
      <div className="absolute bottom-4 left-4 glass-card p-3 rounded-xl">
        <div className="text-xs font-semibold text-white mb-2">Live Venues</div>
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs">
            <div className="w-2 h-2 bg-neon-red rounded-full"></div>
            <span className="text-white/80">Busy</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="w-2 h-2 bg-neon-orange rounded-full"></div>
            <span className="text-white/80">Moderate</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="w-2 h-2 bg-neon-green rounded-full"></div>
            <span className="text-white/80">Quiet</span>
          </div>
          {userLocation && (
            <div className="flex items-center gap-2 text-xs mt-2 pt-2 border-t border-white/20">
              <div className="w-2 h-2 bg-neon-cyan rounded-full"></div>
              <span className="text-white/80">Your Location</span>
            </div>
          )}
        </div>
      </div>

      {/* Location controls */}
      {userLocation && (
        <div className="absolute top-4 right-4">
          <button 
            onClick={() => {
              if (map && userLocation) {
                map.setCenter(userLocation);
                map.setZoom(15);
              }
            }}
            className="p-2 glass-light rounded-lg hover:bg-white/10 transition-all duration-300"
            title="Center on your location"
          >
            <Navigation className="w-5 h-5 text-neon-cyan" />
          </button>
        </div>
      )}
    </div>
  );
}
