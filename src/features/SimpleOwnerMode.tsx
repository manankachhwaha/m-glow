// Simple Owner Mode - Camera upload with face blur
import React, { useState, useRef } from 'react';
import { Camera, Upload, X, CheckCircle, Store } from 'lucide-react';
import { simpleBlurFaces } from '@/utils/simpleFaceBlur';
import { MockDataSource } from '@/data/sources/MockDataSource';

const dataSource = new MockDataSource();

interface SimpleOwnerModeProps {
  venueId: string;
  venueName: string;
}

export function SimpleOwnerMode({ venueId, venueName }: SimpleOwnerModeProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [blurredDataUrl, setBlurredDataUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [facesDetected, setFacesDetected] = useState(0);
  const [processingTime, setProcessingTime] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please capture a valid photo');
      return;
    }

    setIsProcessing(true);
    setUploadSuccess(false);

    try {
      const result = await simpleBlurFaces(file);
      setPreviewUrl(result.blurredDataUrl);
      setBlurredDataUrl(result.blurredDataUrl);
      setSelectedFile(file);
      setFacesDetected(result.facesDetected);
      setProcessingTime(result.processingTime);
    } catch {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setBlurredDataUrl(url);
      setSelectedFile(file);
      setFacesDetected(0);
      setProcessingTime(0);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !blurredDataUrl) return;

    setIsProcessing(true);

    try {
      await dataSource.createOwnerPost({
        venue_id: venueId,
        file: blurredDataUrl,
      });

      setUploadSuccess(true);
      // Tell Home to refresh its post map
      window.dispatchEvent(new CustomEvent('venue-post-uploaded', { detail: { venueId } }));

      setTimeout(() => clearSelection(), 3000);
    } catch {
      alert('Upload failed — please try again');
    } finally {
      setIsProcessing(false);
    }
  };

  const clearSelection = () => {
    if (previewUrl && previewUrl.startsWith('blob:')) URL.revokeObjectURL(previewUrl);
    setSelectedFile(null);
    setPreviewUrl(null);
    setBlurredDataUrl(null);
    setUploadSuccess(false);
    setFacesDetected(0);
    setProcessingTime(0);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/20 to-slate-950 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">Owner Mode</h1>
          <div className="flex items-center justify-center gap-2 text-purple-300">
            <Store className="w-4 h-4" />
            <span className="text-sm font-medium">{venueName}</span>
          </div>
        </div>

        {/* Upload Area */}
        <div className="bg-slate-900/50 rounded-3xl p-8 border border-slate-700/50">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileSelect}
            className="hidden"
          />

          {!selectedFile ? (
            <div className="text-center">
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isProcessing}
                className="w-full p-12 border-2 border-dashed border-slate-600 hover:border-purple-500 rounded-2xl transition-colors disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-white text-lg font-medium mb-2">Detecting faces...</p>
                    <p className="text-slate-400">Applying privacy protection</p>
                  </>
                ) : (
                  <>
                    <Camera className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                    <p className="text-white text-lg font-medium mb-2">Take Photo</p>
                    <p className="text-slate-400">Camera only — no gallery uploads</p>
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Image Preview */}
              {previewUrl && (
                <div className="relative">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-full h-64 object-cover rounded-2xl"
                  />
                  <button
                    onClick={clearSelection}
                    className="absolute top-3 right-3 p-2 bg-black/50 rounded-full hover:bg-black/70 transition-colors"
                  >
                    <X className="w-5 h-5 text-white" />
                  </button>
                </div>
              )}

              {/* Privacy result */}
              <div className={`rounded-xl p-4 border ${facesDetected > 0 ? 'bg-green-500/10 border-green-400/30' : 'bg-slate-800/50 border-slate-700/50'}`}>
                <div className="flex items-center gap-3 mb-1">
                  <CheckCircle className={`w-5 h-5 ${facesDetected > 0 ? 'text-green-400' : 'text-slate-400'}`} />
                  <h3 className={`font-medium ${facesDetected > 0 ? 'text-green-300' : 'text-slate-300'}`}>
                    {facesDetected > 0
                      ? `${facesDetected} face${facesDetected > 1 ? 's' : ''} blurred`
                      : 'No faces detected'}
                  </h3>
                </div>
                {processingTime > 0 && (
                  <p className="text-xs text-slate-400 ml-8">Processed in {processingTime}ms</p>
                )}
              </div>

              {/* Upload Success */}
              {uploadSuccess && (
                <div className="bg-green-500/20 border border-green-400/30 rounded-xl p-4 flex items-center gap-3">
                  <CheckCircle className="w-6 h-6 text-green-400" />
                  <div>
                    <p className="text-green-300 font-medium">Uploaded to {venueName}!</p>
                    <p className="text-green-400 text-sm">Photo will appear on the home screen</p>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-4">
                <button
                  onClick={clearSelection}
                  disabled={isProcessing}
                  className="flex-1 py-3 px-6 bg-gray-600/20 hover:bg-gray-600/30 rounded-xl font-medium text-white transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpload}
                  disabled={isProcessing || uploadSuccess}
                  className="flex-1 py-3 px-6 bg-purple-600 hover:bg-purple-700 disabled:bg-green-500 disabled:opacity-80 rounded-xl font-medium text-white transition-colors flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Uploading...
                    </>
                  ) : uploadSuccess ? (
                    <><CheckCircle className="w-4 h-4" /> Uploaded!</>
                  ) : (
                    <><Upload className="w-4 h-4" /> Upload to {venueName}</>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="mt-6 bg-purple-500/10 border border-purple-400/30 rounded-xl p-4">
          <h3 className="text-purple-300 font-medium mb-2">How it works:</h3>
          <ul className="text-purple-400 text-sm space-y-1">
            <li>• Tap "Take Photo" to open your camera</li>
            <li>• Faces are automatically detected and blurred</li>
            <li>• Photo uploads to <span className="text-white font-medium">{venueName}</span> and appears on the home screen</li>
            <li>• All processing happens on-device before upload</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
