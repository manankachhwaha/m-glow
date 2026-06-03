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
        'group relative overflow-hidden rounded-3xl cursor-pointer transition-all duration-300',
        'bg-black/10 backdrop-blur-xl border border-white/5 hover:border-white/10',
        'shadow-lg hover:shadow-2xl hover:scale-[1.02] hover:bg-black/15',
        className
      )}
      style={{
        backdropFilter: 'blur(20px) saturate(180%)',
        background: 'linear-gradient(135deg, rgba(0,0,0,0.1) 0%, rgba(20,20,20,0.05) 50%, rgba(0,0,0,0.1) 100%)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.05)'
      }}
    >
      {/* Hero Image */}
      <div className="relative h-48 overflow-hidden rounded-t-3xl">
        {(heroImage || (venue as Venue & { hero_image?: string }).hero_image) ? (
          <img
            src={heroImage || (venue as Venue & { hero_image?: string }).hero_image}
            alt={venue.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
            <span className="text-2xl font-bold text-foreground">{venue.name[0]}</span>
          </div>
        )}
        
        {/* Simple overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        
        {/* Crowd badge */}
        <div className="absolute top-3 left-3">
          <CrowdBadge 
            level={venue.current_crowd || 'none'} 
            isLive={hasLiveContent}
          />
        </div>
        
        {/* Enhanced Favorite button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite?.();
          }}
          className={cn(
            'absolute top-3 right-3 p-2.5 rounded-2xl transition-all duration-300',
            'bg-black/20 backdrop-blur-xl border border-white/10 hover:border-white/20',
            'hover:scale-110 hover:bg-black/30',
            isFavorite 
              ? 'text-primary bg-primary/10 border-primary/20 shadow-[0_0_15px_rgba(236,72,153,0.3)]' 
              : 'text-white/70 hover:text-primary'
          )}
          style={{
            backdropFilter: 'blur(20px) saturate(180%)',
            boxShadow: '0 4px 16px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.1)'
          }}
        >
          <Heart className={cn('w-5 h-5 transition-all duration-300', isFavorite && 'fill-current')} />
        </button>
        
        {/* Simple Bottom info */}
        <div className="absolute bottom-3 left-3 right-3">
          <h3 className="text-white font-bold text-lg mb-2 drop-shadow-lg">
            {venue.name}
          </h3>
          
          <div className="flex items-center gap-2 text-sm text-white/90">
            <MapPin className="w-4 h-4" />
            <span>
              {venue.distance ? formatDistance(venue.distance) : venue.address}
            </span>
          </div>
        </div>
      </div>
      
      {/* Simple Card content */}
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
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