// Audio file management for background music

// You can add your own music files here
const musicFiles = {
  cyberpunk1: '/audio/cyberpunk-ambient.mp3',
  cyberpunk2: '/audio/neon-city.mp3',
  electronic: '/audio/electronic-beat.mp3',
  // Add more music files as needed
};

let currentAudio: HTMLAudioElement | null = null;
let isPlaying = false;

export const playBackgroundMusicFile = (musicKey: keyof typeof musicFiles) => {
  try {
    // Stop current music if playing
    if (currentAudio) {
      currentAudio.pause();
      currentAudio = null;
    }

    // Create new audio element
    currentAudio = new Audio(musicFiles[musicKey]);
    currentAudio.loop = true;
    currentAudio.volume = 0.3; // Lower volume for background music
    
    // Play the music
    currentAudio.play().then(() => {
      isPlaying = true;
    }).catch((error) => {
      console.log('Could not play audio:', error);
    });

  } catch (error) {
    console.log('Audio file not found or not supported');
  }
};

export const stopBackgroundMusic = () => {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio = null;
    isPlaying = false;
  }
};

export const setMusicVolume = (volume: number) => {
  if (currentAudio) {
    currentAudio.volume = Math.max(0, Math.min(1, volume));
  }
};

export const isMusicPlaying = () => isPlaying;


