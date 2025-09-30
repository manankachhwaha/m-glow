// Venue Detail Screen

import { useState, useEffect } from 'react';
import { ArrowLeft, Heart, MessageCircle, HelpCircle, Phone, Globe, MapPin, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CrowdBadge, PriceBadge, EleganceBadge } from '@/ui/Badge';
import type { VenueDetail as VenueDetailType, Post } from '@/data/models';
import { MockDataSource } from '@/data/sources/MockDataSource';
import { getPostAge } from '@/utils/crowd';

const dataSource = new MockDataSource();

interface VenueDetailProps {
  venueId: string;
  onBack: () => void;
  onOpenChat: () => void;
}

export function VenueDetail({ venueId, onBack, onOpenChat }: VenueDetailProps) {
  const [venueDetail, setVenueDetail] = useState<VenueDetailType | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    loadVenueDetail();
  }, [venueId]);

  const loadVenueDetail = async () => {
    setLoading(true);
    try {
      const detail = await dataSource.getVenue(venueId);
      setVenueDetail(detail);
      
      const favorites = await dataSource.getFavorites();
      setIsFavorite(favorites.includes(venueId));
    } catch (error) {
      console.error('Failed to load venue detail:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFavorite = async () => {
    try {
      const newState = await dataSource.toggleFavorite(venueId);
      setIsFavorite(newState);
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="animate-pulse">
          <div className="h-80 bg-muted rounded-b-3xl" />
          <div className="p-6 space-y-4">
            <div className="h-8 bg-muted rounded" />
            <div className="h-4 bg-muted rounded w-2/3" />
            <div className="grid grid-cols-3 gap-4">
              {Array.from({ length: 6 }, (_, i) => (
                <div key={i} className="h-24 bg-muted rounded-2xl" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!venueDetail) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Venue not found</h2>
          <button
            onClick={onBack}
            className="text-primary hover:text-primary/80 transition-smooth"
          >
            Go back
          </button>
        </div>
      </div>
    );
  }

  const { venue, today_posts, current_crowd } = venueDetail;
  const heroPost = today_posts[0];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative">
        {/* Hero Image */}
        <div className="h-80 overflow-hidden">
          {heroPost ? (
            <img
              src={heroPost.media_url}
              alt={venue.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-neon flex items-center justify-center">
              <span className="text-4xl font-bold text-white/80">{venue.name[0]}</span>
            </div>
          )}
          
          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60" />
        </div>

        {/* Header controls */}
        <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between">
          <button
            onClick={onBack}
            className="p-3 rounded-full glass-light transition-smooth hover:scale-105"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <CrowdBadge level={current_crowd} isLive={current_crowd !== 'none'} />
            <button
              onClick={handleToggleFavorite}
              className={cn(
                'p-3 rounded-full glass-light transition-smooth hover:scale-105',
                isFavorite && 'text-neon-pink glow-primary'
              )}
            >
              <Heart className={cn('w-5 h-5', isFavorite && 'fill-current')} />
            </button>
          </div>
        </div>

        {/* Privacy indicator */}
        {heroPost && (
          <div className="absolute bottom-4 left-4">
            <div className="px-3 py-1 rounded-full glass-light text-xs text-white/80">
              Privacy: Blur faces (On)
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="px-4 -mt-6 relative z-10">
        {/* Main info card */}
        <div className="glass-card rounded-3xl p-6 mb-6">
          <h1 className="text-2xl font-bold mb-2">{venue.name}</h1>
          
          <div className="flex items-center gap-2 text-muted-foreground mb-4">
            <MapPin className="w-4 h-4" />
            <span>{venue.address}</span>
          </div>

          <div className="flex items-center gap-4 mb-6">
            <PriceBadge level={venue.price_level} />
            <EleganceBadge score={venue.elegance} />
            <span className="text-sm text-muted-foreground capitalize">{venue.type}</span>
          </div>

          {/* Action buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={onOpenChat}
              className="flex items-center justify-center gap-2 py-3 px-4 bg-primary text-primary-foreground rounded-2xl font-medium transition-smooth hover:scale-105 glow-primary"
            >
              <MessageCircle className="w-5 h-5" />
              Chat
            </button>
            <button className="flex items-center justify-center gap-2 py-3 px-4 glass-light rounded-2xl font-medium transition-smooth hover:bg-primary/10">
              <HelpCircle className="w-5 h-5" />
              FAQ
            </button>
          </div>
        </div>

        {/* Contact info */}
        <div className="glass-card rounded-3xl p-6 mb-6">
          <h2 className="font-semibold mb-4">Contact & Hours</h2>
          <div className="space-y-3">
            {venue.phone && (
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-primary" />
                <span>{venue.phone}</span>
              </div>
            )}
            {venue.website && (
              <div className="flex items-center gap-3">
                <Globe className="w-5 h-5 text-primary" />
                <span className="text-primary">{venue.website}</span>
              </div>
            )}
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-primary" />
              <span>{venue.open_hours || 'Hours not available'}</span>
            </div>
          </div>
        </div>

        {/* Today's posts */}
        {today_posts.length > 0 && (
          <div className="glass-card rounded-3xl p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold">Today's Live Updates</h2>
              <span className="text-sm text-muted-foreground">
                {today_posts.length} posts
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              {today_posts.slice(0, 6).map((post) => (
                <PostThumbnail key={post.id} post={post} />
              ))}
            </div>
            
            {today_posts.length > 6 && (
              <button className="w-full mt-4 py-3 text-primary font-medium text-sm transition-smooth hover:text-primary/80">
                View all {today_posts.length} posts
              </button>
            )}
          </div>
        )}

        {/* No live updates */}
        {today_posts.length === 0 && (
          <div className="glass-card rounded-3xl p-6 mb-6 text-center">
            <div className="text-muted-foreground mb-2">No live updates yet today</div>
            <div className="text-xs text-muted-foreground">
              Check back later for real-time venue content
            </div>
          </div>
        )}

        {/* Bottom spacing */}
        <div className="h-20" />
      </div>
    </div>
  );
}

function PostThumbnail({ post }: { post: Post }) {
  return (
    <div className="relative aspect-square rounded-2xl overflow-hidden group">
      <img
        src={post.thumb_url}
        alt="Venue update"
        className="w-full h-full object-cover transition-smooth group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
      <div className="absolute bottom-2 left-2 right-2">
        <div className="text-white text-xs font-medium">
          {getPostAge(post.created_at)}
        </div>
      </div>
      {post.faces_blurred && (
        <div className="absolute top-2 right-2">
          <div className="w-2 h-2 bg-success rounded-full" title="Faces blurred" />
        </div>
      )}
    </div>
  );
}