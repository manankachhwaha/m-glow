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
      console.log('🎵 Audio state changed:', { playing, paused });
      setIsActuallyPlaying(playing);
      setIsPaused(paused);
      
      // Sync the enabled state with actual playback
      if (playing) {
        setIsMusicEnabled(true);
        localStorage.setItem('music-enabled', 'true');
      } else if (!paused) {
        // Music stopped completely
        setIsMusicEnabled(false);
        localStorage.removeItem('music-enabled');
      }
    });

    return unsubscribe;
  }, []);

  const toggleMusic = () => {
    console.log('🎵 Toggle music called:', { isActuallyPlaying, isPaused });
    
    if (isActuallyPlaying) {
      // Music is playing, pause it
      console.log('🎵 Pausing music...');
      pauseBackgroundMusic();
    } else if (isPaused) {
      // Music is paused, resume it
      console.log('🎵 Resuming music...');
      resumeBackgroundMusic();
    } else {
      // Music is stopped, start it
      console.log('🎵 Starting music...');
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
