import * as faceapi from 'face-api.js';

const MODEL_URL = 'https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/weights';

let modelsLoaded = false;

async function loadModels() {
  if (modelsLoaded) return;
  await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
  modelsLoaded = true;
}

async function detectFaces(img: HTMLImageElement): Promise<faceapi.FaceDetection[]> {
  // Try progressively larger input sizes — bigger sizes catch close-up/selfie faces better
  const configs = [
    new faceapi.TinyFaceDetectorOptions({ inputSize: 416, scoreThreshold: 0.2 }),
    new faceapi.TinyFaceDetectorOptions({ inputSize: 608, scoreThreshold: 0.15 }),
    new faceapi.TinyFaceDetectorOptions({ inputSize: 320, scoreThreshold: 0.1 }),
  ];

  for (const cfg of configs) {
    const results = await faceapi.detectAllFaces(img, cfg);
    if (results.length > 0) return results;
  }
  return [];
}

export async function simpleBlurFaces(imageFile: File): Promise<{
  blurredDataUrl: string;
  facesDetected: number;
  processingTime: number;
}> {
  const startTime = Date.now();

  const img = new Image();
  const objectUrl = URL.createObjectURL(imageFile);
  img.src = objectUrl;
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error('Image failed to load'));
  });

  const canvas = document.createElement('canvas');
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(img, 0, 0);

  let facesDetected = 0;

  try {
    await loadModels();
    const detections = await detectFaces(img);
    facesDetected = detections.length;

    for (const det of detections) {
      const { x, y, width, height } = det.box;
      const pad = 0.25;
      const bx = Math.max(0, Math.floor(x - width * pad));
      const by = Math.max(0, Math.floor(y - height * pad));
      const bw = Math.min(canvas.width - bx, Math.ceil(width * (1 + 2 * pad)));
      const bh = Math.min(canvas.height - by, Math.ceil(height * (1 + 2 * pad)));

      // Crop face region to temp canvas, then paint back blurred
      const faceCanvas = document.createElement('canvas');
      faceCanvas.width = bw;
      faceCanvas.height = bh;
      const faceCtx = faceCanvas.getContext('2d')!;
      faceCtx.drawImage(img, bx, by, bw, bh, 0, 0, bw, bh);

      ctx.save();
      ctx.filter = `blur(${Math.max(14, Math.round(width / 4))}px)`;
      ctx.drawImage(faceCanvas, bx, by, bw, bh);
      ctx.restore();
    }
  } catch {
    // Model failed — blur entire image as safety fallback
    ctx.filter = 'blur(20px)';
    ctx.drawImage(img, 0, 0);
    ctx.filter = 'none';
    facesDetected = 0;
  }

  URL.revokeObjectURL(objectUrl);

  return {
    blurredDataUrl: canvas.toDataURL('image/jpeg', 0.92),
    facesDetected,
    processingTime: Date.now() - startTime,
  };
}
