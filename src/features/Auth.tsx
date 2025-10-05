// Nightclub-Themed Authentication Screen

import { useState, useEffect } from 'react';
import { MapPin, Smartphone, Mail, Music, Volume2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { GoogleSignInButton, AppleSignInButton, FacebookSignInButton, SocialLogin } from '@/components/AuthComponents';
import { useAudio } from '@/hooks/use-audio';

interface AuthProps {
  onAuth: () => void;
}

export function Auth({ onAuth }: AuthProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showClubFlash, setShowClubFlash] = useState(false);
  const { toggleMusic } = useAudio();

  // Auto-play music on first user interaction (browser autoplay restriction)
  useEffect(() => {
    let hasTriggered = false;
    
    const handleFirstInteraction = async () => {
      if (hasTriggered) return;
      hasTriggered = true;
      
      try {
        console.log('🎵 Starting music on first user interaction...');
        toggleMusic(); // Use the centralized music toggle instead of direct calls
      } catch (error) {
        console.log('🎵 Music start failed:', error);
      }
    };

    // Add event listeners for first user interaction
    const events = ['click', 'touchstart', 'keydown'];
    events.forEach(event => {
      document.addEventListener(event, handleFirstInteraction, { once: true });
    });

    // Cleanup function
    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleFirstInteraction);
      });
    };
  }, [toggleMusic]);

  const handleAuth = async (provider: 'apple' | 'google' | 'email') => {
    setIsLoading(true);
    
    // Club flash effect during loading
    const flashInterval = setInterval(() => {
      setShowClubFlash(prev => !prev);
    }, 300);
    
    // Simulate authentication
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    clearInterval(flashInterval);
    setShowClubFlash(false);
    setIsLoading(false);
    onAuth();
  };

  return (
    <div className={cn(
      "min-h-screen flex flex-col relative overflow-hidden transition-all duration-300",
      showClubFlash ? "bg-gradient-to-br from-purple-900 via-pink-900 to-blue-900" : "bg-gradient-to-br from-black via-gray-900 to-black"
    )}>
      {/* Nightclub Disco Lights Background */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Rotating disco lights */}
        <div className="absolute top-10 left-10 w-32 h-32 rounded-full bg-gradient-to-r from-pink-500/20 to-purple-500/20 blur-xl animate-spin" style={{ animationDuration: '4s' }} />
        <div className="absolute top-20 right-20 w-24 h-24 rounded-full bg-gradient-to-r from-blue-500/20 to-cyan-500/20 blur-xl animate-spin" style={{ animationDuration: '3s', animationDirection: 'reverse' }} />
        <div className="absolute bottom-20 left-20 w-28 h-28 rounded-full bg-gradient-to-r from-green-500/20 to-lime-500/20 blur-xl animate-spin" style={{ animationDuration: '5s' }} />
        <div className="absolute bottom-10 right-10 w-20 h-20 rounded-full bg-gradient-to-r from-yellow-500/20 to-orange-500/20 blur-xl animate-spin" style={{ animationDuration: '3.5s', animationDirection: 'reverse' }} />
        
        {/* Moving light beams */}
        <div className="absolute top-0 left-1/4 w-1 h-full bg-gradient-to-b from-pink-500/30 via-transparent to-transparent animate-pulse" style={{ animationDuration: '2s' }} />
        <div className="absolute top-0 right-1/4 w-1 h-full bg-gradient-to-b from-blue-500/30 via-transparent to-transparent animate-pulse" style={{ animationDuration: '2.5s', animationDelay: '0.5s' }} />
        <div className="absolute top-0 left-3/4 w-1 h-full bg-gradient-to-b from-green-500/30 via-transparent to-transparent animate-pulse" style={{ animationDuration: '1.8s', animationDelay: '1s' }} />
      </div>

      {/* Club Flash Overlay */}
      {showClubFlash && (
        <div className="absolute inset-0 bg-white/10 animate-pulse pointer-events-none" style={{ animationDuration: '0.3s' }} />
      )}

      {/* Hero Section */}
      <div className="relative z-10 flex-1 flex flex-col justify-center items-center px-6 py-12">
        {/* Enhanced Logo/Brand */}
        <div className="mb-8 text-center">
          <div className="relative mb-6">
            {/* Glowing music note logo */}
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-pink-500/40 via-purple-500/40 to-blue-500/40 backdrop-blur-xl border-2 border-white/20 flex items-center justify-center mx-auto shadow-2xl relative overflow-hidden">
              <Music className="w-12 h-12 text-white drop-shadow-2xl" />
              
              {/* Rotating glow ring */}
              <div className="absolute inset-0 rounded-3xl border-2 border-pink-500/30 animate-spin" style={{ animationDuration: '8s' }} />
              
              {/* Pulse effect */}
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-pink-500/20 to-blue-500/20 animate-pulse" />
            </div>
            
            {/* Floating music notes */}
            <div className="absolute -top-2 -right-2 animate-bounce" style={{ animationDelay: '0.5s' }}>
              <Volume2 className="w-5 h-5 text-pink-400 drop-shadow-glow" />
            </div>
            <div className="absolute -bottom-2 -left-2 animate-bounce" style={{ animationDelay: '1s' }}>
              <Music className="w-4 h-4 text-blue-400 drop-shadow-glow" />
            </div>
          </div>
          
          <h1 className="text-4xl font-black mb-3 bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 bg-clip-text text-transparent drop-shadow-2xl">
            CrowdSphere
          </h1>
          <p className="text-white/80 text-lg font-medium tracking-wide">
            🎵 Discover live nightlife vibes 🎵
          </p>
        </div>

        {/* Nightclub-themed Features showcase */}
        <div className="grid grid-cols-3 gap-6 mb-12 w-full max-w-sm">
          <div className="text-center group">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-500/30 to-purple-500/30 backdrop-blur-xl border border-pink-400/30 flex items-center justify-center mx-auto mb-2 transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg" style={{ boxShadow: '0 0 20px rgba(236, 72, 153, 0.3)' }}>
              <MapPin className="w-6 h-6 text-pink-400 drop-shadow-glow" />
            </div>
            <p className="text-xs text-white/70 font-medium">Live venue discovery</p>
          </div>
          
          <div className="text-center group">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500/30 to-cyan-500/30 backdrop-blur-xl border border-blue-400/30 flex items-center justify-center mx-auto mb-2 transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg" style={{ boxShadow: '0 0 20px rgba(59, 130, 246, 0.3)' }}>
              <div className="relative">
                <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse drop-shadow-glow" />
                <div className="absolute inset-0 w-3 h-3 bg-blue-400 rounded-full animate-ping opacity-75" />
              </div>
            </div>
            <p className="text-xs text-white/70 font-medium">Real-time crowd levels</p>
          </div>
          
          <div className="text-center group">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-green-500/30 to-lime-500/30 backdrop-blur-xl border border-green-400/30 flex items-center justify-center mx-auto mb-2 transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg" style={{ boxShadow: '0 0 20px rgba(34, 197, 94, 0.3)' }}>
              <Smartphone className="w-6 h-6 text-green-400 drop-shadow-glow" />
            </div>
            <p className="text-xs text-white/70 font-medium">Owner-verified content</p>
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
          <div className="mt-6 flex flex-col items-center gap-3">
            <div className="text-center">
              <p className="text-white font-bold text-lg mb-2">🎵 Welcome to the Club! 🎵</p>
              <div className="flex items-center justify-center gap-2">
                <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Nightclub-themed Location permission prompt */}
      <div className="relative z-10 px-6 pb-6">
        <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-xl border border-white/20 rounded-3xl p-6 text-center shadow-2xl">
          <div className="relative mb-4">
            <MapPin className="w-8 h-8 text-pink-400 mx-auto drop-shadow-glow" />
            <div className="absolute inset-0 w-8 h-8 mx-auto rounded-full bg-pink-400/20 animate-pulse" />
          </div>
          <h3 className="font-bold text-white mb-2 text-lg">📍 Enable Location</h3>
          <p className="text-sm text-white/80 mb-4 leading-relaxed">
            Discover nearby clubs and get personalized nightlife recommendations based on your location.
          </p>
          <div className="text-xs text-white/60 font-medium tracking-wide">
            We'll ask for permission after you sign in
          </div>
        </div>
      </div>

      {/* Nightclub-themed Terms */}
      <div className="relative z-10 px-6 pb-8 text-center">
        <p className="text-xs text-white/60 leading-relaxed">
          By continuing, you agree to our{' '}
          <span className="text-pink-400 font-medium hover:text-pink-300 transition-colors cursor-pointer">Terms of Service</span> and{' '}
          <span className="text-blue-400 font-medium hover:text-blue-300 transition-colors cursor-pointer">Privacy Policy</span>
        </p>
      </div>
    </div>
  );
}