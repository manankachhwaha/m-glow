// Owner Mode - Upload Posts & Manage Venues

import { useState, useRef, useEffect } from 'react';
import { Camera, Upload, Image as ImageIcon, Video, Clock, CheckCircle, AlertCircle, Eye, EyeOff, Edit3, Trash2, Plus, Paintbrush, Eraser, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CreatePostResponse } from '@/data/models';
import { MockDataSource } from '@/data/sources/MockDataSource';
import { processImageWithBlur, applyBlurPatches, type BlurPatch } from '@/utils/simple-blur';

const dataSource = new MockDataSource();

export function OwnerMode() {
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [uploadResult, setUploadResult] = useState<CreatePostResponse | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [facesDetected, setFacesDetected] = useState<number>(0);
  const [processingTime, setProcessingTime] = useState<number>(0);
  const [blurPatches, setBlurPatches] = useState<BlurPatch[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [editingBlur, setEditingBlur] = useState(false);
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [brushSize, setBrushSize] = useState(50);
  const [blurIntensity, setBlurIntensity] = useState(20);
  const [brushMode, setBrushMode] = useState<'blur' | 'erase'>('blur');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    console.log('📱 File selected:', {
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: file.lastModified
    });

    setUploadStatus('processing');
    setOriginalFile(file);
    
    try {
      console.log('📱 Starting blur processing...');
      // Process image with simple blur
      const result = await processImageWithBlur(file);
      
      console.log('📱 Blur processing result:', {
        processedFileSize: result.processedFile.size,
        facesDetected: result.facesDetected,
        processingTime: result.processingTime
      });
      
      setSelectedFile(result.processedFile);
      setFacesDetected(result.facesDetected);
      setProcessingTime(result.processingTime);
      setBlurPatches(result.blurPatches);
      
      const url = URL.createObjectURL(result.processedFile);
      setPreviewUrl(url);
      setShowPreview(true);
      setUploadStatus('idle');
      
      console.log('📱 Blur processing completed successfully');
    } catch (error) {
      console.error('📱 Blur processing failed:', error);
      console.log('📱 Using original file as fallback');
      // Fallback to original file if processing fails
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setShowPreview(true);
      setUploadStatus('idle');
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setUploadStatus('processing');

    try {
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
        setFacesDetected(0);
        setProcessingTime(0);
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
    setFacesDetected(0);
    setProcessingTime(0);
    setBlurPatches([]);
    setShowPreview(false);
    setEditingBlur(false);
    setOriginalFile(null);
    setUploadStatus('idle');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const toggleBlurPatch = (patchId: string) => {
    setBlurPatches(prev => 
      prev.map(patch => 
        patch.id === patchId 
          ? { ...patch, isActive: !patch.isActive }
          : patch
      )
    );
  };

  const removeBlurPatch = (patchId: string) => {
    setBlurPatches(prev => prev.filter(patch => patch.id !== patchId));
  };

  const addManualBlurPatch = () => {
    const newPatch: BlurPatch = {
      id: `manual-${Date.now()}`,
      x: 100,
      y: 100,
      width: 100,
      height: 100,
      isActive: true
    };
    setBlurPatches(prev => [...prev, newPatch]);
  };

  const updateBlurPatch = (patchId: string, updates: Partial<BlurPatch>) => {
    setBlurPatches(prev => 
      prev.map(patch => 
        patch.id === patchId 
          ? { ...patch, ...updates }
          : patch
      )
    );
  };

  const applyBlurChanges = async () => {
    if (!originalFile) return;
    
    setUploadStatus('processing');
    
    try {
      const result = await applyBlurPatches(originalFile, blurPatches);
      setSelectedFile(result);
      
      const url = URL.createObjectURL(result);
      setPreviewUrl(url);
      setEditingBlur(false);
      setUploadStatus('idle');
    } catch (error) {
      console.error('Failed to apply blur changes:', error);
      setUploadStatus('idle');
    }
  };

  const applyBlurToWholeImage = async () => {
    if (!originalFile) return;
    
    setUploadStatus('processing');
    
    try {
      const result = await processImageWithBlur(originalFile);
      setSelectedFile(result.processedFile);
      
      const url = URL.createObjectURL(result.processedFile);
      setPreviewUrl(url);
      setEditingBlur(false);
      setUploadStatus('idle');
    } catch (error) {
      console.error('Failed to apply blur to whole image:', error);
      setUploadStatus('idle');
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
                accept="image/*"
                capture="environment"
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
                    <h3 className="font-medium mb-1">Capture live venue content</h3>
                    <p className="text-sm text-muted-foreground">
                      Take photo or record video directly from camera for authenticity
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
                  <span>Camera Photo</span>
                </button>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center justify-center gap-2 p-3 glass-light rounded-2xl transition-smooth hover:bg-primary/10"
                >
                  <Video className="w-5 h-5" />
                  <span>Camera Video</span>
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
                           <p className="font-medium">Processing image...</p>
                           <p className="text-sm text-white/80">Applying privacy blur</p>
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
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>{(selectedFile.size / 1024 / 1024).toFixed(1)} MB</span>
                    {facesDetected > 0 && (
                      <span className="text-success">
                        {facesDetected} face{facesDetected > 1 ? 's' : ''} blurred
                      </span>
                    )}
                    {processingTime > 0 && (
                      <span>Processed in {processingTime}ms</span>
                    )}
                  </div>
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

        {/* Preview and Blur Editing Section */}
        {showPreview && selectedFile && (
          <div className="glass-card rounded-3xl p-6">
                   <div className="flex items-center justify-between mb-4">
                     <h2 className="font-semibold">Preview & Edit Blur</h2>
                     <div className="flex items-center gap-2">
                       <button
                         onClick={applyBlurToWholeImage}
                         className="flex items-center gap-2 px-3 py-2 glass-light hover:bg-primary/10 transition-smooth"
                       >
                         <Paintbrush className="w-4 h-4" />
                         <span className="text-sm font-medium">Blur Whole Image</span>
                       </button>
                       <button
                         onClick={() => {
                           console.log('📱 Test blur button clicked');
                           console.log('📱 Current file:', selectedFile);
                           console.log('📱 Current preview URL:', previewUrl);
                         }}
                         className="flex items-center gap-2 px-3 py-2 glass-light hover:bg-primary/10 transition-smooth"
                       >
                         <AlertCircle className="w-4 h-4" />
                         <span className="text-sm font-medium">Test Blur</span>
                       </button>
                       <button
                         onClick={() => setEditingBlur(!editingBlur)}
                         className={cn(
                           'flex items-center gap-2 px-3 py-2 rounded-xl transition-smooth',
                           editingBlur 
                             ? 'bg-primary text-primary-foreground' 
                             : 'glass-light hover:bg-primary/10'
                         )}
                       >
                         <Edit3 className="w-4 h-4" />
                         <span className="text-sm font-medium">
                           {editingBlur ? 'Done Editing' : 'Edit Patches'}
                         </span>
                       </button>
                     </div>
                   </div>

            {/* Image Preview */}
            <div className="relative rounded-2xl overflow-hidden mb-4">
              <img
                src={previewUrl!}
                alt="Preview"
                className="w-full aspect-[4/3] object-cover"
                style={{
                  filter: selectedFile?.name.startsWith('blurred_') ? 'blur(8px)' : 'none'
                }}
              />
              
              {/* Blur Patch Overlays */}
              {editingBlur && (
                <div className="absolute inset-0">
                  {blurPatches.map((patch) => (
                    <div
                      key={patch.id}
                      className={cn(
                        'absolute border-2 border-dashed transition-all duration-200',
                        patch.isActive 
                          ? 'border-primary bg-primary/20' 
                          : 'border-muted-foreground/50 bg-muted-foreground/10'
                      )}
                      style={{
                        left: `${(patch.x / 400) * 100}%`,
                        top: `${(patch.y / 300) * 100}%`,
                        width: `${(patch.width / 400) * 100}%`,
                        height: `${(patch.height / 300) * 100}%`,
                      }}
                    >
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="flex items-center gap-1 bg-background/80 px-2 py-1 rounded text-xs">
                          {patch.isActive ? (
                            <Eye className="w-3 h-3 text-primary" />
                          ) : (
                            <EyeOff className="w-3 h-3 text-muted-foreground" />
                          )}
                          <span className={patch.isActive ? 'text-primary' : 'text-muted-foreground'}>
                            {patch.isActive ? 'Blurred' : 'Hidden'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Simple Manual Controls */}
            {editingBlur && (
              <div className="space-y-4 mb-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">Manual Blur Controls</h3>
                  <button
                    onClick={addManualBlurPatch}
                    className="flex items-center gap-2 px-3 py-2 glass-light rounded-xl hover:bg-primary/10 transition-smooth"
                  >
                    <Plus className="w-4 h-4" />
                    <span className="text-sm">Add Blur Area</span>
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={applyBlurToWholeImage}
                    disabled={uploadStatus === 'processing'}
                    className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:scale-105 transition-smooth disabled:opacity-50"
                  >
                    {uploadStatus === 'processing' ? 'Applying...' : 'Blur Whole Image'}
                  </button>
                  <button
                    onClick={() => setEditingBlur(false)}
                    className="px-6 py-3 rounded-xl glass-light font-semibold hover:bg-primary/10 transition-smooth"
                  >
                    Done
                  </button>
                </div>
              </div>
            )}

            {/* Blur Patches Management */}
            {editingBlur && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">Blur Patches</h3>
                  <button
                    onClick={addManualBlurPatch}
                    className="flex items-center gap-2 px-3 py-2 glass-light rounded-xl hover:bg-primary/10 transition-smooth"
                  >
                    <Plus className="w-4 h-4" />
                    <span className="text-sm">Add Manual Blur</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {blurPatches.map((patch, index) => (
                    <div key={patch.id} className="flex items-center gap-3 p-3 glass-light rounded-xl">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleBlurPatch(patch.id)}
                          className={cn(
                            'w-8 h-8 rounded-lg flex items-center justify-center transition-smooth',
                            patch.isActive 
                              ? 'bg-primary text-primary-foreground' 
                              : 'bg-muted-foreground/20 text-muted-foreground'
                          )}
                        >
                          {patch.isActive ? (
                            <Eye className="w-4 h-4" />
                          ) : (
                            <EyeOff className="w-4 h-4" />
                          )}
                        </button>
                        <span className="text-sm font-medium">
                          Patch {index + 1}
                        </span>
                      </div>

                      <div className="flex-1 grid grid-cols-4 gap-2 text-xs">
                        <div>
                          <label className="text-muted-foreground">X</label>
                          <input
                            type="number"
                            value={Math.round(patch.x)}
                            onChange={(e) => updateBlurPatch(patch.id, { x: parseInt(e.target.value) || 0 })}
                            className="w-full px-2 py-1 rounded glass-light border border-card-border/50 focus:border-primary focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-muted-foreground">Y</label>
                          <input
                            type="number"
                            value={Math.round(patch.y)}
                            onChange={(e) => updateBlurPatch(patch.id, { y: parseInt(e.target.value) || 0 })}
                            className="w-full px-2 py-1 rounded glass-light border border-card-border/50 focus:border-primary focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-muted-foreground">Width</label>
                          <input
                            type="number"
                            value={Math.round(patch.width)}
                            onChange={(e) => updateBlurPatch(patch.id, { width: parseInt(e.target.value) || 0 })}
                            className="w-full px-2 py-1 rounded glass-light border border-card-border/50 focus:border-primary focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-muted-foreground">Height</label>
                          <input
                            type="number"
                            value={Math.round(patch.height)}
                            onChange={(e) => updateBlurPatch(patch.id, { height: parseInt(e.target.value) || 0 })}
                            className="w-full px-2 py-1 rounded glass-light border border-card-border/50 focus:border-primary focus:outline-none"
                          />
                        </div>
                      </div>

                      <button
                        onClick={() => removeBlurPatch(patch.id)}
                        className="w-8 h-8 rounded-lg bg-destructive/20 text-destructive flex items-center justify-center hover:bg-destructive/30 transition-smooth"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={applyBlurChanges}
                    disabled={uploadStatus === 'processing'}
                    className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:scale-105 transition-smooth disabled:opacity-50"
                  >
                    {uploadStatus === 'processing' ? 'Applying...' : 'Apply Changes'}
                  </button>
                  <button
                    onClick={() => setEditingBlur(false)}
                    className="px-6 py-3 rounded-xl glass-light font-semibold hover:bg-primary/10 transition-smooth"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* File Info */}
            <div className="flex items-center gap-3 p-3 glass-light rounded-2xl">
              {selectedFile.type.startsWith('image/') ? (
                <ImageIcon className="w-5 h-5 text-primary" />
              ) : (
                <Video className="w-5 h-5 text-primary" />
              )}
              <div className="flex-1">
                <p className="font-medium text-sm">{selectedFile.name}</p>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>{(selectedFile.size / 1024 / 1024).toFixed(1)} MB</span>
                  {facesDetected > 0 && (
                    <span className="text-success">
                      {facesDetected} face{facesDetected > 1 ? 's' : ''} detected
                    </span>
                  )}
                  {processingTime > 0 && (
                    <span>Processed in {processingTime}ms</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

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
            <p>• <strong>Camera only:</strong> No gallery uploads allowed for authenticity</p>
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