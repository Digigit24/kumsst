/**
 * Universal DetailSidebar Component
 * Slide-out sidebar for displaying details, create, and edit forms
 */

import { Button } from '@/components/ui/button';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import { cn } from '@/lib/utils';
import { Eye, Pencil, Plus, X } from 'lucide-react';
import { MouseEvent as ReactMouseEvent, ReactNode, useCallback, useEffect, useRef, useState } from 'react';

export interface DetailSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  mode: 'view' | 'create' | 'edit';
  children: ReactNode;
  footer?: ReactNode;
  data?: unknown;
  onEdit?: () => void;
  onDelete?: () => void;
  width?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | 'full';
  contentClassName?: string;
}

const widthClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  '3xl': 'max-w-3xl',
  '4xl': 'max-w-4xl',
  '5xl': 'max-w-5xl',
  'full': 'max-w-full',
};

export function DetailSidebar({
  isOpen,
  onClose,
  title,
  subtitle,
  icon,
  mode,
  children,
  footer,
  onEdit,
  onDelete,
  width = 'xl',
  contentClassName,
}: DetailSidebarProps) {
  // Lock body scroll when sidebar is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Focus trap for accessibility
  const focusTrapRef = useFocusTrap<HTMLDivElement>(isOpen);

  // Resize Logic
  const sidebarRef = useRef<HTMLDivElement>(null);
  const [currentWidth, setCurrentWidth] = useState<number | null>(null);
  const [isResizing, setIsResizing] = useState(false);

  // Initialize width based on prop when opening
  useEffect(() => {
    if (isOpen && !currentWidth) {
      // Map tailwind classes to approximate pixel widths for initial state if needed
      // Or just let CSS handle it until first resize
    }
  }, [isOpen]);

  const startResizing = useCallback((e: ReactMouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  }, []);

  const stopResizing = useCallback(() => {
    setIsResizing(false);
  }, []);

  const resize = useCallback(
    (e: MouseEvent) => {
      if (isResizing) {
        const newWidth = window.innerWidth - e.clientX;
        if (newWidth > 300 && newWidth < window.innerWidth - 50) {
          setCurrentWidth(newWidth);
        }
      }
    },
    [isResizing]
  );

  useEffect(() => {
    if (isResizing) {
      window.addEventListener('mousemove', resize);
      window.addEventListener('mouseup', stopResizing);
    } else {
      window.removeEventListener('mousemove', resize);
      window.removeEventListener('mouseup', stopResizing);
    }
    return () => {
      window.removeEventListener('mousemove', resize);
      window.removeEventListener('mouseup', stopResizing);
    };
  }, [isResizing, resize, stopResizing]);

  // Animation and Render Logic
  const [isRendered, setIsRendered] = useState(isOpen);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsRendered(true);
      // Small delay to ensure render happens before animation class is applied
      const timer = setTimeout(() => setIsVisible(true), 20);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
      const timer = setTimeout(() => setIsRendered(false), 500); // Match transition duration
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isRendered) return null;

  const getModeLabel = () => {
    switch (mode) {
      case 'create':
        return 'Create New';
      case 'edit':
        return 'Edit';
      case 'view':
        return 'View Details';
      default:
        return '';
    }
  };

  const getModeIcon = () => {
    if (icon) return icon;
    switch (mode) {
      case 'create':
        return <Plus className="h-5 w-5" />;
      case 'edit':
        return <Pencil className="h-5 w-5" />;
      case 'view':
        return <Eye className="h-5 w-5" />;
      default:
        return null;
    }
  };

  const resolvedIcon = getModeIcon();

  return (
    <>
      {/* Overlay */}
      <div
        className={cn(
          "fixed inset-0 bg-black/50 z-40 transition-opacity duration-500 ease-in-out backdrop-blur-sm",
          isVisible ? "opacity-100" : "opacity-0"
        )}
        onClick={onClose}
      />

      {/* Sidebar */}
      <div
        ref={(node) => {
          // Combine both refs
          (sidebarRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
          (focusTrapRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
        }}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cn(
          'fixed right-2 top-2 bottom-2 z-50 flex flex-col transition-transform duration-500 ease-in-out',
          'bg-background/95 dark:bg-background/95 backdrop-blur-xl backdrop-saturate-200',
          'rounded-2xl',
          'shadow-[0_0_30px_hsl(var(--primary)/0.12)] dark:shadow-[0_0_30px_hsl(var(--primary)/0.15)]',
          'border border-primary/20 dark:border-primary/10',
          !currentWidth && 'w-full',
          !currentWidth && widthClasses[width],
          isVisible ? 'translate-x-0' : 'translate-x-full'
        )}
        style={currentWidth ? { width: `${currentWidth}px` } : undefined}
      >

        {/* Resize Handle */}
        <div
          className="absolute left-0 top-0 bottom-0 w-4 -ml-2 cursor-ew-resize hover:bg-primary/10 transition-colors z-50 group flex items-center justify-center"
          onMouseDown={startResizing}
        >
          <div className="h-8 w-1 bg-muted-foreground/50 rounded-full group-hover:bg-primary transition-colors shadow-sm" />
        </div>

        <div className="flex flex-col h-full">
          {/* Header */}
          <div className={cn(
            "flex items-center justify-between px-6 py-4",
            "border-b border-white/20 dark:border-white/10",
            "bg-gradient-to-r from-white/60 to-white/40 dark:from-background/60 dark:to-background/40",
            "backdrop-blur-sm rounded-t-2xl"
          )}>
            <div className="flex items-center gap-3">
              {resolvedIcon && (
                <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-primary/10 dark:bg-primary/20 text-primary shadow-sm">
                  {resolvedIcon}
                </div>
              )}
              <div>
                <h2 className="text-xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">{title}</h2>
                {(subtitle !== undefined ? subtitle : getModeLabel()) && (
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {subtitle !== undefined ? subtitle : getModeLabel()}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {mode === 'view' && onEdit && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onEdit}
                  className="rounded-xl hover:bg-primary/10 hover:shadow-md transition-all"
                >
                  Edit
                </Button>
              )}
              {mode === 'view' && onDelete && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onDelete}
                  className="rounded-xl hover:bg-destructive/10 hover:text-destructive hover:border-destructive hover:shadow-md transition-all"
                >
                  Delete
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="rounded-xl hover:bg-destructive/10 hover:text-destructive hover:shadow-md transition-all"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className={cn('flex-1 overflow-y-auto px-6 py-6', contentClassName)}>
            {children}
          </div>

          {/* Footer */}
          {footer && (
            <div className={cn(
              "px-6 py-4 border-t border-white/20 dark:border-white/10",
              "bg-gradient-to-r from-white/60 to-white/40 dark:from-background/60 dark:to-background/40",
              "backdrop-blur-sm"
            )}>
              {footer}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
