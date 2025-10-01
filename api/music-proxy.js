// Vercel serverless function to proxy Google Drive music with CORS headers
export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  
  try {
    // Your Google Drive file ID
    const fileId = '1MvnhuT-y9Q1neoJDaqePZKvuhdrLGqrM';
    const googleDriveUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;
    
    console.log('🎵 Proxying Google Drive music:', googleDriveUrl);
    
    // Fetch the file from Google Drive
    const response = await fetch(googleDriveUrl);
    
    if (!response.ok) {
      throw new Error(`Google Drive request failed: ${response.status}`);
    }
    
    // Set appropriate headers for audio
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    
    // Stream the audio data
    const buffer = await response.arrayBuffer();
    res.status(200).send(Buffer.from(buffer));
    
  } catch (error) {
    console.error('❌ Music proxy error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch music',
      details: error.message 
    });
  }
}
