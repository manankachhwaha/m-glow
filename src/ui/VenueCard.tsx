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
        'group relative overflow-hidden rounded-3xl cursor-pointer transition-all duration-200',
        'bg-black/20 backdrop-blur-2xl border border-white/10',
        'shadow-lg hover:shadow-xl',
        hasLiveContent && 'shadow-[0_0_20px_rgba(236,72,153,0.3)]',
        className
      )}
      style={{
        background: 'linear-gradient(135deg, rgba(0,0,0,0.3) 0%, rgba(20,20,20,0.2) 50%, rgba(0,0,0,0.3) 100%)',
        backdropFilter: 'blur(20px) saturate(180%)',
        border: '1px solid rgba(255,255,255,0.1)',
        boxShadow: hasLiveContent 
          ? '0 8px 32px rgba(236,72,153,0.3), inset 0 1px 0 rgba(255,255,255,0.1)' 
          : '0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)'
      }}
    >
      {/* Hero Image */}
      <div className="relative h-48 overflow-hidden rounded-t-3xl">
        {(heroImage || (venue as Venue & { hero_image?: string }).hero_image) ? (
                <img
                  src={heroImage || (venue as Venue & { hero_image?: string }).hero_image}
                  alt={venue.name}
                  className="w-full h-full object-cover transition-none"
                />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-pink-500/30 via-purple-500/30 to-blue-500/30 flex items-center justify-center">
            <span className="text-2xl font-bold text-white/90 drop-shadow-lg">{venue.name[0]}</span>
          </div>
        )}
        
        {/* Enhanced overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        
        {/* Subtle border glow */}
        <div className="absolute inset-0 rounded-t-3xl border border-white/5" />
        
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
            'absolute top-3 right-3 p-2.5 rounded-2xl transition-all duration-200 hover:scale-105',
            'bg-black/30 backdrop-blur-xl border border-white/20',
            isFavorite 
              ? 'text-pink-400 bg-pink-500/20 border-pink-400/30 shadow-[0_0_15px_rgba(236,72,153,0.3)]' 
              : 'text-white/70 hover:text-pink-400 hover:border-pink-400/30'
          )}
          style={{
            backdropFilter: 'blur(20px) saturate(180%)',
            boxShadow: isFavorite 
              ? '0 4px 16px rgba(236,72,153,0.3), inset 0 1px 0 rgba(255,255,255,0.1)' 
              : '0 4px 16px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.1)'
          }}
        >
          <Heart 
            className={cn('w-5 h-5 transition-all duration-200', isFavorite && 'fill-current')} 
          />
        </button>
        
        {/* Enhanced Bottom info overlay */}
        <div className="absolute bottom-3 left-3 right-3">
          <div 
            className="mb-2 p-2 rounded-xl"
            style={{
              background: 'linear-gradient(135deg, rgba(0,0,0,0.6) 0%, rgba(20,20,20,0.4) 100%)',
              backdropFilter: 'blur(10px) saturate(180%)',
              border: '1px solid rgba(255,255,255,0.1)',
              boxShadow: '0 4px 16px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)'
            }}
          >
            <h3 
              className="text-white font-bold text-lg mb-1"
              style={{
                textShadow: '0 2px 4px rgba(0,0,0,0.8)',
                background: 'linear-gradient(135deg, rgba(255,255,255,1) 0%, rgba(236,72,153,0.8) 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              {venue.name}
            </h3>
          </div>
          
          <div 
            className="flex items-center gap-2 text-sm px-2 py-1 rounded-lg"
            style={{
              background: 'linear-gradient(135deg, rgba(0,0,0,0.4) 0%, rgba(20,20,20,0.3) 100%)',
              backdropFilter: 'blur(10px) saturate(180%)',
              border: '1px solid rgba(255,255,255,0.1)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
            }}
          >
            <MapPin 
              className="w-4 h-4" 
              style={{
                color: 'rgba(236,72,153,1)',
                filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.8))'
              }}
            />
            <span 
              className="text-white/90 font-medium"
              style={{
                textShadow: '0 1px 2px rgba(0,0,0,0.8)'
              }}
            >
              {venue.distance ? formatDistance(venue.distance) : venue.address}
            </span>
          </div>
        </div>
      </div>
      
      {/* Enhanced Card content */}
      <div className="p-5 bg-gradient-to-b from-transparent to-black/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <PriceBadge level={venue.price_level} />
            <EleganceBadge score={venue.elegance} />
          </div>
          
          <div className="text-xs text-white/60 capitalize bg-black/20 backdrop-blur-xl rounded-xl px-2 py-1 border border-white/10">
            {venue.type}
          </div>
        </div>
      </div>
    </div>
  );
}