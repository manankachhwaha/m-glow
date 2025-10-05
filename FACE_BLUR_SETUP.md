# Face Blur Setup Guide

## 🎭 Face Detection & Blurring System

This system uses external APIs to detect and blur faces in images. Here's how to set it up:

## 🔑 Getting API Keys

### Option 1: Face Pixelizer API (Recommended)
1. Go to [APILayer Face Pixelizer](https://apilayer.com/marketplace/face_pixelizer-api)
2. Sign up for a free account
3. Get your API key from the dashboard
4. **Free tier**: 100 requests/month

### Option 2: Watermarkly API
1. Go to [Watermarkly](https://watermarkly.com/)
2. Sign up for "Try For Free"
3. Get your API key
4. Good for faces and license plates

### Option 3: Celantur API
1. Go to [Celantur](https://celantur.com/)
2. Sign up (no credit card required)
3. Get your API key
4. Detects faces, license plates, persons, vehicles

## ⚙️ Configuration

### Method 1: Environment Variables (Recommended)
Create a `.env` file in your project root:

```bash
# Face Pixelizer API
REACT_APP_FACE_PIXELIZER_API_KEY=your_api_key_here

# Alternative APIs (optional)
REACT_APP_WATERMARKLY_API_KEY=your_watermarkly_key
REACT_APP_CELANTUR_API_KEY=your_celantur_key
```

### Method 2: Direct Configuration
Edit `src/config/api.ts` and replace `YOUR_API_KEY_HERE` with your actual API key.

## 🚀 How It Works

1. **API Detection**: Uses external API to detect faces
2. **Automatic Blurring**: API returns image with faces blurred
3. **Fallback System**: If API fails, applies general blur to entire image
4. **Manual Brush**: Owners can manually paint blur effects
5. **Preview System**: See exactly what will be uploaded

## 🧪 Testing

1. **Get API Key**: Sign up for Face Pixelizer API
2. **Add to Config**: Put API key in `.env` file or `api.ts`
3. **Test Upload**: Take a photo with faces and upload
4. **Check Console**: Should see "✅ Face blurring completed via API"
5. **Verify Result**: Faces should be blurred in the preview

## 🔧 Troubleshooting

### API Not Working?
- Check API key is correct
- Verify you have remaining requests in your quota
- Check browser console for error messages
- System will fallback to general blur if API fails

### No Faces Detected?
- API might not detect faces in the image
- Try different images with clear faces
- Use manual brush tool as backup

### Brush Tool Not Working?
- Make sure you're in "Brush Tool" mode
- Check that canvas is properly initialized
- Try adjusting brush size and intensity

## 📱 Features

- **AI Face Detection**: Automatic face detection via API
- **Manual Brush**: Paint blur effects anywhere
- **Real-time Preview**: See effects immediately
- **Mobile Support**: Touch events for mobile devices
- **Fallback System**: Always works, even if API fails

## 💡 Tips

- Start with Face Pixelizer API (100 free requests/month)
- Test with clear face photos first
- Use manual brush for fine-tuning
- Check console logs for debugging info

