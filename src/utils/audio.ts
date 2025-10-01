// Backend-Controlled Audio System

import { MUSIC_CONFIG, getMusicUrl } from '@/config/music';

let currentAudio: HTMLAudioElement | null = null;
let isPlaying = false;
let audioContext: AudioContext | null = null;
let synthesizedMusicInterval: NodeJS.Timeout | null = null;
let isSynthesizedPlaying = false;

// Initialize audio context on first user interaction
const initAudioContext = () => {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioContext;
};

// Play backend-controlled background music
export const playBackgroundMusic = async (customUrl?: string) => {
  try {
    console.log('🎵 Starting music playback...');
    
    // Stop ALL current music first
    stopAllMusic();
    
    // Get music URL (from config or custom)
    const musicUrl = customUrl || await getMusicUrl();
    console.log('🎵 Music URL:', musicUrl);
    
    // Create new audio element with backend URL
    currentAudio = new Audio(musicUrl);
    currentAudio.loop = MUSIC_CONFIG.LOOP;
    currentAudio.volume = MUSIC_CONFIG.VOLUME;
    currentAudio.crossOrigin = 'anonymous';
    
    // Add comprehensive event listeners
    currentAudio.addEventListener('loadstart', () => console.log('🔄 Loading music...'));
    currentAudio.addEventListener('loadeddata', () => console.log('📊 Music data loaded'));
    currentAudio.addEventListener('canplay', () => console.log('✅ Music can play'));
    currentAudio.addEventListener('canplaythrough', () => console.log('✅ Music ready to play through'));
    currentAudio.addEventListener('play', () => console.log('▶️ Music started playing'));
    currentAudio.addEventListener('pause', () => console.log('⏸️ Music paused'));
    currentAudio.addEventListener('error', (e) => {
      console.error('❌ Music error:', e);
      console.error('❌ Error details:', currentAudio?.error);
      console.log('🎵 Music failed to load. Please check your Google Drive sharing settings.');
    });
    currentAudio.addEventListener('abort', () => console.log('🛑 Music aborted'));
    currentAudio.addEventListener('stalled', () => console.log('⏳ Music stalled'));
    
    // Play the music
    console.log('🎵 Attempting to play music...');
    const playPromise = currentAudio.play();
    
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          isPlaying = true;
          console.log('🎵 Music started successfully!');
        })
        .catch((error) => {
          console.error('❌ Failed to play music:', error);
          console.error('❌ Error name:', error.name);
          console.error('❌ Error message:', error.message);
          console.log('🎵 Music failed to play. Please check your Google Drive sharing settings.');
        });
    }

  } catch (error) {
    console.error('❌ Audio setup error:', error);
    console.log('🎵 Music setup failed. Please check your Google Drive sharing settings.');
  }
};

// Fallback synthesized music (original cyberpunk tones)
const createCyberpunkTone = (frequency: number, duration: number, context: AudioContext) => {
  const oscillator = context.createOscillator();
  const gainNode = context.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(context.destination);
  
  oscillator.frequency.setValueAtTime(frequency, context.currentTime);
  oscillator.type = 'sawtooth';
  
  gainNode.gain.setValueAtTime(0, context.currentTime);
  gainNode.gain.linearRampToValueAtTime(0.1, context.currentTime + 0.01);
  gainNode.gain.exponentialRampToValueAtTime(0.001, context.currentTime + duration);
  
  oscillator.start(context.currentTime);
  oscillator.stop(context.currentTime + duration);
};


// Stop ALL music (both external and synthesized)
const stopAllMusic = () => {
  console.log('🛑 Stopping all music...');
  
  // Stop external audio
  if (currentAudio) {
    currentAudio.pause();
    currentAudio = null;
  }
  
  // Stop synthesized music
  if (synthesizedMusicInterval) {
    clearInterval(synthesizedMusicInterval);
    synthesizedMusicInterval = null;
  }
  
  isPlaying = false;
  isSynthesizedPlaying = false;
  console.log('✅ All music stopped');
};

const playSynthesizedMusic = () => {
  try {
    console.log('🎵 Starting synthesized cyberpunk music...');
    const context = initAudioContext();
    
    // Stop any existing synthesized music
    if (synthesizedMusicInterval) {
      clearInterval(synthesizedMusicInterval);
    }
    
    const playSequence = () => {
      // Create a more complex cyberpunk ambient melody
      const melody = [
        { freq: 220, time: 0, duration: 0.8 },
        { freq: 277, time: 0.5, duration: 0.6 },
        { freq: 330, time: 1, duration: 0.8 },
        { freq: 277, time: 1.5, duration: 0.6 },
        { freq: 220, time: 2, duration: 0.8 },
        { freq: 185, time: 2.5, duration: 0.6 },
        { freq: 220, time: 3, duration: 0.8 },
        { freq: 277, time: 3.5, duration: 0.6 },
        { freq: 330, time: 4, duration: 0.8 },
        { freq: 392, time: 4.5, duration: 0.6 },
        { freq: 330, time: 5, duration: 0.8 },
        { freq: 277, time: 5.5, duration: 0.6 },
        { freq: 220, time: 6, duration: 0.8 },
        { freq: 185, time: 6.5, duration: 0.6 },
        { freq: 220, time: 7, duration: 0.8 },
      ];
      
      melody.forEach((note, index) => {
        setTimeout(() => {
          createCyberpunkTone(note.freq, note.duration, context);
        }, note.time * 1000);
      });
    };
    
    // Start the sequence
    playSequence();
    
    // Repeat every 8 seconds
    synthesizedMusicInterval = setInterval(playSequence, 8000);
    
    isPlaying = true;
    console.log('🎵 Synthesized music started!');
    
  } catch (error) {
    console.log('🎵 Synthesized music not supported or user interaction required');
  }
};

// Stop background music
export const stopBackgroundMusic = () => {
  stopAllMusic();
};

// Set custom music URL
export const setCustomMusicURL = (url: string) => {
  console.log('🔄 Setting custom music URL:', url);
  // If music is currently playing, restart with new URL
  if (isPlaying) {
    stopBackgroundMusic();
    setTimeout(() => {
      playBackgroundMusic(url);
    }, 100);
  } else {
    playBackgroundMusic(url);
  }
};

// Get current music status
export const isMusicPlaying = () => isPlaying;

// Button click sound - Fixed version
export const playButtonSound = () => {
  try {
    const context = initAudioContext();
    
    const oscillator = context.createOscillator();
    const gainNode = context.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(context.destination);
    
    oscillator.frequency.setValueAtTime(800, context.currentTime);
    oscillator.type = 'square';
    
    gainNode.gain.setValueAtTime(0.1, context.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.1);
    
    oscillator.start(context.currentTime);
    oscillator.stop(context.currentTime + 0.1);
  } catch (error) {
    console.log('Button sound not supported');
  }
};

// Success sound - Fixed version
export const playSuccessSound = () => {
  try {
    const context = initAudioContext();
    
    const oscillator = context.createOscillator();
    const gainNode = context.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(context.destination);
    
    oscillator.frequency.setValueAtTime(600, context.currentTime);
    oscillator.frequency.setValueAtTime(800, context.currentTime + 0.1);
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.2, context.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.3);
    
    oscillator.start(context.currentTime);
    oscillator.stop(context.currentTime + 0.3);
  } catch (error) {
    console.log('Success sound not supported');
  }
};

// Error sound - Fixed version
export const playErrorSound = () => {
  try {
    const context = initAudioContext();
    
    const oscillator = context.createOscillator();
    const gainNode = context.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(context.destination);
    
    oscillator.frequency.setValueAtTime(200, context.currentTime);
    oscillator.type = 'sawtooth';
    
    gainNode.gain.setValueAtTime(0.1, context.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.2);
    
    oscillator.start(context.currentTime);
    oscillator.stop(context.currentTime + 0.2);
  } catch (error) {
    console.log('Error sound not supported');
  }
};
