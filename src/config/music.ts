// Backend Music Configuration
// IMPORTANT: Google Drive doesn't work due to CORS restrictions
// Use one of these alternatives instead:

export const MUSIC_CONFIG = {
  // Option 1: Use a CORS-friendly music hosting service
  // - SoundCloud (get direct link)
  // - Dropbox (with ?dl=1 parameter)
  // - GitHub (raw file link)
  // - Your own server/CDN
  
  // Your Google Drive music file through our CORS proxy
  BACKEND_MUSIC_URL: '/api/music-proxy', // Your Google Drive music via our proxy
  
  // Music settings
  VOLUME: 0.3,
  LOOP: true,
  AUTOPLAY: true, // Auto-play when user reaches auth screen
  
  // Alternative: If you want to fetch music URL from backend API
  // FETCH_FROM_API: true,
  // API_ENDPOINT: 'https://your-backend.com/api/music/current'
};

// Function to get music URL (can be extended to fetch from API)
export const getMusicUrl = async (): Promise<string> => {
  // For now, return the static URL
  // Later, you can implement API call here:
  // const response = await fetch(MUSIC_CONFIG.API_ENDPOINT);
  // const data = await response.json();
  // return data.musicUrl;
  
  return MUSIC_CONFIG.BACKEND_MUSIC_URL;
};
