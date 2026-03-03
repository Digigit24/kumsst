import { useQueryClient } from "@tanstack/react-query";
import { DROPDOWN_PAGE_SIZE } from "@/config/app.config";

// Import Service APIs
import {
  storeIndentsApi,
  materialIssuesApi,
  centralStoreApi,
} from "../services/store.service";
import { teachersApi, leaveApplicationsApi } from "../services/hr.service";
import { booksApi, libraryMembersApi } from "../services/library.service";

// Import Keys
import { storeIndentKeys } from "../hooks/useStoreIndents";
import { materialIssueKeys } from "../hooks/useMaterialIssues";

/**
 * Hook that returns a function to prefetch data based on module name.
 * To be used in Sidebar or Navigation components on hover/click.
 */
export const useModulePrefetcher = () => {
  const queryClient = useQueryClient();

  const prefetchModule = async (groupName: string) => {
    const normalizedGroup = groupName.toLowerCase();

    switch (normalizedGroup) {
      case "store":
        // Prefetch Store Indents
        queryClient.prefetchQuery({
          queryKey: storeIndentKeys.list({ page: 1, page_size: 10 }),
          queryFn: () => storeIndentsApi.list({ page: 1, page_size: 10 }),
          staleTime: 5 * 60 * 1000,
        });

        // Prefetch Approved Indents (For Fulfillment Queue)
        queryClient.prefetchQuery({
          queryKey: storeIndentKeys.list({ status: "super_admin_approved" }),
          queryFn: () =>
            storeIndentsApi.list({ status: "super_admin_approved" }),
          staleTime: 5 * 60 * 1000,
        });

        // Prefetch Material Issues
        queryClient.prefetchQuery({
          queryKey: materialIssueKeys.list({
            ordering: "-created_at",
            page_size: DROPDOWN_PAGE_SIZE,
          }),
          queryFn: () =>
            materialIssuesApi.list({
              ordering: "-created_at",
              page_size: DROPDOWN_PAGE_SIZE,
            }),
          staleTime: 5 * 60 * 1000,
        });

        // Prefetch Central Store Items
        queryClient.prefetchQuery({
          queryKey: ["central-stores", "list"],
          queryFn: () => centralStoreApi.list(),
          staleTime: 10 * 60 * 1000,
        });
        break;

      case "hr":
        // Prefetch Teachers/Staff
        queryClient.prefetchQuery({
          queryKey: ["teachers"],
          queryFn: () => teachersApi.list(),
          staleTime: 10 * 60 * 1000,
        });

        // Prefetch Leave Applications
        queryClient.prefetchQuery({
          queryKey: ["hr-leave-applications"],
          queryFn: () => leaveApplicationsApi.list(),
          staleTime: 2 * 60 * 1000,
        });
        break;

      case "library":
        // Prefetch Books
        queryClient.prefetchQuery({
          queryKey: ["books"],
          queryFn: () => booksApi.list(),
          staleTime: 10 * 60 * 1000,
        });

        // Prefetch Members
        queryClient.prefetchQuery({
          queryKey: ["library-members"],
          queryFn: () => libraryMembersApi.list(),
          staleTime: 5 * 60 * 1000,
        });
        break;

      default:
        break;
    }
  };

  return prefetchModule;
};
