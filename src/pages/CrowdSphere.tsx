// Main CrowdSphere App with Navigation

import { useState, useEffect } from 'react';
import { Home as HomeIcon, Zap, MessageSquare, User, Upload } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Home } from '@/features/Home';
import { SupabaseStatus } from '@/components/SupabaseStatus';
import { VenueDetail } from '@/features/VenueDetail';
import { LiveFeed } from '@/features/LiveFeed';
import { Chat } from '@/features/Chat';
import { BusinessDashboard } from '@/features/BusinessDashboard';
import { Auth } from '@/features/Auth';
import { Profile } from '@/features/Profile';

type Screen = 'auth' | 'home' | 'feed' | 'owner' | 'profile' | 'venue-detail' | 'chat';

interface ScreenState {
  current: Screen;
  venueId?: string;
  venueName?: string;
  chatId?: string;
}

export default function CrowdSphere() {
  const [isAuthenticated, setIsAuthenticated] = useState(() =>
    localStorage.getItem('auth_session') === 'true'
  );
  const [screenState, setScreenState] = useState<ScreenState>(() => ({
    current: localStorage.getItem('auth_session') === 'true' ? 'home' : 'auth',
  }));
  const [isBusinessMode, setIsBusinessMode] = useState(false);
  const [ownerVenueId, setOwnerVenueId] = useState('');
  const [ownerVenueName, setOwnerVenueName] = useState('');

  const syncOwnerState = () => {
    setIsBusinessMode(localStorage.getItem('business-mode') === 'true');
    setOwnerVenueId(localStorage.getItem('owner_venue_id') || '');
    setOwnerVenueName(localStorage.getItem('owner_venue_name') || '');
  };

  useEffect(() => {
    syncOwnerState();
  }, []);

  useEffect(() => {
    window.addEventListener('storage', syncOwnerState);
    return () => window.removeEventListener('storage', syncOwnerState);
  }, []);

  const handleAuth = () => {
    localStorage.setItem('auth_session', 'true');
    setIsAuthenticated(true);
    setScreenState({ current: 'home' });
  };

  const navigateToVenue = (venueId: string) => {
    setScreenState({ current: 'venue-detail', venueId });
  };

  const navigateToChat = (venueId: string, venueName: string) => {
    setScreenState({ current: 'chat', venueId, venueName });
  };

  const navigateToScreen = (screen: Screen) => {
    setScreenState({ current: screen });
  };

  const goBack = () => {
    setScreenState({ current: 'home' });
  };

  const handleLogout = () => {
    localStorage.removeItem('auth_session');
    setIsAuthenticated(false);
    setScreenState({ current: 'auth' });
  };

  if (!isAuthenticated) {
    return <Auth onAuth={handleAuth} />;
  }

  const renderScreen = () => {
    switch (screenState.current) {
      case 'home':
        return <Home onVenueClick={navigateToVenue} onOpenChat={navigateToChat} />;
      
      case 'feed':
        return <LiveFeed onVenueClick={navigateToVenue} />;
      
      case 'owner':
        return <BusinessDashboard />;
      
      case 'venue-detail':
        return (
          <VenueDetail
            venueId={screenState.venueId!}
            onBack={goBack}
            onOpenChat={() => navigateToChat(screenState.venueId!, 'Venue')}
          />
        );
      
      case 'chat':
        return (
          <Chat
            venueId={screenState.venueId!}
            venueName={screenState.venueName!}
            onBack={goBack}
          />
        );
      
      case 'profile':
        return <Profile onLogout={handleLogout} />;
      
      default:
        return <Home onVenueClick={navigateToVenue} />;
    }
  };

  const showBottomNav = !['venue-detail', 'chat'].includes(screenState.current);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Supabase connection status — temporary diagnostic */}
      <SupabaseStatus />

      {/* Main content */}
      <div className={cn('pb-safe', showBottomNav && 'pb-20')}>
        {renderScreen()}
      </div>

      {/* Bottom Navigation */}
      {showBottomNav && (
        <div className="fixed bottom-0 left-0 right-0 z-50 backdrop-blur-md bg-background/80 border-t border-card-border/50 safe-area-inset-bottom">
          <div className="flex items-center justify-around py-2">
            <NavButton
              icon={HomeIcon}
              label="Home"
              isActive={screenState.current === 'home'}
              onClick={() => navigateToScreen('home')}
            />
            <NavButton
              icon={Zap}
              label="Live"
              isActive={screenState.current === 'feed'}
              onClick={() => navigateToScreen('feed')}
            />
            {isBusinessMode && (
              <NavButton
                icon={Upload}
                label="Owner"
                isActive={screenState.current === 'owner'}
                onClick={() => navigateToScreen('owner')}
              />
            )}
            <NavButton
              icon={User}
              label="Profile"
              isActive={screenState.current === 'profile'}
              onClick={() => navigateToScreen('profile')}
            />
          </div>
        </div>
      )}
    </div>
  );
}

interface NavButtonProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  isActive: boolean;
  onClick: () => void;
}

function NavButton({ icon: Icon, label, isActive, onClick }: NavButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex flex-col items-center gap-1 px-3 py-2 rounded-2xl transition-smooth',
        isActive 
          ? 'text-primary glow-primary' 
          : 'text-muted-foreground hover:text-foreground'
      )}
    >
      <Icon className={cn('w-6 h-6', isActive && 'animate-pulse')} />
      <span className="text-xs font-medium">{label}</span>
    </button>
  );
}