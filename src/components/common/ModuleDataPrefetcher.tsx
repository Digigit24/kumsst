import { DROPDOWN_PAGE_SIZE } from '@/config/app.config';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Import Service APIs directly to avoid circular dependencies with hooks
import {
  leaveApplicationsApi,
  teachersApi
} from '../../services/hr.service';
import {
  booksApi,
  libraryMembersApi
} from '../../services/library.service';
import {
  centralStoreApi,
  materialIssuesApi,
  storeIndentsApi
} from '../../services/store.service';

// Import Keys from Hooks (or define them here if not exported)
import { materialIssueKeys } from '../../hooks/useMaterialIssues';
import { storeIndentKeys } from '../../hooks/useStoreIndents';

/**
 * ModuleDataPrefetcher
 * 
 * listens to route changes and optimistically prefetches data 
 * when a user enters a main module (e.g., /store, /hr).
 */
export const ModuleDataPrefetcher = () => {
  const { pathname } = useLocation();
  const queryClient = useQueryClient();

  useEffect(() => {
    const prefetchModuleData = async () => {
      // Check for token first
      const token = localStorage.getItem('kumss_auth_token');
      if (!token) return;

      // 1. STORE MODULE
      if (pathname.startsWith('/store')) {

        // Prefetch Store Indents (Matches StoreIndentsPage default filters)
        queryClient.prefetchQuery({
          queryKey: storeIndentKeys.list({ page: 1, page_size: 10 }),
          queryFn: () => storeIndentsApi.list({ page: 1, page_size: 10 }),
          staleTime: 5 * 60 * 1000,
        });

        // Prefetch Material Issues (Matches TransfersWorkflowPage default filters)
        queryClient.prefetchQuery({
          queryKey: materialIssueKeys.list({ ordering: '-created_at', page_size: DROPDOWN_PAGE_SIZE }),
          queryFn: () => materialIssuesApi.list({ ordering: '-created_at', page_size: DROPDOWN_PAGE_SIZE }),
          staleTime: 5 * 60 * 1000,
        });

        // Prefetch Central Store Items
        queryClient.prefetchQuery({
          queryKey: ['central-stores', 'list'],
          queryFn: () => centralStoreApi.list(),
          staleTime: 10 * 60 * 1000,
        });
      }

      // 2. HR MODULE
      if (pathname.startsWith('/hr')) {

        // Prefetch Teachers/Staff
        queryClient.prefetchQuery({
          queryKey: ['teachers'],
          queryFn: () => teachersApi.list(),
          staleTime: 10 * 60 * 1000,
        });

        // Prefetch Leave Applications
        queryClient.prefetchQuery({
          queryKey: ['hr-leave-applications'],
          queryFn: () => leaveApplicationsApi.list(),
          staleTime: 2 * 60 * 1000,
        });
      }

      // 3. LIBRARY MODULE
      if (pathname.startsWith('/library')) {

        // Prefetch Books
        queryClient.prefetchQuery({
          queryKey: ['books'],
          queryFn: () => booksApi.list(),
          staleTime: 10 * 60 * 1000,
        });

        // Prefetch Members
        queryClient.prefetchQuery({
          queryKey: ['library-members'],
          queryFn: () => libraryMembersApi.list(),
          staleTime: 5 * 60 * 1000,
        });
      }


    };

    prefetchModuleData();
  }, [pathname, queryClient]);

  return null;
};
