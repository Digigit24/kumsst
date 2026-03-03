import React, { useRef, useState, useEffect } from 'react';

interface LazySectionProps {
  children: React.ReactNode;
  /** Skeleton placeholder shown before the section enters the viewport */
  fallback?: React.ReactNode;
  /** How far before the viewport to start loading (default: 200px) */
  rootMargin?: string;
}

/**
 * Defers rendering (and thus API calls) of a dashboard section
 * until it enters or is near the viewport.
 *
 * The first N sections should render eagerly (no wrapper).
 * Sections further down the page should be wrapped in LazySection
 * so their hooks don't fire until the user scrolls near them.
 */
export const LazySection: React.FC<LazySectionProps> = ({
  children,
  fallback,
  rootMargin = '200px',
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [rootMargin]);

  if (isVisible) {
    return <>{children}</>;
  }

  return (
    <div ref={ref}>
      {fallback ?? (
        <div className="h-48 animate-pulse bg-muted/20 rounded-lg" />
      )}
    </div>
  );
};
