import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useAudio } from "@/hooks/use-audio";
// Audio controls are now handled by the useAudio hook
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  const { isMusicEnabled, toggleMusic } = useAudio();

  // Handle music toggle with backend-controlled music
  const handleMusicToggle = () => {
    console.log('🎮 Music button clicked!');
    console.log('🎮 Current music state:', isMusicEnabled);
    toggleMusic();
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
        
        {/* Floating Cyberpunk Music Control */}
        <div className="fixed bottom-6 right-6 z-30">
          <button
            onClick={handleMusicToggle}
            className={`
              group relative w-14 h-14 rounded-full backdrop-blur-xl border-2 transition-all duration-500 
              hover:scale-110 active:scale-95 transform-gpu shadow-2xl
              ${isMusicEnabled 
                ? 'bg-gradient-to-br from-neon-cyan/40 to-neon-blue/30 border-neon-cyan/70 shadow-[0_0_25px_rgba(6,182,212,0.5)] hover:shadow-[0_0_35px_rgba(6,182,212,0.7)]' 
                : 'bg-gradient-to-br from-muted/50 to-muted/40 border-card-border/70 hover:border-neon-pink/70 hover:shadow-[0_0_20px_rgba(236,72,153,0.4)]'
              }
            `}
            title={isMusicEnabled ? 'Pause Music' : 'Play Music'}
          >
            {/* Animated background glow */}
            <div className={`
              absolute inset-0 rounded-full transition-all duration-500
              ${isMusicEnabled 
                ? 'bg-gradient-to-br from-neon-cyan/20 to-neon-blue/20 animate-pulse' 
                : 'bg-gradient-to-br from-muted/10 to-muted/5'
              }
            `} />
            
            {/* Fancy Icon */}
            <div className="relative z-10 flex items-center justify-center w-full h-full">
              {isMusicEnabled ? (
                // Fancy Pause Icon
                <div className="relative">
                  <svg 
                    width="20" 
                    height="20" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    className={`
                      transition-all duration-300
                      ${isMusicEnabled ? 'text-neon-cyan drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]' : 'text-muted-foreground'}
                    `}
                  >
                    <rect x="6" y="4" width="4" height="16" rx="1" fill="currentColor" />
                    <rect x="14" y="4" width="4" height="16" rx="1" fill="currentColor" />
                  </svg>
                  {/* Pulsing rings */}
                  <div className="absolute inset-0 rounded-full border border-neon-cyan/40 animate-ping" />
                  <div className="absolute inset-0 rounded-full border border-neon-cyan/20 animate-ping" style={{ animationDelay: '0.5s' }} />
                </div>
              ) : (
                // Fancy Play Icon
                <div className="relative">
                  <svg 
                    width="20" 
                    height="20" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    className={`
                      transition-all duration-300 ml-0.5
                      ${isMusicEnabled ? 'text-neon-cyan' : 'text-neon-pink drop-shadow-[0_0_8px_rgba(236,72,153,0.8)]'}
                    `}
                  >
                    <path 
                      d="M8 5v14l11-7z" 
                      fill="currentColor"
                    />
                  </svg>
                  {/* Rotating rings */}
                  <div className="absolute inset-0 rounded-full border border-neon-pink/40 animate-spin" style={{ animationDuration: '3s' }} />
                  <div className="absolute inset-0 rounded-full border border-neon-pink/20 animate-spin" style={{ animationDuration: '2s', animationDirection: 'reverse' }} />
                </div>
              )}
            </div>
            
            {/* Status indicator */}
            <div className={`
              absolute -top-1 -right-1 w-3 h-3 rounded-full transition-all duration-300
              ${isMusicEnabled 
                ? 'bg-neon-cyan shadow-[0_0_10px_rgba(6,182,212,0.8)] animate-pulse' 
                : 'bg-muted-foreground/50'
              }
            `} />
            
            {/* Hover effect overlay */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </button>
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
