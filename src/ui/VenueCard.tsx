// Venue Card Component

import { Heart, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Venue } from '@/data/models';
import { CrowdBadge, PriceBadge, EleganceBadge } from './Badge';
import { formatDistance } from '@/utils/time';
import { isPostLive } from '@/utils/crowd';

interface VenueCardProps {
  venue: Venue;
  heroImage?: string;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
  onClick?: () => void;
  className?: string;
}

export function VenueCard({ 
  venue, 
  heroImage, 
  isFavorite = false, 
  onToggleFavorite,
  onClick,
  className 
}: VenueCardProps) {
  const hasLiveContent = venue.current_crowd !== 'none';

  return (
    <div
      onClick={onClick}
      className={cn(
        'group relative overflow-hidden rounded-3xl glass-card cursor-pointer transition-smooth hover:scale-[1.02]',
        hasLiveContent && 'glow-primary',
        className
      )}
    >
      {/* Hero Image */}
      <div className="relative h-48 overflow-hidden">
        {(heroImage || (venue as Venue & { hero_image?: string }).hero_image) ? (
          <img
            src={heroImage || (venue as Venue & { hero_image?: string }).hero_image}
            alt={venue.name}
            className="w-full h-full object-cover transition-smooth group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-gradient-neon flex items-center justify-center">
            <span className="text-2xl font-bold text-white/80">{venue.name[0]}</span>
          </div>
        )}
        
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        
        {/* Crowd badge */}
        <div className="absolute top-3 left-3">
          <CrowdBadge 
            level={venue.current_crowd || 'none'} 
            isLive={hasLiveContent}
          />
        </div>
        
        {/* Favorite button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite?.();
          }}
          className={cn(
            'absolute top-3 right-3 p-2 rounded-full glass-light transition-smooth hover:scale-110',
            isFavorite && 'text-neon-pink glow-primary'
          )}
        >
          <Heart 
            className={cn('w-5 h-5', isFavorite && 'fill-current')} 
          />
        </button>
        
        {/* Bottom info overlay */}
        <div className="absolute bottom-3 left-3 right-3">
          <h3 className="text-white font-bold text-lg mb-1">{venue.name}</h3>
          <div className="flex items-center gap-2 text-white/80 text-sm">
            <MapPin className="w-4 h-4" />
            <span>{venue.distance ? formatDistance(venue.distance) : venue.address}</span>
          </div>
        </div>
      </div>
      
      {/* Card content */}
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <PriceBadge level={venue.price_level} />
            <EleganceBadge score={venue.elegance} />
          </div>
          
          <div className="text-xs text-muted-foreground capitalize">
            {venue.type}
          </div>
        </div>
      </div>
    </div>
  );
}