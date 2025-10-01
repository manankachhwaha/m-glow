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
  const colorClass = getCrowdBadgeColor(level);
  const text = getCrowdBadgeText(level);

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all duration-300 hover:scale-105',
        `bg-${colorClass}/20 text-${colorClass} border border-${colorClass}/40`,
        isLive && level !== 'none' && 'pulse-neon glow-cyber',
        level !== 'none' && 'shadow-glow-primary',
        className
      )}
    >
      <div className={cn(
        'w-2 h-2 rounded-full transition-all duration-300',
        `bg-${colorClass}`,
        isLive && level !== 'none' && 'glow-cyber'
      )} />
      {showText && <span className={cn(
        'transition-all duration-300',
        isLive && level !== 'none' && 'text-shadow-glow-primary'
      )}>{text}</span>}
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
    <div className={cn('inline-flex items-center text-sm font-medium transition-all duration-300 hover:scale-105 badge-bg-solid px-2 py-1 rounded-lg', className)}>
      <span className="text-neon-lime">{symbols}</span>
      <span className="text-muted-foreground">{graySymbols}</span>
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
    <div className={cn('inline-flex items-center gap-0.5 transition-all duration-300 hover:scale-105 badge-bg-solid px-2 py-1 rounded-lg', className)}>
      {Array.from({ length: 5 }, (_, i) => (
        <span
          key={i}
          className={cn(
            'text-sm transition-all duration-300',
            i < stars ? 'text-neon-lime' : 'text-muted-foreground'
          )}
        >
          ★
        </span>
      ))}
    </div>
  );
}