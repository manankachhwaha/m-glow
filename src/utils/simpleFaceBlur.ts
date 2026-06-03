/**
 * Face detection + blur pipeline.
 *
 * Strategy (in order):
 *  1. Native browser FaceDetector API (Chrome / Edge / Samsung Internet)
 *     — zero network, instant, handles close-up / selfie faces perfectly
 *  2. face-api.js TinyFaceDetector (CDN fallback for Firefox / Safari)
 *  3. If both return 0 detections → blur a centre oval that covers where
 *     a selfie face sits, so there is always _some_ privacy protection
 */

import * as faceapi from 'face-api.js';

const MODEL_URL = 'https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/weights';
let modelsLoaded = false;

// ─── detection helpers ────────────────────────────────────────────────────────

interface FaceBox { x: number; y: number; width: number; height: number }

async function detectNative(img: HTMLImageElement): Promise<FaceBox[]> {
  // Chrome 70+, Edge 79+, Samsung Internet 12+
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (typeof window === 'undefined' || !('FaceDetector' in window)) return [];
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const fd = new (window as any).FaceDetector({ maxDetectedFaces: 20, fastMode: false });
    const results: Array<{ boundingBox: DOMRect }> = await fd.detect(img);
    return results.map(r => ({
      x: r.boundingBox.x,
      y: r.boundingBox.y,
      width: r.boundingBox.width,
      height: r.boundingBox.height,
    }));
  } catch {
    return [];
  }
}

async function detectFaceApi(img: HTMLImageElement): Promise<FaceBox[]> {
  try {
    if (!modelsLoaded) {
      await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
      modelsLoaded = true;
    }
    const passes = [
      new faceapi.TinyFaceDetectorOptions({ inputSize: 416, scoreThreshold: 0.2 }),
      new faceapi.TinyFaceDetectorOptions({ inputSize: 608, scoreThreshold: 0.15 }),
      new faceapi.TinyFaceDetectorOptions({ inputSize: 320, scoreThreshold: 0.1 }),
    ];
    for (const cfg of passes) {
      const r = await faceapi.detectAllFaces(img, cfg);
      if (r.length > 0) return r.map(d => ({ x: d.box.x, y: d.box.y, width: d.box.width, height: d.box.height }));
    }
    return [];
  } catch {
    return [];
  }
}

async function detectFaces(img: HTMLImageElement): Promise<FaceBox[]> {
  const native = await detectNative(img);
  if (native.length > 0) return native;
  return detectFaceApi(img);
}

// ─── blur helper ──────────────────────────────────────────────────────────────

/**
 * Gaussian-style blur on a canvas region.
 * Draws the source region into a padded temp canvas with CSS blur filter
 * applied, then composites back with a clipping rect to avoid hard edges.
 */
function blurRegion(
  ctx: CanvasRenderingContext2D,
  src: HTMLImageElement,
  x: number, y: number, w: number, h: number,
) {
  const blurPx = Math.max(18, Math.round(Math.min(w, h) / 3.5));
  const pad = blurPx * 2;

  const tmp = document.createElement('canvas');
  tmp.width  = w + pad * 2;
  tmp.height = h + pad * 2;
  const tc = tmp.getContext('2d')!;

  // Draw source region (with padding) into temp canvas with blur
  tc.filter = `blur(${blurPx}px)`;
  tc.drawImage(src, x - pad, y - pad, w + pad * 2, h + pad * 2, 0, 0, tmp.width, tmp.height);
  tc.filter = 'none';

  // Paste blurred result back — clipped to face box so blur doesn't spill
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();
  ctx.drawImage(tmp, 0, 0, tmp.width, tmp.height, x - pad, y - pad, tmp.width, tmp.height);
  ctx.restore();
}

/** Safety net: blur the centre oval where a selfie face typically sits. */
function blurCentreOval(ctx: CanvasRenderingContext2D, src: HTMLImageElement) {
  const cw = src.width;
  const ch = src.height;
  // Oval covering central 60% width × 70% height, shifted slightly up
  const bw = cw * 0.6;
  const bh = ch * 0.7;
  const bx = (cw - bw) / 2;
  const by = (ch - bh) * 0.35;
  blurRegion(ctx, src, Math.round(bx), Math.round(by), Math.round(bw), Math.round(bh));
}

// ─── public API ──────────────────────────────────────────────────────────────

export type BlurResult = {
  blurredDataUrl: string;
  facesDetected: number;
  processingTime: number;
  warning?: string;
};

export async function simpleBlurFaces(imageFile: File): Promise<BlurResult> {
  const t0 = Date.now();

  const img = new Image();
  const objectUrl = URL.createObjectURL(imageFile);
  img.src = objectUrl;
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error('Image load failed'));
  });

  const canvas = document.createElement('canvas');
  canvas.width  = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(img, 0, 0);

  let facesDetected = 0;
  let warning: string | undefined;

  const detections = await detectFaces(img);
  facesDetected = detections.length;

  if (facesDetected > 0) {
    for (const { x, y, width, height } of detections) {
      const pad = 0.25;
      const bx = Math.max(0, Math.floor(x - width * pad));
      const by = Math.max(0, Math.floor(y - height * pad));
      const bw = Math.min(canvas.width  - bx, Math.ceil(width  * (1 + 2 * pad)));
      const bh = Math.min(canvas.height - by, Math.ceil(height * (1 + 2 * pad)));
      blurRegion(ctx, img, bx, by, bw, bh);
    }
  } else {
    // No faces found by either detector — blur the centre region as a safety net
    blurCentreOval(ctx, img);
    warning = 'No faces detected — centre region blurred as a precaution.';
  }

  URL.revokeObjectURL(objectUrl);

  return {
    blurredDataUrl: canvas.toDataURL('image/jpeg', 0.92),
    facesDetected,
    processingTime: Date.now() - t0,
    warning,
  };
}
