/**
 * Stepper Component - Shows workflow progress and allows navigation
 * Used in detail views to show current status and history
 */

import { CheckCircle, Circle, LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '../ui/badge';

export interface StepperStep {
  id: string;
  title: string;
  description?: string;
  icon?: LucideIcon;
  status: 'completed' | 'current' | 'upcoming' | 'skipped' | 'rejected';
  timestamp?: string;
  user?: string;
  notes?: string;
}

interface StepperProps {
  steps: StepperStep[];
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}

export const Stepper = ({ steps, orientation = 'horizontal', className }: StepperProps) => {
  if (orientation === 'vertical') {
    return (
      <div className={cn('space-y-4', className)}>
        {steps.map((step, index) => {
          const Icon = step.icon || Circle;
          const isLast = index === steps.length - 1;

          return (
            <div key={step.id} className="flex gap-4">
              <div className="flex flex-col items-center">
                {/* Step icon */}
                <div
                  className={cn(
                    'flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all',
                    step.status === 'completed' && 'bg-primary border-primary text-primary-foreground',
                    step.status === 'current' && 'border-primary text-primary bg-primary/10',
                    step.status === 'rejected' && 'border-destructive text-destructive bg-destructive/10',
                    step.status === 'skipped' && 'border-muted text-muted-foreground bg-muted',
                    step.status === 'upcoming' && 'border-muted text-muted-foreground'
                  )}
                >
                  {step.status === 'completed' ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    <Icon className="h-5 w-5" />
                  )}
                </div>

                {/* Connector line */}
                {!isLast && (
                  <div
                    className={cn(
                      'w-0.5 h-16 my-1',
                      step.status === 'completed' ? 'bg-primary' : 'bg-muted'
                    )}
                  />
                )}
              </div>

              {/* Step content */}
              <div className="flex-1 pb-8">
                <div className="flex items-center gap-2 mb-1">
                  <h4
                    className={cn(
                      'font-semibold',
                      step.status === 'current' && 'text-primary',
                      step.status === 'rejected' && 'text-destructive',
                      step.status === 'upcoming' && 'text-muted-foreground'
                    )}
                  >
                    {step.title}
                  </h4>
                  {step.status === 'current' && (
                    <Badge variant="default" className="text-xs">
                      Current
                    </Badge>
                  )}
                  {step.status === 'rejected' && (
                    <Badge variant="destructive" className="text-xs">
                      Rejected
                    </Badge>
                  )}
                </div>

                {step.description && (
                  <p className="text-sm text-muted-foreground mb-2">{step.description}</p>
                )}

                {step.timestamp && (
                  <div className="text-xs text-muted-foreground">
                    {step.timestamp}
                    {step.user && ` by ${step.user}`}
                  </div>
                )}

                {step.notes && (
                  <div className="mt-2 p-2 bg-muted rounded text-sm">
                    <span className="font-medium">Notes:</span> {step.notes}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // Horizontal stepper
  return (
    <div className={cn('flex items-center justify-between', className)}>
      {steps.map((step, index) => {
        const Icon = step.icon || Circle;
        const isLast = index === steps.length - 1;

        return (
          <div key={step.id} className="flex items-center flex-1">
            <div className="flex flex-col items-center flex-1">
              {/* Step icon */}
              <div
                className={cn(
                  'flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all',
                  step.status === 'completed' && 'bg-primary border-primary text-primary-foreground',
                  step.status === 'current' && 'border-primary text-primary bg-primary/10',
                  step.status === 'rejected' && 'border-destructive text-destructive bg-destructive/10',
                  step.status === 'skipped' && 'border-muted text-muted-foreground bg-muted',
                  step.status === 'upcoming' && 'border-muted text-muted-foreground'
                )}
              >
                {step.status === 'completed' ? (
                  <CheckCircle className="h-5 w-5" />
                ) : (
                  <Icon className="h-5 w-5" />
                )}
              </div>

              {/* Step title */}
              <span
                className={cn(
                  'text-xs mt-2 font-medium text-center',
                  step.status === 'current' && 'text-primary',
                  step.status === 'rejected' && 'text-destructive',
                  step.status === 'upcoming' && 'text-muted-foreground'
                )}
              >
                {step.title}
              </span>

              {step.timestamp && (
                <span className="text-xs text-muted-foreground mt-1">{step.timestamp}</span>
              )}
            </div>

            {/* Connector line */}
            {!isLast && (
              <div
                className={cn(
                  'h-0.5 flex-1 mx-2 transition-all',
                  step.status === 'completed' ? 'bg-primary' : 'bg-muted'
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};
