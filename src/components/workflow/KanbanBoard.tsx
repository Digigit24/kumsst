/**
 * Kanban Board Component - Pipeline view for workflow-based UIs
 * Displays items in columns based on status
 */

import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

export interface KanbanColumn {
  id: string;
  title: string;
  status: string | string[];
  color: string; // e.g., 'bg-slate-100', 'bg-blue-100'
}

export interface KanbanCard {
  id: number | string;
  status: string;
  title: string;
  subtitle?: string;
  badges?: Array<{
    label: string;
    variant?: 'default' | 'secondary' | 'outline' | 'destructive';
  }>;
  indicators?: Array<{
    icon: LucideIcon;
    label: string;
    color: string; // 'text-green-500', 'text-yellow-500', 'text-red-500'
  }>;
  primaryAction?: {
    label: string;
    onClick: () => void;
    disabled?: boolean;
    loading?: boolean;
    variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  };
  secondaryActions?: Array<{
    label: string;
    icon?: LucideIcon;
    onClick: () => void;
    variant?: 'default' | 'secondary' | 'outline' | 'destructive';
  }>;
  onCardClick?: () => void;
}

interface KanbanBoardProps {
  columns: KanbanColumn[];
  cards: KanbanCard[];
  isLoading?: boolean;
  emptyMessage?: string;
}

export const KanbanBoard = ({ columns, cards, isLoading, emptyMessage = 'No items to display' }: KanbanBoardProps) => {
  const getCardsForColumn = (columnStatus: string | string[]) => {
    if (Array.isArray(columnStatus)) {
      return cards.filter(card => columnStatus.includes(card.status.toLowerCase()));
    }
    return cards.filter(card => card.status.toLowerCase() === columnStatus.toLowerCase());
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <>
      <style>
        {`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #d1d5db; /* gray-300 */
          border-radius: 9999px;
        }
        .custom-scrollbar::-webkit-scrollbar-track:hover {
          background: #f3f4f6; /* gray-100 */
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #9ca3af; /* gray-400 */
        }
        `}
      </style>
      <div className="flex gap-4 overflow-x-auto pb-4 h-full items-start">
        {columns.map(column => {
          const columnCards = getCardsForColumn(column.status);

          return (
            <div key={column.id} className="flex-shrink-0 w-80 flex flex-col max-h-[calc(100vh-220px)]">
              <div className={cn('rounded-t-lg p-3 border-t border-x z-10', column.color, 'dark:bg-opacity-40 dark:border-opacity-80')}>
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-sm text-gray-900 dark:text-gray-50">{column.title}</h3>
                  <Badge variant="secondary" className="ml-2">
                    {columnCards.length}
                  </Badge>
                </div>
              </div>

              <div className="bg-muted/30 rounded-b-lg border-x border-b p-2 space-y-2 overflow-y-auto custom-scrollbar flex-1 min-h-0">
                <AnimatePresence>
                  {columnCards.length === 0 ? (
                    <div className="text-center text-muted-foreground text-sm py-8">
                      No items
                    </div>
                  ) : (
                    columnCards.map(card => (
                      <motion.div
                        key={card.id}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Card
                          className={cn(
                            'cursor-pointer hover:shadow-md transition-shadow',
                            card.onCardClick && 'hover:border-primary'
                          )}
                          onClick={card.onCardClick}
                        >
                          <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-semibold">{card.title}</CardTitle>
                            {card.subtitle && (
                              <p className="text-xs text-muted-foreground">{card.subtitle}</p>
                            )}
                          </CardHeader>
                          <CardContent className="space-y-3">
                            {/* Badges */}
                            {card.badges && card.badges.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {card.badges.map((badge, idx) => (
                                  <Badge key={idx} variant={badge.variant} className="text-xs">
                                    {badge.label}
                                  </Badge>
                                ))}
                              </div>
                            )}

                            {/* Indicators */}
                            {card.indicators && card.indicators.length > 0 && (
                              <div className="space-y-1">
                                {card.indicators.map((indicator, idx) => {
                                  const Icon = indicator.icon;
                                  return (
                                    <div key={idx} className="flex items-center gap-2 text-xs">
                                      <Icon className={cn('h-3 w-3', indicator.color)} />
                                      <span className="text-muted-foreground">{indicator.label}</span>
                                    </div>
                                  );
                                })}
                              </div>
                            )}

                            {/* Actions */}
                            <div className="flex flex-col gap-1 pt-2">
                              {card.primaryAction && (
                                <Button
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    card.primaryAction?.onClick();
                                  }}
                                  disabled={card.primaryAction.disabled || card.primaryAction.loading}
                                  loading={card.primaryAction.loading}
                                  className="w-full"
                                  variant={card.primaryAction.variant || 'default'}
                                >
                                  {card.primaryAction.label}
                                </Button>
                              )}

                              {card.secondaryActions && card.secondaryActions.length > 0 && (
                                <div className="flex gap-1">
                                  {card.secondaryActions.map((action, idx) => {
                                    const Icon = action.icon;
                                    return (
                                      <Button
                                        key={idx}
                                        size="sm"
                                        variant={action.variant || 'outline'}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          action.onClick();
                                        }}
                                        className="flex-1"
                                      >
                                        {Icon && <Icon className="h-3 w-3 mr-1" />}
                                        {action.label}
                                      </Button>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))
                  )}
                </AnimatePresence>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
};
