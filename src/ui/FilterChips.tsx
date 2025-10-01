// Filter Chips Component

import { cn } from '@/lib/utils';
import type { CrowdLevel, VenueType, PriceLevel } from '@/data/models';

interface ChipProps {
  children: React.ReactNode;
  isActive?: boolean;
  onClick?: () => void;
  variant?: 'default' | 'crowd' | 'price';
  className?: string;
}

export function Chip({ children, isActive = false, onClick, variant = 'default', className }: ChipProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'px-4 py-2 rounded-full text-sm font-medium transition-smooth border',
        isActive
          ? 'bg-primary text-primary-foreground border-primary glow-primary'
          : 'glass-light border-card-border/50 hover:border-primary/50 hover:bg-primary/10',
        className
      )}
    >
      {children}
    </button>
  );
}

interface CrowdFilterProps {
  selected: CrowdLevel | null;
  onSelect: (level: CrowdLevel | null) => void;
}

export function CrowdFilter({ selected, onSelect }: CrowdFilterProps) {
  const levels: { level: CrowdLevel; label: string }[] = [
    { level: 'quiet', label: 'Quiet' },
    { level: 'moderate', label: 'Moderate' },
    { level: 'busy', label: 'Busy' }
  ];

  return (
    <div className="flex gap-2">
      {levels.map(({ level, label }) => (
        <Chip
          key={level}
          isActive={selected === level}
          onClick={() => onSelect(selected === level ? null : level)}
        >
          {label}
        </Chip>
      ))}
    </div>
  );
}

interface TypeFilterProps {
  selected: VenueType | null;
  onSelect: (type: VenueType | null) => void;
}

export function TypeFilter({ selected, onSelect }: TypeFilterProps) {
  const types: { type: VenueType; label: string }[] = [
    { type: 'club', label: 'Clubs' },
    { type: 'restaurant', label: 'Restaurants' },
    { type: 'event', label: 'Events' }
  ];

  return (
    <div className="flex gap-2">
      {types.map(({ type, label }) => (
        <Chip
          key={type}
          isActive={selected === type}
          onClick={() => onSelect(selected === type ? null : type)}
        >
          {label}
        </Chip>
      ))}
    </div>
  );
}

interface PriceFilterProps {
  selected: PriceLevel | null;
  onSelect: (price: PriceLevel | null) => void;
}

export function PriceFilter({ selected, onSelect }: PriceFilterProps) {
  const prices: { level: PriceLevel; label: string }[] = [
    { level: 1, label: '₹' },
    { level: 2, label: '₹₹' },
    { level: 3, label: '₹₹₹' }
  ];

  return (
    <div className="flex gap-2">
      {prices.map(({ level, label }) => (
        <Chip
          key={level}
          isActive={selected === level}
          onClick={() => onSelect(selected === level ? null : level)}
        >
          {label}
        </Chip>
      ))}
    </div>
  );
}