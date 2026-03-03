import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { coreKeys } from '../../hooks/useCore';
import { academicYearApi, collegeApi } from '../../services/core.service';

/**
 * Component to prefetch common data for the application
 * This helps in reducing loading times for dropdowns and common lists
 */
export const DataPrefetcher = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const prefetchCommonData = async () => {
      // Don't prefetch if not authenticated or on login page
      const token = localStorage.getItem('kumss_auth_token');
      const isLoginPage = window.location.pathname.includes('/login');

      if (!token || isLoginPage) return;

      // Prefetch Colleges (Dropdowns everywhere)
      await queryClient.prefetchQuery({
        queryKey: coreKeys.collegesList(),
        queryFn: () => collegeApi.list(),
        staleTime: 1000 * 60 * 30, // 30 mins
      });

      // Prefetch Academic Years (Skip for Store Managers)
      const userStr = localStorage.getItem('kumss_user');
      let isStoreManager = false;
      try {
        if (userStr) {
          const user = JSON.parse(userStr);
          const role = user.user_type || (user.roles && user.roles[0]);
          isStoreManager = role === 'store_manager';
        }
      } catch (e) {
        // ignore parse error
      }

      if (!isStoreManager) {
        await queryClient.prefetchQuery({
          queryKey: coreKeys.academicYearsList(),
          queryFn: () => academicYearApi.list(),
          staleTime: 1000 * 60 * 60, // 60 mins
        });
      }

    };

    prefetchCommonData();
  }, [queryClient]);

  return null;
};
