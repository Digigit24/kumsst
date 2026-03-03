/**
 * CategoryPills Component - Category filter pills for quick filtering
 */

import { motion } from 'framer-motion';
import { BookOpen, Layers } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { cn } from '@/lib/utils';
import type { BookCategory } from '../../types/library.types';

interface CategoryPillsProps {
  categories: BookCategory[];
  selectedCategory: number | null;
  onSelect: (categoryId: number | null) => void;
  bookCounts?: Record<number, number>;
  totalBooks?: number;
  className?: string;
  isLoading?: boolean;
}

const pillVariants = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1 },
  tap: { scale: 0.95 },
};

export function CategoryPills({
  categories,
  selectedCategory,
  onSelect,
  bookCounts = {},
  totalBooks = 0,
  className,
  isLoading = false,
}: CategoryPillsProps) {
  const activeCategories = categories.filter((cat) => cat.is_active);

  if (isLoading) {
    return (
      <div className={cn('flex gap-2', className)}>
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="h-9 w-24 rounded-full bg-muted animate-pulse"
          />
        ))}
      </div>
    );
  }

  return (
    <div className={cn('w-full overflow-x-auto scrollbar-thin scrollbar-thumb-border', className)}>
      <motion.div
        className="flex gap-2 pb-2 whitespace-nowrap"
        initial="initial"
        animate="animate"
        transition={{ staggerChildren: 0.05 }}
      >
        {/* All Books Pill */}
        <motion.div variants={pillVariants} whileTap="tap">
          <Button
            variant={selectedCategory === null ? 'default' : 'outline'}
            size="sm"
            className={cn(
              'rounded-full gap-2 transition-all duration-200',
              selectedCategory === null && 'shadow-md'
            )}
            onClick={() => onSelect(null)}
          >
            <Layers className="h-4 w-4" />
            All Books
            {totalBooks > 0 && (
              <Badge
                variant={selectedCategory === null ? 'secondary' : 'outline'}
                className="ml-1 text-xs h-5 px-1.5"
              >
                {totalBooks}
              </Badge>
            )}
          </Button>
        </motion.div>

        {/* Category Pills */}
        {activeCategories.map((category) => {
          const count = bookCounts[category.id] || 0;
          const isSelected = selectedCategory === category.id;

          return (
            <motion.div
              key={category.id}
              variants={pillVariants}
              whileTap="tap"
            >
              <Button
                variant={isSelected ? 'default' : 'outline'}
                size="sm"
                className={cn(
                  'rounded-full gap-2 transition-all duration-200',
                  isSelected && 'shadow-md'
                )}
                onClick={() => onSelect(category.id)}
              >
                <BookOpen className="h-4 w-4" />
                {category.name}
                {count > 0 && (
                  <Badge
                    variant={isSelected ? 'secondary' : 'outline'}
                    className="ml-1 text-xs h-5 px-1.5"
                  >
                    {count}
                  </Badge>
                )}
              </Button>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}

export default CategoryPills;
