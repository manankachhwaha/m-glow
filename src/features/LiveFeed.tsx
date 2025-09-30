// Live Feed Screen - Today's Posts

import { useState, useEffect } from 'react';
import { RefreshCw, MapPin, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CrowdBadge } from '@/ui/Badge';
import type { Post } from '@/data/models';
import { MockDataSource } from '@/data/sources/MockDataSource';
import { getPostAge } from '@/utils/crowd';

const dataSource = new MockDataSource();

interface LiveFeedProps {
  onVenueClick?: (venueId: string) => void;
}

export function LiveFeed({ onVenueClick }: LiveFeedProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadFeed();
  }, []);

  const loadFeed = async () => {
    try {
      const feedPosts = await dataSource.listTodayFeed();
      setPosts(feedPosts);
    } catch (error) {
      console.error('Failed to load feed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadFeed();
    setRefreshing(false);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-50 backdrop-blur-md bg-background/80 border-b border-card-border/50">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold">Live Feed</h1>
              <p className="text-sm text-muted-foreground">Today's venue updates</p>
            </div>
            
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className={cn(
                'p-3 rounded-2xl glass-light transition-smooth hover:bg-primary/10',
                refreshing && 'opacity-50'
              )}
            >
              <RefreshCw className={cn('w-5 h-5', refreshing && 'animate-spin')} />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-4">
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }, (_, i) => (
              <div key={i} className="h-80 rounded-3xl glass-card animate-pulse" />
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12">
            <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No live updates yet</h3>
            <p className="text-muted-foreground">Check back later for real-time venue content</p>
          </div>
        ) : (
          <div className="space-y-6">
            {posts.map((post) => (
              <FeedPostCard key={post.id} post={post} onVenueClick={onVenueClick} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function FeedPostCard({ post, onVenueClick }: { post: Post; onVenueClick?: (venueId: string) => void }) {
  return (
    <div className="glass-card rounded-3xl overflow-hidden">
      {/* Venue header */}
      <div className="p-4 border-b border-card-border/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-neon flex items-center justify-center">
              <span className="text-white font-bold text-sm">
                {post.venue?.name?.[0] || 'V'}
              </span>
            </div>
            <div>
              <h3 className="font-semibold">{post.venue?.name || 'Unknown Venue'}</h3>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="w-3 h-3" />
                <span>{post.venue?.address}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <CrowdBadge 
              level={post.venue?.current_crowd || 'none'} 
              showText={false}
              isLive={post.venue?.current_crowd !== 'none'}
            />
            <span className="text-xs text-muted-foreground">
              {getPostAge(post.created_at)}
            </span>
          </div>
        </div>
      </div>

      {/* Media content */}
      <div className="relative">
        <img
          src={post.media_url}
          alt="Venue update"
          className="w-full aspect-[4/3] object-cover"
        />
        
        {/* Owner verified badge */}
        <div className="absolute top-3 left-3">
          <div className="px-2 py-1 rounded-full glass-light text-xs text-white/90">
            Owner-verified upload
          </div>
        </div>
        
        {/* Privacy indicator */}
        {post.faces_blurred && (
          <div className="absolute top-3 right-3">
            <div className="px-2 py-1 rounded-full bg-success/20 border border-success/40 text-xs text-success">
              Faces blurred
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="p-4">
        <button 
          onClick={() => onVenueClick?.(post.venue_id)}
          className="text-primary text-sm font-medium hover:text-primary/80 transition-smooth"
        >
          View Venue Details
        </button>
      </div>
    </div>
  );
}