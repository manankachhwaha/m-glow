// Crowd Level Badge Component

import { cn } from '@/lib/utils';
import type { CrowdLevel } from '@/data/models';
import { getCrowdBadgeColor, getCrowdBadgeText } from '@/utils/crowd';

interface BadgeProps {
  level: CrowdLevel;
  showText?: boolean;
  isLive?: boolean;
  className?: string;
}

export function CrowdBadge({ level, showText = true, isLive = false, className }: BadgeProps) {
  // Nightclub-themed color mapping
  const getBadgeColors = (level: CrowdLevel) => {
    switch (level) {
      case 'quiet':
        return {
          bg: 'rgba(99, 102, 241, 0.2)',
          text: 'rgba(147, 197, 253, 0.9)',
          border: 'rgba(99, 102, 241, 0.4)',
          dot: 'rgba(147, 197, 253, 0.9)',
          glow: 'rgba(99, 102, 241, 0.3)'
        };
      case 'moderate':
        return {
          bg: 'rgba(168, 85, 247, 0.2)',
          text: 'rgba(196, 181, 253, 0.9)',
          border: 'rgba(168, 85, 247, 0.4)',
          dot: 'rgba(196, 181, 253, 0.9)',
          glow: 'rgba(168, 85, 247, 0.3)'
        };
      case 'busy':
        return {
          bg: 'rgba(139, 69, 19, 0.2)',
          text: 'rgba(251, 146, 60, 0.9)',
          border: 'rgba(251, 146, 60, 0.4)',
          dot: 'rgba(251, 146, 60, 0.9)',
          glow: 'rgba(251, 146, 60, 0.3)'
        };
      default:
        return {
          bg: 'rgba(156, 163, 175, 0.2)',
          text: 'rgba(156, 163, 175, 0.9)',
          border: 'rgba(156, 163, 175, 0.4)',
          dot: 'rgba(156, 163, 175, 0.9)',
          glow: 'rgba(156, 163, 175, 0.3)'
        };
    }
  };

  const colors = getBadgeColors(level);
  
  // Get text for the badge
  const getBadgeText = (level: CrowdLevel) => {
    switch (level) {
      case 'quiet': return 'Chill';
      case 'moderate': return 'Vibing';
      case 'busy': return 'Packed';
      default: return 'Closed';
    }
  };
  
  const text = getBadgeText(level);

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-medium transition-all duration-300',
        isLive && level !== 'none' && 'animate-pulse',
        className
      )}
      style={{
        background: `linear-gradient(135deg, ${colors.bg} 0%, ${colors.bg.replace('0.2', '0.1')} 100%)`,
        border: `1px solid ${colors.border}`,
        backdropFilter: 'blur(15px) saturate(180%)',
        boxShadow: isLive && level !== 'none' 
          ? `0 2px 8px ${colors.glow}`
          : `0 2px 8px rgba(0,0,0,0.2)`,
        color: colors.text,
        textShadow: '0 1px 2px rgba(0,0,0,0.6)'
      }}
    >
      <div 
        className="w-2 h-2 rounded-full"
        style={{
          backgroundColor: colors.dot,
          boxShadow: isLive && level !== 'none' ? `0 0 4px ${colors.glow}` : 'none'
        }}
      />
      {showText && (
        <span 
          className="font-semibold"
          style={{
            color: colors.text,
            textShadow: '0 1px 2px rgba(0,0,0,0.6)'
          }}
        >
          {text}
        </span>
      )}
    </div>
  );
}

interface PriceBadgeProps {
  level: 1 | 2 | 3;
  className?: string;
}

export function PriceBadge({ level, className }: PriceBadgeProps) {
  const symbols = '₹'.repeat(level);
  const graySymbols = '₹'.repeat(3 - level);

  return (
    <div 
      className={cn(
        'inline-flex items-center gap-0.5 px-2 py-1 rounded-lg transition-all duration-300',
        className
      )}
      style={{
        background: 'linear-gradient(135deg, rgba(0,0,0,0.3) 0%, rgba(20,20,20,0.2) 100%)',
        backdropFilter: 'blur(10px) saturate(180%)',
        border: '1px solid rgba(255,255,255,0.1)',
        boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
      }}
    >
      <span 
        className="text-xs font-semibold"
        style={{
          color: 'rgba(34, 197, 94, 0.9)',
          textShadow: '0 1px 2px rgba(0,0,0,0.6)'
        }}
      >
        {symbols}
      </span>
      <span 
        className="text-xs"
        style={{
          color: 'rgba(156, 163, 175, 0.5)',
          textShadow: '0 1px 2px rgba(0,0,0,0.6)'
        }}
      >
        {graySymbols}
      </span>
    </div>
  );
}

interface EleganceBadgeProps {
  score: number; // 0.0 to 1.0
  className?: string;
}

export function EleganceBadge({ score, className }: EleganceBadgeProps) {
  const stars = Math.round(score * 5);
  
  return (
    <div 
      className={cn(
        'inline-flex items-center gap-0.5 px-2 py-1 rounded-lg transition-all duration-300',
        className
      )}
      style={{
        background: 'linear-gradient(135deg, rgba(0,0,0,0.3) 0%, rgba(20,20,20,0.2) 100%)',
        backdropFilter: 'blur(10px) saturate(180%)',
        border: '1px solid rgba(255,255,255,0.1)',
        boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
      }}
    >
      {Array.from({ length: 5 }, (_, i) => (
        <span
          key={i}
          className="text-xs transition-all duration-300"
          style={{
            color: i < stars ? 'rgba(251, 191, 36, 0.9)' : 'rgba(156, 163, 175, 0.5)',
            textShadow: '0 1px 2px rgba(0,0,0,0.6)'
          }}
        >
          ★
        </span>
      ))}
    </div>
  );
}