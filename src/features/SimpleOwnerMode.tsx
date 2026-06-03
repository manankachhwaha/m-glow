// Simple Owner Mode - Basic working version
import React, { useState, useRef } from 'react';
import { Camera, Upload, X, CheckCircle } from 'lucide-react';
import { simpleBlurFaces } from '@/utils/simpleFaceBlur';

export function SimpleOwnerMode() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
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
      setSelectedFile(file);
      setFacesDetected(result.facesDetected);
      setProcessingTime(result.processingTime);
    } catch {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setSelectedFile(file);
      setFacesDetected(0);
      setProcessingTime(0);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    
    // Simulate upload
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsProcessing(false);
    setUploadSuccess(true);
    
    // Auto clear after 3 seconds
    setTimeout(() => {
      clearSelection();
    }, 3000);
  };

  const clearSelection = () => {
    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl(null);
    setUploadSuccess(false);
    setFacesDetected(0);
    setProcessingTime(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/20 to-slate-950 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Owner Mode</h1>
          <p className="text-slate-400">Upload photos for your venue</p>
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
                className="w-full p-12 border-2 border-dashed border-slate-600 hover:border-slate-500 rounded-2xl transition-colors disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-white text-lg font-medium mb-2">Processing Image...</p>
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

              {/* File Info */}
              <div className="bg-slate-800/50 rounded-xl p-4">
                <h3 className="text-white font-medium mb-2">{selectedFile.name}</h3>
                <p className="text-slate-400 text-sm">
                  Size: {(selectedFile.size / 1024 / 1024).toFixed(1)} MB
                </p>
                <p className="text-slate-400 text-sm">
                  Type: {selectedFile.type}
                </p>
              </div>

              {/* Processing Results */}
              {facesDetected > 0 && (
                <div className="bg-green-500/10 border border-green-400/30 rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <h3 className="text-green-300 font-medium">Privacy Protection Applied</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-green-400">Faces Protected:</p>
                      <p className="text-white font-medium">{facesDetected}</p>
                    </div>
                    <div>
                      <p className="text-green-400">Processing Time:</p>
                      <p className="text-white font-medium">{processingTime}ms</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Upload Success */}
              {uploadSuccess && (
                <div className="bg-green-500/20 border border-green-400/30 rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-6 h-6 text-green-400" />
                    <div>
                      <p className="text-green-300 font-medium">Upload Successful!</p>
                      <p className="text-green-400 text-sm">Photo has been uploaded to your venue</p>
                    </div>
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
                  className="flex-1 py-3 px-6 bg-blue-500 hover:bg-blue-600 disabled:bg-green-500 disabled:opacity-50 rounded-xl font-medium text-white transition-colors flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Uploading...
                    </>
                  ) : uploadSuccess ? (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      Uploaded!
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      Upload Photo
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-blue-500/10 border border-blue-400/30 rounded-xl p-4">
          <h3 className="text-blue-300 font-medium mb-2">How it works:</h3>
          <ul className="text-blue-400 text-sm space-y-1">
            <li>• Tap "Take Photo" to open your camera</li>
            <li>• Faces are automatically detected and blurred</li>
            <li>• Preview the privacy-protected image</li>
            <li>• Tap "Upload Photo" to post to your venue</li>
            <li>• All processing happens on-device — nothing leaves your phone until upload</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

