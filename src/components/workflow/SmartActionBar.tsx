/**
 * Smart Action Bar - Sticky action bar that shows context-aware buttons
 * Based on current status and user role
 */

import { LucideIcon } from 'lucide-react';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { MoreVertical } from 'lucide-react';

export interface ActionBarAction {
  label: string;
  icon?: LucideIcon;
  onClick: () => void;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost';
  disabled?: boolean;
  loading?: boolean;
}

interface SmartActionBarProps {
  primaryAction?: ActionBarAction;
  secondaryActions?: ActionBarAction[];
  moreActions?: ActionBarAction[];
  onClose?: () => void;
}

export const SmartActionBar = ({
  primaryAction,
  secondaryActions = [],
  moreActions = [],
  onClose,
}: SmartActionBarProps) => {
  return (
    <div className="sticky bottom-0 left-0 right-0 bg-background border-t p-4 flex items-center justify-between gap-2 shadow-lg">
      <div className="flex items-center gap-2">
        {onClose && (
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
        )}
      </div>

      <div className="flex items-center gap-2">
        {/* Secondary actions */}
        {secondaryActions.map((action, idx) => {
          const Icon = action.icon;
          return (
            <Button
              key={idx}
              variant={action.variant || 'outline'}
              onClick={action.onClick}
              disabled={action.disabled || action.loading}
            >
              {Icon && <Icon className="h-4 w-4 mr-2" />}
              {action.loading ? 'Loading...' : action.label}
            </Button>
          );
        })}

        {/* Primary action */}
        {primaryAction && (
          <Button
            variant={primaryAction.variant || 'default'}
            onClick={primaryAction.onClick}
            disabled={primaryAction.disabled || primaryAction.loading}
            size="lg"
          >
            {primaryAction.icon && <primaryAction.icon className="h-4 w-4 mr-2" />}
            {primaryAction.loading ? 'Loading...' : primaryAction.label}
          </Button>
        )}

        {/* More actions dropdown */}
        {moreActions.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {moreActions.map((action, idx) => {
                const Icon = action.icon;
                return (
                  <DropdownMenuItem
                    key={idx}
                    onClick={action.onClick}
                    disabled={action.disabled}
                  >
                    {Icon && <Icon className="h-4 w-4 mr-2" />}
                    {action.label}
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  );
};
