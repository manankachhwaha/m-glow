import * as faceapi from 'face-api.js';

const MODEL_URL = 'https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/weights';
let modelsLoaded = false;

async function loadModels() {
  if (modelsLoaded) return;
  await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
  modelsLoaded = true;
}

// Pixelate a region — scale down to tiny, back up with no smoothing.
// Guaranteed to work in all browsers, no CSS filter dependency.
function pixelateRegion(
  ctx: CanvasRenderingContext2D,
  src: HTMLImageElement | HTMLCanvasElement,
  x: number, y: number, w: number, h: number
) {
  const blockSize = Math.max(10, Math.round(Math.min(w, h) / 6));
  const tw = Math.max(1, Math.ceil(w / blockSize));
  const th = Math.max(1, Math.ceil(h / blockSize));

  const tmp = document.createElement('canvas');
  tmp.width = tw;
  tmp.height = th;
  const tc = tmp.getContext('2d')!;
  tc.imageSmoothingEnabled = false;
  tc.drawImage(src, x, y, w, h, 0, 0, tw, th);

  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(tmp, 0, 0, tw, th, x, y, w, h);
  ctx.imageSmoothingEnabled = true;
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
      warning = 'No faces detected. If there are faces in the photo, try with better lighting or from a greater distance.';
    }

    for (const det of detections) {
      const { x, y, width, height } = det.box;
      const pad = 0.3;
      const bx = Math.max(0, Math.floor(x - width * pad));
      const by = Math.max(0, Math.floor(y - height * pad));
      const bw = Math.min(canvas.width - bx, Math.ceil(width * (1 + 2 * pad)));
      const bh = Math.min(canvas.height - by, Math.ceil(height * (1 + 2 * pad)));
      pixelateRegion(ctx, img, bx, by, bw, bh);
    }
  } catch {
    // Model failed — pixelate the whole image as a safe fallback
    pixelateRegion(ctx, img, 0, 0, canvas.width, canvas.height);
    facesDetected = 0;
    warning = 'Privacy protection applied to full image (face detection unavailable).';
  }

  URL.revokeObjectURL(objectUrl);

  return {
    blurredDataUrl: canvas.toDataURL('image/jpeg', 0.92),
    facesDetected,
    processingTime: Date.now() - startTime,
    warning,
  };
}
