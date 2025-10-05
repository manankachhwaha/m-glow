// Authentication Screen with Real Logos

import { useState, useEffect } from 'react';
import { MapPin, Smartphone, Mail } from 'lucide-react';
import { cn } from '@/lib/utils';
import { GoogleSignInButton, AppleSignInButton, FacebookSignInButton, SocialLogin } from '@/components/AuthComponents';
import { playBackgroundMusic } from '@/utils/audio';
import { useAudio } from '@/hooks/use-audio';

interface AuthProps {
  onAuth: () => void;
}

export function Auth({ onAuth }: AuthProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { enableMusic } = useAudio();

  // Auto-play music on first user interaction (browser autoplay restriction)
  useEffect(() => {
    const handleFirstInteraction = async () => {
      try {
        console.log('🎵 Starting music on first user interaction...');
        await playBackgroundMusic();
        // Enable music state so the toggle button shows correct state
        enableMusic();
        
        // Remove event listeners after first interaction
        document.removeEventListener('click', handleFirstInteraction);
        document.removeEventListener('touchstart', handleFirstInteraction);
        document.removeEventListener('keydown', handleFirstInteraction);
      } catch (error) {
        console.log('🎵 Music start failed:', error);
      }
    };

    // Add event listeners for first user interaction
    document.addEventListener('click', handleFirstInteraction, { once: true });
    document.addEventListener('touchstart', handleFirstInteraction, { once: true });
    document.addEventListener('keydown', handleFirstInteraction, { once: true });

    // Cleanup function
    return () => {
      document.removeEventListener('click', handleFirstInteraction);
      document.removeEventListener('touchstart', handleFirstInteraction);
      document.removeEventListener('keydown', handleFirstInteraction);
    };
  }, [enableMusic]);

  const handleAuth = async (provider: 'apple' | 'google' | 'email') => {
    setIsLoading(true);
    
    // Simulate authentication
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsLoading(false);
    onAuth();
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Hero Section */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 py-12">
        {/* Logo/Brand */}
        <div className="mb-8 text-center">
          <div className="w-20 h-20 rounded-3xl bg-gradient-neon flex items-center justify-center mx-auto mb-4 glow-primary">
            <span className="text-2xl font-bold text-white">CS</span>
          </div>
          <h1 className="text-3xl font-bold mb-2 bg-gradient-neon bg-clip-text text-transparent">
            CrowdSphere
          </h1>
          <p className="text-muted-foreground text-lg">
            Discover live nightlife vibes
          </p>
        </div>

        {/* Features showcase */}
        <div className="grid grid-cols-3 gap-6 mb-12 w-full max-w-sm">
          <div className="text-center">
            <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center mx-auto mb-2">
              <MapPin className="w-6 h-6 text-primary" />
            </div>
            <p className="text-xs text-muted-foreground">Live venue discovery</p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 rounded-2xl bg-secondary/20 flex items-center justify-center mx-auto mb-2">
              <div className="w-3 h-3 bg-success rounded-full animate-pulse" />
            </div>
            <p className="text-xs text-muted-foreground">Real-time crowd levels</p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 rounded-2xl bg-success/20 flex items-center justify-center mx-auto mb-2">
              <Smartphone className="w-6 h-6 text-success" />
            </div>
            <p className="text-xs text-muted-foreground">Owner-verified content</p>
          </div>
        </div>

        {/* Real Auth buttons with proper logos */}
        <div className="w-full max-w-sm space-y-4">
          <AppleSignInButton onClick={() => handleAuth('apple')} />
          <GoogleSignInButton onClick={() => handleAuth('google')} />
          <FacebookSignInButton onClick={() => handleAuth('email')} />
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-card-border/50" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-background text-muted-foreground">or</span>
            </div>
          </div>
          
          <button
            onClick={() => handleAuth('email')}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 py-4 px-6 glass-light rounded-2xl font-medium transition-smooth hover:scale-[1.02] disabled:opacity-50"
          >
            <Mail className="w-5 h-5" />
            Continue with Email
          </button>
        </div>

        {isLoading && (
          <div className="mt-6 flex items-center gap-2 text-sm text-muted-foreground">
            <div className="w-4 h-4 border-2 border-muted-foreground/30 border-t-muted-foreground rounded-full animate-spin" />
            Signing you in...
          </div>
        )}
      </div>

      {/* Location permission prompt */}
      <div className="px-6 pb-6">
        <div className="glass-card rounded-3xl p-6 text-center">
          <MapPin className="w-8 h-8 text-primary mx-auto mb-3" />
          <h3 className="font-semibold mb-2">Enable Location</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Discover nearby venues and get personalized recommendations based on your location.
          </p>
          <div className="text-xs text-muted-foreground">
            We'll ask for permission after you sign in
          </div>
        </div>
      </div>

      {/* Terms */}
      <div className="px-6 pb-8 text-center">
        <p className="text-xs text-muted-foreground">
          By continuing, you agree to our{' '}
          <span className="text-primary">Terms of Service</span> and{' '}
          <span className="text-primary">Privacy Policy</span>
        </p>
      </div>
    </div>
  );
}