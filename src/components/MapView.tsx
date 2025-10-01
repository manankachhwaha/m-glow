// Map View Component with Interactive Venue Pins

import { useState, useEffect } from 'react';
import { MapPin, Users, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Venue } from '@/data/models';

interface MapViewProps {
  venues: Venue[];
  onVenueClick?: (venueId: string) => void;
  className?: string;
}

interface MapPinData {
  id: string;
  x: number;
  y: number;
  venue: Venue;
}

export function MapView({ venues, onVenueClick, className }: MapViewProps) {
  const [pins, setPins] = useState<MapPinData[]>([]);
  const [hoveredPin, setHoveredPin] = useState<string | null>(null);

  useEffect(() => {
    // Generate random positions for venue pins
    const generatePins = () => {
      return venues.map((venue, index) => ({
        id: venue.id,
        x: 20 + (index * 15) % 60 + Math.random() * 20,
        y: 20 + (index * 20) % 60 + Math.random() * 20,
        venue
      }));
    };

    setPins(generatePins());
  }, [venues]);

  const getCrowdColor = (crowdLevel: string) => {
    switch (crowdLevel) {
      case 'busy': return 'text-neon-red';
      case 'moderate': return 'text-neon-orange';
      case 'quiet': return 'text-neon-green';
      default: return 'text-muted-foreground';
    }
  };

  const getCrowdGlow = (crowdLevel: string) => {
    switch (crowdLevel) {
      case 'busy': return 'glow-primary';
      case 'moderate': return 'glow-secondary';
      case 'quiet': return 'glow-success';
      default: return '';
    }
  };

  return (
    <div className={cn('relative w-full h-96 bg-gradient-cyber rounded-3xl overflow-hidden', className)}>
      {/* Map background grid */}
      <div className="absolute inset-0 opacity-20">
        <div className="w-full h-full" style={{
          backgroundImage: `
            linear-gradient(rgba(0, 255, 255, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 255, 255, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '20px 20px'
        }} />
      </div>

      {/* Venue pins */}
      {pins.map((pin) => (
        <div
          key={pin.id}
          className={cn(
            'absolute cursor-pointer transition-all duration-300 hover:scale-125',
            getCrowdColor(pin.venue.current_crowd || 'none'),
            getCrowdGlow(pin.venue.current_crowd || 'none')
          )}
          style={{
            left: `${pin.x}%`,
            top: `${pin.y}%`,
            transform: 'translate(-50%, -50%)'
          }}
          onClick={() => onVenueClick?.(pin.venue.id)}
          onMouseEnter={() => setHoveredPin(pin.id)}
          onMouseLeave={() => setHoveredPin(null)}
        >
          <div className="relative">
            <MapPin className="w-8 h-8 drop-shadow-lg" />
            
            {/* Pulse animation for live venues */}
            {pin.venue.current_crowd !== 'none' && (
              <div className="absolute inset-0 animate-ping">
                <MapPin className="w-8 h-8 opacity-30" />
              </div>
            )}

            {/* Hover tooltip */}
            {hoveredPin === pin.id && (
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 glass-card rounded-lg whitespace-nowrap z-10">
                <div className="text-sm font-semibold text-white">{pin.venue.name}</div>
                <div className="text-xs text-neon-cyan/80">{pin.venue.address}</div>
                <div className="flex items-center gap-1 mt-1">
                  <Users className="w-3 h-3" />
                  <span className="text-xs capitalize">{pin.venue.current_crowd || 'none'}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="w-3 h-3 text-neon-lime" />
                  <span className="text-xs">{(pin.venue.elegance * 5).toFixed(1)}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      ))}

      {/* Map legend */}
      <div className="absolute bottom-4 left-4 glass-card p-3 rounded-xl">
        <div className="text-xs font-semibold text-white mb-2">Live Venues</div>
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs">
            <div className="w-2 h-2 bg-neon-red rounded-full glow-primary"></div>
            <span className="text-white/80">Busy</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="w-2 h-2 bg-neon-orange rounded-full glow-secondary"></div>
            <span className="text-white/80">Moderate</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="w-2 h-2 bg-neon-green rounded-full glow-success"></div>
            <span className="text-white/80">Quiet</span>
          </div>
        </div>
      </div>

      {/* Map controls */}
      <div className="absolute top-4 right-4 flex flex-col gap-2">
        <button className="p-2 glass-light rounded-lg hover:bg-white/10 transition-all duration-300">
          <span className="text-white text-sm">+</span>
        </button>
        <button className="p-2 glass-light rounded-lg hover:bg-white/10 transition-all duration-300">
          <span className="text-white text-sm">−</span>
        </button>
      </div>
    </div>
  );
}


