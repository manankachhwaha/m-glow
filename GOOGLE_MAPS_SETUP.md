# Google Maps Integration Setup

## 1. Get Google Maps API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the following APIs:
   - Maps JavaScript API
   - Places API
   - Geocoding API
4. Create credentials (API Key)
5. Restrict the API key to your domain for security

## 2. Environment Setup

Create a `.env` file in your project root:

```env
VITE_GOOGLE_MAPS_API_KEY=your_actual_api_key_here
```

## 3. Features Included

- **Place Search**: Search for restaurants, bars, clubs, etc.
- **Interactive Map**: Click and explore locations
- **Place Details**: Ratings, prices, opening hours
- **Venue Integration**: Add places directly to your app
- **Cyberpunk Styling**: Dark theme with neon accents

## 4. Usage

The Google Maps integration is automatically available in the venue management section. Users can:

- Search for places by name or type
- View place details and ratings
- Add venues to their app
- See places on an interactive map

## 5. Security Notes

- Always restrict your API key to specific domains
- Monitor API usage in Google Cloud Console
- Consider implementing rate limiting for production use


