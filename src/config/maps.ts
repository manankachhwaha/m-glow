// Google Maps Configuration

export const MAPS_CONFIG = {
  // Google Maps API Key - Replace with your actual API key
  // Get it from: https://console.cloud.google.com/
  // PASTE YOUR API KEY BETWEEN THE QUOTES BELOW:
  API_KEY: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'YOUR_API_KEY_HERE',
  
  // Default location (Mumbai, India)
  DEFAULT_CENTER: {
    lat: 19.0760,
    lng: 72.8777
  },
  
  // Map styling for cyberpunk theme
  DARK_STYLE: [
    {
      featureType: 'all',
      elementType: 'geometry',
      stylers: [{ color: '#1a1a1a' }]
    },
    {
      featureType: 'all',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#00ff88' }]
    },
    {
      featureType: 'all',
      elementType: 'labels.text.stroke',
      stylers: [{ color: '#000000' }]
    },
    {
      featureType: 'poi',
      elementType: 'geometry',
      stylers: [{ color: '#2d2d2d' }]
    },
    {
      featureType: 'poi',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#00ff88' }]
    },
    {
      featureType: 'road',
      elementType: 'geometry',
      stylers: [{ color: '#2d2d2d' }]
    },
    {
      featureType: 'road',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#00ff88' }]
    },
    {
      featureType: 'water',
      elementType: 'geometry',
      stylers: [{ color: '#0a0a0a' }]
    }
  ],
  
  // Search configuration
  SEARCH_RADIUS: 50000, // 50km
  
  // Place types to search for
  VENUE_TYPES: [
    'restaurant',
    'bar',
    'night_club',
    'cafe',
    'meal_takeaway',
    'food',
    'establishment'
  ]
};

// Check if Google Maps API key is configured
export const isGoogleMapsConfigured = () => {
  return MAPS_CONFIG.API_KEY && 
         MAPS_CONFIG.API_KEY !== 'YOUR_API_KEY_HERE' && 
         MAPS_CONFIG.API_KEY !== 'demo_key_replace_with_actual' &&
         MAPS_CONFIG.API_KEY.length > 10;
};

// Get Google Maps script URL
export const getGoogleMapsScriptUrl = () => {
  return `https://maps.googleapis.com/maps/api/js?key=${MAPS_CONFIG.API_KEY}&libraries=places`;
};
