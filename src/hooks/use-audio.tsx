// Simplified Audio hook for backend-controlled music

import { useEffect, useState } from 'react';
import { 
  playBackgroundMusic, 
  stopBackgroundMusic,
  isMusicPlaying
} from '@/utils/audio';

export const useAudio = () => {
  const [isMusicEnabled, setIsMusicEnabled] = useState(false);

  useEffect(() => {
    // Check if user has previously enabled music
    const savedMusicPreference = localStorage.getItem('music-enabled');
    if (savedMusicPreference === 'true') {
      setIsMusicEnabled(true);
    }
  }, []);

  // Function to enable music (called when auto-playing on auth screen)
  const enableMusic = () => {
    setIsMusicEnabled(true);
    localStorage.setItem('music-enabled', 'true');
  };

  const toggleMusic = () => {
    const newState = !isMusicEnabled;
    setIsMusicEnabled(newState);
    localStorage.setItem('music-enabled', newState.toString());
    
    if (newState) {
      // Play backend-controlled music
      playBackgroundMusic();
    } else {
      stopBackgroundMusic();
    }
  };

  // Button sounds disabled as requested
  const playButtonClick = () => {
    // No button sounds
  };

  return {
    isMusicEnabled,
    toggleMusic,
    enableMusic,
    playButtonClick,
  };
};
