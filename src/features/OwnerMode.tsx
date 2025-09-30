// Owner Mode - Upload Posts & Manage Venues

import { useState, useRef } from 'react';
import { Camera, Upload, Image as ImageIcon, Video, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CreatePostResponse } from '@/data/models';
import { MockDataSource } from '@/data/sources/MockDataSource';

const dataSource = new MockDataSource();

export function OwnerMode() {
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [uploadResult, setUploadResult] = useState<CreatePostResponse | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setUploadStatus('idle');
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setUploadStatus('processing');

    try {
      // Simulate face blur processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const result = await dataSource.createOwnerPost({
        venue_id: 'v1', // Mock venue ID
        file: selectedFile
      });
      
      setUploadResult(result);
      setUploadStatus('success');
      
      // Clear selection after successful upload
      setTimeout(() => {
        setSelectedFile(null);
        setPreviewUrl(null);
        setUploadStatus('idle');
      }, 3000);
      
    } catch (error) {
      console.error('Upload failed:', error);
      setUploadStatus('error');
    } finally {
      setUploading(false);
    }
  };

  const clearSelection = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setUploadStatus('idle');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-50 backdrop-blur-md bg-background/80 border-b border-card-border/50">
        <div className="px-4 py-4">
          <h1 className="text-xl font-bold">Owner Mode</h1>
          <p className="text-sm text-muted-foreground">Upload live venue content</p>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-6 space-y-6">
        {/* Venue Status */}
        <div className="glass-card rounded-3xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Your Venue</h2>
            <div className="flex items-center gap-2 text-success text-sm">
              <CheckCircle className="w-4 h-4" />
              <span>Verified</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-neon flex items-center justify-center">
              <span className="text-white font-bold">S</span>
            </div>
            <div>
              <h3 className="font-medium">Skybar Lounge</h3>
              <p className="text-sm text-muted-foreground">BKC, Mumbai</p>
            </div>
          </div>

          {/* Mock controls */}
          <div className="grid grid-cols-2 gap-3">
            <button className="p-3 glass-light rounded-2xl text-sm font-medium transition-smooth hover:bg-primary/10">
              View Analytics
            </button>
            <button className="p-3 glass-light rounded-2xl text-sm font-medium transition-smooth hover:bg-primary/10">
              Pulse Crowd
            </button>
          </div>
        </div>

        {/* Upload Section */}
        <div className="glass-card rounded-3xl p-6">
          <h2 className="font-semibold mb-4">Upload Live Content</h2>
          
          {!selectedFile ? (
            // File selection
            <div className="space-y-4">
              <input
                type="file"
                accept="image/*,video/*"
                onChange={handleFileSelect}
                className="hidden"
                ref={fileInputRef}
              />
              
              <div
                onClick={() => fileInputRef.current?.click()}
                className="relative border-2 border-dashed border-card-border/50 rounded-3xl p-8 text-center cursor-pointer transition-smooth hover:border-primary/50 hover:bg-primary/5"
              >
                <div className="flex flex-col items-center gap-4">
                  <div className="p-4 rounded-full bg-primary/10">
                    <Upload className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium mb-1">Upload live venue content</h3>
                    <p className="text-sm text-muted-foreground">
                      Photo or video from today's venue atmosphere
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center justify-center gap-2 p-3 glass-light rounded-2xl transition-smooth hover:bg-primary/10"
                >
                  <Camera className="w-5 h-5" />
                  <span>Take Photo</span>
                </button>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center justify-center gap-2 p-3 glass-light rounded-2xl transition-smooth hover:bg-primary/10"
                >
                  <Video className="w-5 h-5" />
                  <span>Record Video</span>
                </button>
              </div>
            </div>
          ) : (
            // Preview and upload
            <div className="space-y-4">
              {/* Preview */}
              <div className="relative rounded-3xl overflow-hidden">
                {selectedFile.type.startsWith('image/') ? (
                  <img
                    src={previewUrl!}
                    alt="Preview"
                    className="w-full aspect-[4/3] object-cover"
                  />
                ) : (
                  <video
                    src={previewUrl!}
                    className="w-full aspect-[4/3] object-cover"
                    controls
                  />
                )}
                
                {/* Status overlay */}
                {uploadStatus === 'processing' && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <div className="text-center text-white">
                      <div className="animate-spin w-8 h-8 border-3 border-white/30 border-t-white rounded-full mx-auto mb-3" />
                      <p className="font-medium">Processing privacy features...</p>
                      <p className="text-sm text-white/80">Blurring faces automatically</p>
                    </div>
                  </div>
                )}
                
                {uploadStatus === 'success' && (
                  <div className="absolute inset-0 bg-success/20 flex items-center justify-center">
                    <div className="text-center text-white">
                      <CheckCircle className="w-12 h-12 mx-auto mb-3" />
                      <p className="font-medium">Upload successful!</p>
                      <p className="text-sm">Content is now live</p>
                    </div>
                  </div>
                )}
                
                {uploadStatus === 'error' && (
                  <div className="absolute inset-0 bg-destructive/20 flex items-center justify-center">
                    <div className="text-center text-white">
                      <AlertCircle className="w-12 h-12 mx-auto mb-3" />
                      <p className="font-medium">Upload failed</p>
                      <p className="text-sm">Please try again</p>
                    </div>
                  </div>
                )}
              </div>
              
              {/* File info */}
              <div className="flex items-center gap-3 p-3 glass-light rounded-2xl">
                {selectedFile.type.startsWith('image/') ? (
                  <ImageIcon className="w-5 h-5 text-primary" />
                ) : (
                  <Video className="w-5 h-5 text-primary" />
                )}
                <div className="flex-1">
                  <p className="font-medium text-sm">{selectedFile.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(selectedFile.size / 1024 / 1024).toFixed(1)} MB
                  </p>
                </div>
              </div>
              
              {/* Actions */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={clearSelection}
                  disabled={uploading}
                  className="p-3 glass-light rounded-2xl font-medium transition-smooth hover:bg-primary/10 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpload}
                  disabled={uploading || uploadStatus === 'success'}
                  className={cn(
                    'p-3 rounded-2xl font-medium transition-smooth',
                    uploadStatus === 'success'
                      ? 'bg-success text-success-foreground'
                      : 'bg-primary text-primary-foreground glow-primary hover:scale-105',
                    uploading && 'opacity-50'
                  )}
                >
                  {uploadStatus === 'processing' ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Processing
                    </div>
                  ) : uploadStatus === 'success' ? (
                    'Uploaded!'
                  ) : (
                    'Upload Content'
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Recent Uploads */}
        <div className="glass-card rounded-3xl p-6">
          <h2 className="font-semibold mb-4">Recent Uploads</h2>
          
          <div className="space-y-3">
            {Array.from({ length: 3 }, (_, i) => (
              <div key={i} className="flex items-center gap-3 p-3 glass-light rounded-2xl">
                <div className="w-12 h-12 rounded-xl bg-muted" />
                <div className="flex-1">
                  <p className="font-medium text-sm">Today {9 + i}:30 PM</p>
                  <p className="text-xs text-muted-foreground">Live crowd photo</p>
                </div>
                <div className="flex items-center gap-2 text-success text-xs">
                  <CheckCircle className="w-3 h-3" />
                  <span>Approved</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Privacy Notice */}
        <div className="glass-card rounded-3xl p-6">
          <h2 className="font-semibold mb-2">Privacy & Guidelines</h2>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>• All faces are automatically blurred for privacy</p>
            <p>• Content expires at midnight venue time</p>
            <p>• Only approved verified owners can upload</p>
            <p>• Content may be moderated before going live</p>
          </div>
        </div>
      </div>
    </div>
  );
}