// Enhanced Audio hook with proper state management

import { useEffect, useState } from 'react';
import { 
  playBackgroundMusic, 
  pauseBackgroundMusic,
  resumeBackgroundMusic,
  stopBackgroundMusic,
  addAudioStateListener
} from '@/utils/audio';

export const useAudio = () => {
  const [isMusicEnabled, setIsMusicEnabled] = useState(false);
  const [isActuallyPlaying, setIsActuallyPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    // Check if user has previously enabled music
    const savedMusicPreference = localStorage.getItem('music-enabled');
    if (savedMusicPreference === 'true') {
      setIsMusicEnabled(true);
    }

    // Listen to actual audio state changes
    const unsubscribe = addAudioStateListener((playing, paused) => {
      setIsActuallyPlaying(playing);
      setIsPaused(paused);
      
      // Sync the enabled state with actual playback
      if (playing) {
        setIsMusicEnabled(true);
        localStorage.setItem('music-enabled', 'true');
      }
    });

    return unsubscribe;
  }, []);

  const toggleMusic = () => {
    if (isActuallyPlaying) {
      // Music is playing, pause it
      pauseBackgroundMusic();
    } else if (isPaused) {
      // Music is paused, resume it
      resumeBackgroundMusic();
    } else {
      // Music is stopped, start it
      playBackgroundMusic();
    }
  };

  // Function to enable music (called when auto-playing on auth screen)
  const enableMusic = () => {
    setIsMusicEnabled(true);
    localStorage.setItem('music-enabled', 'true');
  };

  // Button sounds disabled as requested
  const playButtonClick = () => {
    // No button sounds
  };

  return {
    isMusicEnabled: isActuallyPlaying, // Show the actual playing state
    isPlaying: isActuallyPlaying,
    isPaused,
    toggleMusic,
    enableMusic,
    playButtonClick,
  };
};
