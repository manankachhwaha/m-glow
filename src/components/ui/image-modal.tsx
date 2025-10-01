// Image Modal Component for Full-Screen Image Preview

import { X, ZoomIn, ZoomOut, RotateCw } from 'lucide-react';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface ImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  alt?: string;
  className?: string;
}

export function ImageModal({ isOpen, onClose, imageUrl, alt = "Image preview", className }: ImageModalProps) {
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setScale(1);
      setRotation(0);
      setPosition({ x: 0, y: 0 });
    }
  }, [isOpen]);

  const handleZoomIn = () => {
    setScale(prev => Math.min(prev * 1.2, 5));
  };

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev / 1.2, 0.1));
  };

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && scale > 1) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      handleZoomIn();
    } else {
      handleZoomOut();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center"
      onClick={onClose}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 p-2 rounded-full glass-light hover:bg-white/20 transition-all duration-300 text-white"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Controls */}
      <div className="absolute top-4 left-4 z-10 flex gap-2">
        <button
          onClick={handleZoomIn}
          className="p-2 rounded-full glass-light hover:bg-white/20 transition-all duration-300 text-white"
        >
          <ZoomIn className="w-5 h-5" />
        </button>
        <button
          onClick={handleZoomOut}
          className="p-2 rounded-full glass-light hover:bg-white/20 transition-all duration-300 text-white"
        >
          <ZoomOut className="w-5 h-5" />
        </button>
        <button
          onClick={handleRotate}
          className="p-2 rounded-full glass-light hover:bg-white/20 transition-all duration-300 text-white"
        >
          <RotateCw className="w-5 h-5" />
        </button>
      </div>

      {/* Image container */}
      <div 
        className="relative max-w-[90vw] max-h-[90vh] overflow-hidden"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={imageUrl}
          alt={alt}
          className={cn(
            "max-w-full max-h-full object-contain transition-all duration-300 cursor-grab",
            isDragging && "cursor-grabbing",
            className
          )}
          style={{
            transform: `scale(${scale}) rotate(${rotation}deg) translate(${position.x}px, ${position.y}px)`,
          }}
        />
      </div>

      {/* Zoom indicator */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 px-3 py-1 rounded-full glass-light text-white text-sm">
        {Math.round(scale * 100)}%
      </div>
    </div>
  );
}


