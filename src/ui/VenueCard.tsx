import { Heart, MapPin, MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Venue } from '@/data/models';
import { CrowdBadge, PriceBadge, EleganceBadge } from './Badge';
import { formatDistance } from '@/utils/time';

interface VenueCardProps {
  venue: Venue;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
  onClick?: () => void;
  onOpenChat?: () => void;
  className?: string;
}

export function VenueCard({
  venue,
  isFavorite = false,
  onToggleFavorite,
  onClick,
  onOpenChat,
  className,
}: VenueCardProps) {
  const hasLiveContent = venue.current_crowd !== 'none';

  return (
    <div
      onClick={onClick}
      className={cn(
        'group relative overflow-hidden rounded-3xl cursor-pointer transition-all duration-300',
        'bg-black/10 backdrop-blur-xl border border-white/5 hover:border-white/10',
        'shadow-lg hover:shadow-2xl hover:scale-[1.02]',
        className
      )}
      style={{
        backdropFilter: 'blur(20px) saturate(180%)',
        background: 'linear-gradient(135deg, rgba(0,0,0,0.1) 0%, rgba(20,20,20,0.05) 50%, rgba(0,0,0,0.1) 100%)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.05)',
      }}
    >
      {/* Hero — always the venue's static cover photo */}
      <div className="relative h-48 overflow-hidden rounded-t-3xl">
        {venue.hero_image ? (
          <img src={venue.hero_image} alt={venue.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
            <span className="text-4xl font-bold text-foreground/40">{venue.name[0]}</span>
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

        {/* Crowd badge */}
        <div className="absolute top-3 left-3">
          <CrowdBadge level={venue.current_crowd || 'none'} isLive={hasLiveContent} />
        </div>

        {/* Favorite */}
        <button
          onClick={(e) => { e.stopPropagation(); onToggleFavorite?.(); }}
          className={cn(
            'absolute top-3 right-3 p-2.5 rounded-2xl transition-all duration-300',
            'bg-black/20 backdrop-blur-xl border border-white/10 hover:border-white/20 hover:scale-110',
            isFavorite
              ? 'text-primary bg-primary/10 border-primary/20 shadow-[0_0_15px_rgba(236,72,153,0.3)]'
              : 'text-white/70 hover:text-primary'
          )}
        >
          <Heart className={cn('w-5 h-5 transition-all duration-300', isFavorite && 'fill-current')} />
        </button>

        {/* Name + location */}
        <div className="absolute bottom-3 left-3 right-3">
          <h3 className="text-white font-bold text-lg mb-1 drop-shadow-lg">{venue.name}</h3>
          <div className="flex items-center gap-2 text-sm text-white/90">
            <MapPin className="w-4 h-4" />
            <span>{venue.distance ? formatDistance(venue.distance) : venue.address}</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <PriceBadge level={venue.price_level} />
          <EleganceBadge score={venue.elegance} />
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground capitalize">{venue.type}</span>
          {onOpenChat && (
            <button
              onClick={(e) => { e.stopPropagation(); onOpenChat(); }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-pink-500/10 border border-pink-400/20 hover:bg-pink-500/20 hover:border-pink-400/40 transition-all"
            >
              <MessageCircle className="w-4 h-4 text-pink-400" />
              <span className="text-xs text-pink-300 font-medium">Chat</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
