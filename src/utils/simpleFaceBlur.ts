import * as faceapi from 'face-api.js';

const MODEL_URL = 'https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/weights';
let modelsLoaded = false;

async function loadModels() {
  if (modelsLoaded) return;
  await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
  modelsLoaded = true;
}

/** Gaussian-style blur on a canvas region via temp canvas + CSS filter. */
function blurRegion(
  ctx: CanvasRenderingContext2D,
  src: HTMLImageElement,
  x: number, y: number, w: number, h: number
) {
  const blurPx = Math.max(16, Math.round(Math.min(w, h) / 4));

  // Draw just this face region into a small temp canvas with blur applied
  const tmp = document.createElement('canvas');
  // Add extra padding so blur doesn't clip at edges
  const pad = blurPx * 2;
  tmp.width = w + pad * 2;
  tmp.height = h + pad * 2;
  const tc = tmp.getContext('2d')!;
  tc.filter = `blur(${blurPx}px)`;
  tc.drawImage(src, x - pad, y - pad, w + pad * 2, h + pad * 2, 0, 0, tmp.width, tmp.height);
  tc.filter = 'none';

  // Clip to the face box when compositing back — avoids bleed
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();
  ctx.drawImage(tmp, 0, 0, tmp.width, tmp.height, x - pad, y - pad, tmp.width, tmp.height);
  ctx.restore();
}

async function detectFaces(img: HTMLImageElement): Promise<faceapi.FaceDetection[]> {
  const passes = [
    new faceapi.TinyFaceDetectorOptions({ inputSize: 416, scoreThreshold: 0.2 }),
    new faceapi.TinyFaceDetectorOptions({ inputSize: 608, scoreThreshold: 0.15 }),
    new faceapi.TinyFaceDetectorOptions({ inputSize: 320, scoreThreshold: 0.1 }),
  ];
  for (const cfg of passes) {
    const results = await faceapi.detectAllFaces(img, cfg);
    if (results.length > 0) return results;
  }
  return [];
}

export type BlurResult = {
  blurredDataUrl: string;
  facesDetected: number;
  processingTime: number;
  warning?: string;
};

export async function simpleBlurFaces(imageFile: File): Promise<BlurResult> {
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
  let warning: string | undefined;

  try {
    await loadModels();
    const detections = await detectFaces(img);
    facesDetected = detections.length;

    if (facesDetected === 0) {
      warning = 'No faces detected — photo uploaded as-is.';
    }

    for (const det of detections) {
      const { x, y, width, height } = det.box;
      const pad = 0.25;
      const bx = Math.max(0, Math.floor(x - width * pad));
      const by = Math.max(0, Math.floor(y - height * pad));
      const bw = Math.min(canvas.width - bx, Math.ceil(width * (1 + 2 * pad)));
      const bh = Math.min(canvas.height - by, Math.ceil(height * (1 + 2 * pad)));
      blurRegion(ctx, img, bx, by, bw, bh);
    }
  } catch {
    // Model unavailable — return original, user sees unblurred photo
    warning = 'Face detection unavailable. Photo uploaded without blur.';
    facesDetected = 0;
  }

  URL.revokeObjectURL(objectUrl);

  return {
    blurredDataUrl: canvas.toDataURL('image/jpeg', 0.92),
    facesDetected,
    processingTime: Date.now() - startTime,
    warning,
  };
}
