// REAL Disco Ball with Actual Image and Proper 3D Effects

import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

interface RealDiscoBallProps {
  className?: string;
}

export function RealDiscoBall({ className }: RealDiscoBallProps) {
  const reflectionRef = useRef<HTMLDivElement>(null);
  const [lightAngle, setLightAngle] = useState(0);

  useEffect(() => {
    // Animate light angle for realistic disco ball lighting
    const lightInterval = setInterval(() => {
      setLightAngle(prev => (prev + 2) % 360);
    }, 100);

    return () => clearInterval(lightInterval);
  }, []);

  useEffect(() => {
    // Create realistic light reflections that move across the screen
    const createMovingReflection = () => {
      const reflection = document.createElement('div');
      
      // Random colors for reflections (like real disco ball lights)
      const colors = [
        'rgba(255, 0, 255, 0.6)',   // Pink
        'rgba(0, 255, 255, 0.6)',   // Cyan
        'rgba(255, 255, 0, 0.6)',   // Yellow
        'rgba(255, 0, 0, 0.6)',     // Red
        'rgba(0, 255, 0, 0.6)',     // Green
        'rgba(0, 0, 255, 0.6)'      // Blue
      ];
      
      const color = colors[Math.floor(Math.random() * colors.length)];
      
      // Create moving reflection
      reflection.style.cssText = `
        position: fixed;
        width: ${20 + Math.random() * 40}px;
        height: ${20 + Math.random() * 40}px;
        background: radial-gradient(circle, ${color} 0%, transparent 70%);
        border-radius: 50%;
        pointer-events: none;
        z-index: 5;
        opacity: 0;
        filter: blur(${2 + Math.random() * 3}px);
        box-shadow: 0 0 ${10 + Math.random() * 20}px ${color};
      `;
      
      // Start position (from disco ball area)
      const startX = window.innerWidth - 150 + Math.random() * 50;
      const startY = 50 + Math.random() * 50;
      
      // End position (random across screen)
      const endX = Math.random() * window.innerWidth;
      const endY = Math.random() * window.innerHeight;
      
      reflection.style.left = `${startX}px`;
      reflection.style.top = `${startY}px`;
      
      document.body.appendChild(reflection);
      
      // Animate the reflection moving across screen
      const animation = reflection.animate([
        { 
          opacity: 0, 
          transform: 'scale(0.5)',
          left: `${startX}px`,
          top: `${startY}px`
        },
        { 
          opacity: 0.8, 
          transform: 'scale(1.2)',
          left: `${startX + (endX - startX) * 0.3}px`,
          top: `${startY + (endY - startY) * 0.3}px`
        },
        { 
          opacity: 0.6, 
          transform: 'scale(1)',
          left: `${endX}px`,
          top: `${endY}px`
        },
        { 
          opacity: 0, 
          transform: 'scale(0.8)',
          left: `${endX}px`,
          top: `${endY}px`
        }
      ], {
        duration: 3000 + Math.random() * 2000,
        easing: 'ease-in-out'
      });
      
      animation.onfinish = () => {
        if (document.body.contains(reflection)) {
          document.body.removeChild(reflection);
        }
      };
    };

    // Create reflections every 400-1000ms
    const interval = setInterval(createMovingReflection, 400 + Math.random() * 600);

    return () => {
      clearInterval(interval);
    };
  }, []);

  // Create mirror squares pattern
  const createMirrorSquares = () => {
    const squares = [];
    const rows = 8;
    const cols = 8;
    
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const x = (col / cols) * 100;
        const y = (row / rows) * 100;
        
        // Check if square is within circle
        const centerX = 50;
        const centerY = 50;
        const distance = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));
        
        if (distance < 45) {
          squares.push(
            <div
              key={`${row}-${col}`}
              className="absolute bg-white/90"
              style={{
                left: `${x}%`,
                top: `${y}%`,
                width: `${100 / cols}%`,
                height: `${100 / rows}%`,
                transform: `rotate(${lightAngle + (row + col) * 5}deg)`,
                boxShadow: `0 0 ${2 + Math.random() * 3}px rgba(255, 255, 255, 0.8)`,
                opacity: 0.7 + Math.sin(lightAngle * Math.PI / 180 + row + col) * 0.3,
                animation: `mirrorShine ${2 + Math.random() * 3}s ease-in-out infinite`,
                animationDelay: `${(row + col) * 0.1}s`
              }}
            />
          );
        }
      }
    }
    
    return squares;
  };

  return (
    <div className={cn('fixed top-6 right-6 z-10', className)}>
      {/* Giphy Disco Ball GIF */}
      <div className="relative">
        {/* Disco ball chain */}
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-2 h-10 bg-gradient-to-b from-gray-400 to-gray-600 rounded-full shadow-lg z-20" />
        
        {/* Giphy Disco Ball GIF */}
        <div className="relative w-40 h-40">
          <iframe
            src="https://giphy.com/embed/K20uJQyNnchq0"
            width="160"
            height="160"
            frameBorder="0"
            className="rounded-full shadow-2xl"
            style={{
              filter: 'drop-shadow(0 0 40px rgba(255,255,255,0.6))',
              boxShadow: `
                0 0 60px rgba(255,255,255,0.8),
                0 0 120px rgba(255,255,255,0.4)
              `
            }}
            allowFullScreen
          />
          
          {/* Additional glow effect overlay */}
          <div 
            className="absolute inset-0 rounded-full pointer-events-none"
            style={{
              background: `radial-gradient(circle, transparent 60%, rgba(255,255,255,0.1) 100%)`,
              boxShadow: `inset 0 0 30px rgba(255,255,255,0.2)`
            }}
          />
        </div>
      </div>
      
      {/* Light reflections container */}
      <div ref={reflectionRef} className="fixed inset-0 pointer-events-none z-0" />
    </div>
  );
}
