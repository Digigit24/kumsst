/**
 * SWR Global Configuration Provider
 * Configures SWR caching behavior for the entire application
 */

import { ReactNode } from 'react';
import { SWRConfig } from 'swr';

interface SWRProviderProps {
  children: ReactNode;
}

/**
 * Global error handler for SWR
 * Logs errors but doesn't throw - components handle their own error states
 */
const onError = (_error: Error, _key: string) => {
  // Error handling is done at the component level via SWR's error state
};

/**
 * Global configuration for all SWR hooks
 *
 * Key settings:
 * - dedupingInterval: 10 minutes - prevents duplicate requests
 * - NO revalidation on focus/reconnect - dropdown data doesn't need constant refreshing
 * - revalidateIfStale: true - Stale-while-revalidate pattern for instant cache display
 * - keepPreviousData: true - show cached data immediately while revalidating in background
 * - errorRetryCount: 3 - retry failed requests 3 times
 *
 * This configuration prioritizes fast loading from cache with background revalidation,
 * which is ideal for dropdown data that users see instantly across page navigations.
 */
export function SWRProvider({ children }: SWRProviderProps) {
  return (
    <SWRConfig
      value={{
        // Deduplication: requests within this window use cached data
        dedupingInterval: 10 * 60 * 1000, // 10 minutes

        // Focus throttling: limit how often we revalidate on tab focus
        focusThrottleInterval: 10 * 60 * 1000, // 10 minutes

        // Error handling
        errorRetryCount: 3,
        errorRetryInterval: 5000, // 5 seconds between retries
        shouldRetryOnError: true,

        // Revalidation settings for stale-while-revalidate pattern
        revalidateOnFocus: false, // Don't refetch on window focus
        revalidateOnReconnect: false, // Don't refetch on reconnect
        revalidateIfStale: true, // Background revalidation - show cached data, refresh silently

        // Don't auto-refresh on interval
        refreshInterval: 0,

        // Keep previous data while revalidating for smooth UX (instant cache display)
        keepPreviousData: true,

        // Global error handler
        onError,

        // Don't suspend - use loading states instead
        suspense: false,
      }}
    >
      {children}
    </SWRConfig>
  );
}

export default SWRProvider;
