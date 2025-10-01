// Completely New Audio System - Clean and Simple

class AudioManager {
  private static instance: AudioManager;
  private backgroundAudio: HTMLAudioElement | null = null;
  private audioContext: AudioContext | null = null;
  private isMusicEnabled = false;
  private isSoundEnabled = true;
  private currentVolume = 0.3;

  static getInstance(): AudioManager {
    if (!AudioManager.instance) {
      AudioManager.instance = new AudioManager();
    }
    return AudioManager.instance;
  }

  // Initialize audio context on first user interaction
  private initAudioContext(): AudioContext {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return this.audioContext;
  }

  // Play background music from URL
  async playBackgroundMusic(url?: string): Promise<void> {
    try {
      // Stop current music
      this.stopBackgroundMusic();

      if (!url) {
        console.log('No music URL provided');
        return;
      }

      // Create new audio element
      this.backgroundAudio = new Audio(url);
      this.backgroundAudio.loop = true;
      this.backgroundAudio.volume = this.currentVolume;
      this.backgroundAudio.crossOrigin = 'anonymous';

      // Play the music
      await this.backgroundAudio.play();
      this.isMusicEnabled = true;
      console.log('Background music started');
    } catch (error) {
      console.error('Failed to play background music:', error);
      this.isMusicEnabled = false;
    }
  }

  // Stop background music
  stopBackgroundMusic(): void {
    if (this.backgroundAudio) {
      this.backgroundAudio.pause();
      this.backgroundAudio.currentTime = 0;
      this.backgroundAudio = null;
    }
    this.isMusicEnabled = false;
  }

  // Set volume
  setVolume(volume: number): void {
    this.currentVolume = Math.max(0, Math.min(1, volume));
    if (this.backgroundAudio) {
      this.backgroundAudio.volume = this.currentVolume;
    }
  }

  // Play button click sound
  playButtonSound(): void {
    if (!this.isSoundEnabled) return;

    try {
      const context = this.initAudioContext();
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
      console.log('Button sound failed:', error);
    }
  }

  // Play success sound
  playSuccessSound(): void {
    if (!this.isSoundEnabled) return;

    try {
      const context = this.initAudioContext();
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
      console.log('Success sound failed:', error);
    }
  }

  // Play error sound
  playErrorSound(): void {
    if (!this.isSoundEnabled) return;

    try {
      const context = this.initAudioContext();
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
      console.log('Error sound failed:', error);
    }
  }

  // Getters
  get isMusicPlaying(): boolean {
    return this.isMusicEnabled && this.backgroundAudio !== null;
  }

  get isSoundOn(): boolean {
    return this.isSoundEnabled;
  }

  get volume(): number {
    return this.currentVolume;
  }

  // Setters
  setSoundEnabled(enabled: boolean): void {
    this.isSoundEnabled = enabled;
  }

  setMusicEnabled(enabled: boolean): void {
    this.isMusicEnabled = enabled;
    if (!enabled) {
      this.stopBackgroundMusic();
    }
  }
}

// Export singleton instance
export const audioManager = AudioManager.getInstance();

// Export convenience functions
export const playBackgroundMusic = (url?: string) => audioManager.playBackgroundMusic(url);
export const stopBackgroundMusic = () => audioManager.stopBackgroundMusic();
export const setVolume = (volume: number) => audioManager.setVolume(volume);
export const playButtonSound = () => audioManager.playButtonSound();
export const playSuccessSound = () => audioManager.playSuccessSound();
export const playErrorSound = () => audioManager.playErrorSound();
export const isMusicPlaying = () => audioManager.isMusicPlaying;
export const isSoundOn = () => audioManager.isSoundOn;
export const getVolume = () => audioManager.volume;
export const setSoundEnabled = (enabled: boolean) => audioManager.setSoundEnabled(enabled);
export const setMusicEnabled = (enabled: boolean) => audioManager.setMusicEnabled(enabled);


