// Club Flash Loading Component - Used throughout the app

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface ClubFlashLoaderProps {
  isLoading: boolean;
  children: React.ReactNode;
  className?: string;
}

export function ClubFlashLoader({ isLoading, children, className }: ClubFlashLoaderProps) {
  const [showFlash, setShowFlash] = useState(false);

  useEffect(() => {
    if (!isLoading) return;

    const flashInterval = setInterval(() => {
      setShowFlash(prev => !prev);
    }, 300);

    return () => {
      clearInterval(flashInterval);
      setShowFlash(false);
    };
  }, [isLoading]);

  return (
    <div className={cn("relative", className)}>
      {children}
      
      {/* Club Flash Overlay */}
      {isLoading && (
        <div className="fixed inset-0 z-50 pointer-events-none">
          {/* Full screen flash effect */}
          <div className={cn(
            "absolute inset-0 transition-all duration-300",
            showFlash 
              ? "bg-gradient-to-br from-purple-500/20 via-pink-500/20 to-blue-500/20" 
              : "bg-transparent"
          )} />
          
          {/* Rotating disco lights overlay */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-gradient-to-r from-pink-500/10 to-purple-500/10 blur-3xl animate-spin" style={{ animationDuration: '3s' }} />
            <div className="absolute top-1/4 right-1/4 w-48 h-48 rounded-full bg-gradient-to-r from-blue-500/10 to-cyan-500/10 blur-3xl animate-spin" style={{ animationDuration: '4s', animationDirection: 'reverse' }} />
            <div className="absolute bottom-1/4 left-1/4 w-56 h-56 rounded-full bg-gradient-to-r from-green-500/10 to-lime-500/10 blur-3xl animate-spin" style={{ animationDuration: '5s' }} />
            <div className="absolute bottom-1/4 right-1/4 w-40 h-40 rounded-full bg-gradient-to-r from-yellow-500/10 to-orange-500/10 blur-3xl animate-spin" style={{ animationDuration: '3.5s', animationDirection: 'reverse' }} />
          </div>
          
          {/* Loading message */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-black/50 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-2xl">
              <div className="text-center">
                <p className="text-white font-bold text-xl mb-3">🎵 Welcome to the Club! 🎵</p>
                <div className="flex items-center justify-center gap-2">
                  <div className="w-3 h-3 bg-pink-400 rounded-full animate-bounce" />
                  <div className="w-3 h-3 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  <div className="w-3 h-3 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

