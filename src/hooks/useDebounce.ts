
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

// Default debounce delays for common use cases
export const DEBOUNCE_DELAYS = {
  SEARCH: 300,      // Search input debounce
  FILTER: 200,      // Filter dropdown/checkbox changes
  INPUT: 400,       // General text input
  RESIZE: 150,      // Window resize events
  SCROLL: 100,      // Scroll events
} as const;

/**
 * Custom hook to debounce a value.
 * @param value The value to debounce
 * @param delay The delay in milliseconds (default: 500ms)
 * @returns The debounced value
 */
export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Custom hook to debounce a callback function.
 * The callback will only be executed after the specified delay has passed
 * since the last invocation.
 *
 * @param callback The callback function to debounce
 * @param delay The delay in milliseconds (default: 300ms)
 * @returns A debounced version of the callback
 *
 * @example
 * const debouncedSearch = useDebouncedCallback((query: string) => {
 *   fetchSearchResults(query);
 * }, 300);
 *
 * <input onChange={(e) => debouncedSearch(e.target.value)} />
 */
export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number = DEBOUNCE_DELAYS.SEARCH
): (...args: Parameters<T>) => void {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const callbackRef = useRef(callback);

  // Keep callback ref updated
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callbackRef.current(...args);
      }, delay);
    },
    [delay]
  );
}

/**
 * Custom hook for debouncing filter state changes.
 * Provides immediate local state updates for responsive UI,
 * while debouncing the actual filter changes sent to the server.
 *
 * @param initialFilters Initial filter values
 * @param onFiltersChange Callback when debounced filters change
 * @param delay Debounce delay in milliseconds (default: 200ms for filters)
 * @returns Object with local filters, debounced filters, and update functions
 *
 * @example
 * const {
 *   localFilters,
 *   debouncedFilters,
 *   updateFilter,
 *   updateFilters,
 *   resetFilters
 * } = useDebouncedFilters(
 *   { search: '', category: '', status: '' },
 *   (filters) => fetchData(filters),
 *   300
 * );
 */
export function useDebouncedFilters<T extends Record<string, any>>(
  initialFilters: T,
  onFiltersChange?: (filters: T) => void,
  delay: number = DEBOUNCE_DELAYS.FILTER
): {
  localFilters: T;
  debouncedFilters: T;
  updateFilter: <K extends keyof T>(key: K, value: T[K]) => void;
  updateFilters: (updates: Partial<T>) => void;
  resetFilters: (preserveKeys?: (keyof T)[]) => void;
  setLocalFilters: React.Dispatch<React.SetStateAction<T>>;
  isPending: boolean;
} {
  const [localFilters, setLocalFilters] = useState<T>(initialFilters);
  const [isPending, setIsPending] = useState(false);
  const debouncedFilters = useDebounce(localFilters, delay);
  const isInitialMount = useRef(true);
  const previousDebouncedRef = useRef<T>(initialFilters);

  // Track pending state
  useEffect(() => {
    const hasChanges = JSON.stringify(localFilters) !== JSON.stringify(debouncedFilters);
    setIsPending(hasChanges);
  }, [localFilters, debouncedFilters]);

  // Call onFiltersChange when debounced filters change (skip initial mount)
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    // Only call if filters actually changed
    if (JSON.stringify(debouncedFilters) !== JSON.stringify(previousDebouncedRef.current)) {
      previousDebouncedRef.current = debouncedFilters;
      onFiltersChange?.(debouncedFilters);
    }
  }, [debouncedFilters, onFiltersChange]);

  // Update a single filter
  const updateFilter = useCallback(<K extends keyof T>(key: K, value: T[K]) => {
    setLocalFilters((prev) => {
      // Clean up empty values
      const cleanValue = value === '' ? undefined : value;
      return { ...prev, [key]: cleanValue };
    });
  }, []);

  // Update multiple filters at once
  const updateFilters = useCallback((updates: Partial<T>) => {
    setLocalFilters((prev) => {
      const cleanUpdates = Object.entries(updates).reduce((acc, [key, value]) => {
        acc[key as keyof T] = (value === '' ? undefined : value) as T[keyof T];
        return acc;
      }, {} as Partial<T>);
      return { ...prev, ...cleanUpdates };
    });
  }, []);

  // Reset filters to initial state, optionally preserving certain keys
  const resetFilters = useCallback((preserveKeys?: (keyof T)[]) => {
    if (preserveKeys && preserveKeys.length > 0) {
      setLocalFilters((prev) => {
        const preserved = preserveKeys.reduce((acc, key) => {
          if (key in prev) {
            acc[key] = prev[key];
          }
          return acc;
        }, {} as Partial<T>);
        return { ...initialFilters, ...preserved };
      });
    } else {
      setLocalFilters(initialFilters);
    }
  }, [initialFilters]);

  return {
    localFilters,
    debouncedFilters,
    updateFilter,
    updateFilters,
    resetFilters,
    setLocalFilters,
    isPending,
  };
}

/**
 * Utility function to create a debounced function (non-hook version).
 * Useful for class components or non-React contexts.
 *
 * @param fn The function to debounce
 * @param delay The delay in milliseconds
 * @returns A debounced version of the function with a cancel method
 */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): ((...args: Parameters<T>) => void) & { cancel: () => void } {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  const debouncedFn = (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      fn(...args);
      timeoutId = null;
    }, delay);
  };

  debouncedFn.cancel = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  };

  return debouncedFn;
}
