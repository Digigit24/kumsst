import { useState, useCallback, useRef } from 'react';

/**
 * Hook to prevent double-click/double-submit on async actions
 * Automatically disables action while it's running
 *
 * @example
 * ```tsx
 * const { execute, isLoading } = useAsyncAction();
 *
 * const handleSubmit = () => execute(async () => {
 *   await api.createUser(data);
 * });
 *
 * <Button onClick={handleSubmit} loading={isLoading}>Submit</Button>
 * ```
 */
export function useAsyncAction<T = void>() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const isRunningRef = useRef(false);

  const execute = useCallback(async (action: () => Promise<T>): Promise<T | undefined> => {
    // Prevent double execution
    if (isRunningRef.current) {
      console.warn('[useAsyncAction] Action already in progress, ignoring duplicate call');
      return undefined;
    }

    isRunningRef.current = true;
    setIsLoading(true);
    setError(null);

    try {
      const result = await action();
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      throw error;
    } finally {
      isRunningRef.current = false;
      setIsLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setError(null);
    setIsLoading(false);
    isRunningRef.current = false;
  }, []);

  return { execute, isLoading, error, reset };
}

/**
 * Hook for form submissions with automatic loading state
 * Prevents double submit and handles errors
 *
 * @example
 * ```tsx
 * const { handleSubmit, isSubmitting } = useFormSubmit({
 *   onSubmit: async (data) => await api.create(data),
 *   onSuccess: () => toast.success('Created!'),
 *   onError: (err) => toast.error(err.message),
 * });
 *
 * <form onSubmit={handleSubmit}>
 *   <Button type="submit" loading={isSubmitting}>Save</Button>
 * </form>
 * ```
 */
export function useFormSubmit<T>({
  onSubmit,
  onSuccess,
  onError,
}: {
  onSubmit: () => Promise<T>;
  onSuccess?: (result: T) => void;
  onError?: (error: Error) => void;
}) {
  const { execute, isLoading, error } = useAsyncAction<T>();

  const handleSubmit = useCallback(
    async (e?: React.FormEvent) => {
      e?.preventDefault();

      try {
        const result = await execute(onSubmit);
        if (result !== undefined) {
          onSuccess?.(result);
        }
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        onError?.(error);
      }
    },
    [execute, onSubmit, onSuccess, onError]
  );

  return { handleSubmit, isSubmitting: isLoading, error };
}

/**
 * Simple debounced click handler - prevents rapid clicks
 *
 * @example
 * ```tsx
 * const debouncedClick = useDebouncedClick(handleSave, 500);
 * <Button onClick={debouncedClick}>Save</Button>
 * ```
 */
export function useDebouncedClick(
  callback: (...args: any[]) => void,
  delay: number = 300
) {
  const lastCallRef = useRef<number>(0);

  return useCallback(
    (...args: any[]) => {
      const now = Date.now();
      if (now - lastCallRef.current >= delay) {
        lastCallRef.current = now;
        callback(...args);
      }
    },
    [callback, delay]
  );
}

export default useAsyncAction;
