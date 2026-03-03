/**
 * CardSelect Component
 * Visual card-based selection for choosing between options (replaces dropdowns)
 */

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

export interface CardSelectOption {
  value: string;
  label: string;
  description?: string;
  icon?: LucideIcon;
}

interface CardSelectProps {
  options: CardSelectOption[];
  value: string | undefined;
  onChange: (value: string) => void;
  columns?: 2 | 3 | 4;
  className?: string;
}

export const CardSelect = ({
  options,
  value,
  onChange,
  columns = 3,
  className,
}: CardSelectProps) => {
  const gridCols = {
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
  };

  return (
    <div className={cn('grid gap-3', gridCols[columns], className)}>
      {options.map((option) => {
        const isSelected = value === option.value;
        const Icon = option.icon;

        return (
          <motion.button
            key={option.value}
            type="button"
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onChange(option.value)}
            className={cn(
              'relative p-4 rounded-xl border-2 text-center transition-all duration-200 cursor-pointer',
              isSelected
                ? 'border-primary bg-primary/5 shadow-md shadow-primary/10 ring-1 ring-primary/20'
                : 'border-muted hover:border-primary/30 hover:bg-muted/30'
            )}
          >
            {isSelected && (
              <motion.div
                layoutId="card-select-indicator"
                className="absolute inset-0 rounded-xl border-2 border-primary"
                transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
              />
            )}
            {Icon && (
              <div
                className={cn(
                  'mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-lg transition-colors',
                  isSelected
                    ? 'bg-primary/10 text-primary'
                    : 'bg-muted/50 text-muted-foreground'
                )}
              >
                <Icon className="h-5 w-5" />
              </div>
            )}
            <div
              className={cn(
                'font-medium text-sm transition-colors',
                isSelected ? 'text-primary' : 'text-foreground'
              )}
            >
              {option.label}
            </div>
            {option.description && (
              <div className="text-xs text-muted-foreground mt-1">
                {option.description}
              </div>
            )}
          </motion.button>
        );
      })}
    </div>
  );
};
