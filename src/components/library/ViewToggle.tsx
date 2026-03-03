/**
 * ViewToggle Component - Toggle between Table, Grid, and Shelf view
 */

import { cn } from '@/lib/utils';
import { LayoutGrid, List } from 'lucide-react';
import { Button } from '../ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../ui/tooltip';

export type ViewMode = 'table' | 'grid';

interface ViewToggleProps {
  value: ViewMode;
  onChange: (mode: ViewMode) => void;
  className?: string;
}

export function ViewToggle({ value, onChange, className }: ViewToggleProps) {
  return (
    <TooltipProvider>
      <div
        className={cn(
          'inline-flex items-center rounded-lg border bg-muted p-1 gap-1',
          className
        )}
      >

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={value === 'grid' ? 'default' : 'ghost'}
              size="sm"
              className={cn(
                'h-8 px-3',
                value === 'grid' && 'shadow-sm'
              )}
              onClick={() => onChange('grid')}
            >
              <LayoutGrid className="h-4 w-4 mr-1.5" />
              Grid
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>View as grid</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={value === 'table' ? 'default' : 'ghost'}
              size="sm"
              className={cn(
                'h-8 px-3',
                value === 'table' && 'shadow-sm'
              )}
              onClick={() => onChange('table')}
            >
              <List className="h-4 w-4 mr-1.5" />
              Table
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>View as table</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}

export default ViewToggle;
