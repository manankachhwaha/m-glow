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
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-smooth',
        `bg-${colorClass}/20 text-${colorClass} border border-${colorClass}/40`,
        isLive && level !== 'none' && 'pulse-neon',
        className
      )}
    >
      <div className={cn('w-2 h-2 rounded-full', `bg-${colorClass}`)} />
      {showText && <span>{text}</span>}
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
    <div className={cn('inline-flex items-center text-sm font-medium', className)}>
      <span className="text-primary">{symbols}</span>
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
    <div className={cn('inline-flex items-center gap-0.5', className)}>
      {Array.from({ length: 5 }, (_, i) => (
        <span
          key={i}
          className={cn(
            'text-sm',
            i < stars ? 'text-neon-lime' : 'text-muted-foreground'
          )}
        >
          ★
        </span>
      ))}
    </div>
  );
}