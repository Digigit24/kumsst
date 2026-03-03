import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { storeIndentsApi } from "../services/store.service";

export const storeIndentKeys = {
  all: ["storeIndents"] as const,
  lists: () => [...storeIndentKeys.all, "list"] as const,
  list: (filters?: any) => [...storeIndentKeys.lists(), filters] as const,
  details: () => [...storeIndentKeys.all, "detail"] as const,
  detail: (id: number) => [...storeIndentKeys.details(), id] as const,
};

export const useStoreIndents = (filters?: any) => {
  return useQuery({
    queryKey: storeIndentKeys.list(filters),
    queryFn: () => storeIndentsApi.list(filters),
  });
};

export const useStoreIndent = (id: number) => {
  return useQuery({
    queryKey: storeIndentKeys.detail(id),
    queryFn: () => storeIndentsApi.get(id),
    enabled: !!id,
  });
};

export const useCreateStoreIndent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      // Deep copy to avoid mutating original data
      const cleanedData = JSON.parse(JSON.stringify(data));

      // Remove indent field from items (backend no longer requires it)
      if (cleanedData.items && Array.isArray(cleanedData.items)) {
        cleanedData.items = cleanedData.items.map((item: any) => {
          const { indent, ...itemWithoutIndent } = item;

          // Ensure central_store_item is a number
          if (itemWithoutIndent.central_store_item) {
            itemWithoutIndent.central_store_item = parseInt(
              itemWithoutIndent.central_store_item
            );
          }

          // Clean empty strings from item fields
          Object.keys(itemWithoutIndent).forEach((key) => {
            if (itemWithoutIndent[key] === "") {
              delete itemWithoutIndent[key];
            }
          });

          return itemWithoutIndent;
        });
      }

      // Convert empty strings to null for optional fields
      const optionalFields = [
        "approved_date",
        "approved_by",
        "attachments",
        "requesting_store_manager",
        "approval_request",
      ];

      optionalFields.forEach((field) => {
        if (cleanedData[field] === "" || cleanedData[field] === null) {
          delete cleanedData[field];
        }
      });

      return storeIndentsApi.create(cleanedData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: storeIndentKeys.lists() });
    },
  });
};

export const useUpdateStoreIndent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => {
      // Clean up data before sending
      const cleanedData = { ...data };

      // Remove indent field from items (should already be set)
      if (cleanedData.items && Array.isArray(cleanedData.items)) {
        cleanedData.items = cleanedData.items.map((item: any) => {
          const { indent, ...itemWithoutIndent } = item;

          // Ensure central_store_item is a number
          if (itemWithoutIndent.central_store_item) {
            itemWithoutIndent.central_store_item = parseInt(
              itemWithoutIndent.central_store_item
            );
          }

          // Clean empty strings from item fields
          Object.keys(itemWithoutIndent).forEach((key) => {
            if (itemWithoutIndent[key] === "") {
              delete itemWithoutIndent[key];
            }
          });

          return itemWithoutIndent;
        });
      }

      // Convert empty strings to null for optional fields
      const optionalFields = [
        "approved_date",
        "approved_by",
        "attachments",
        "requesting_store_manager",
        "approval_request",
      ];

      optionalFields.forEach((field) => {
        if (cleanedData[field] === "" || cleanedData[field] === null) {
          delete cleanedData[field];
        }
      });

      return storeIndentsApi.update(id, cleanedData);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: storeIndentKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: storeIndentKeys.detail(variables.id),
      });
    },
  });
};

export const usePatchStoreIndent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      storeIndentsApi.patch(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: storeIndentKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: storeIndentKeys.detail(variables.id),
      });
    },
  });
};

export const useDeleteStoreIndent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: storeIndentsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: storeIndentKeys.lists() });
    },
  });
};

export const useApproveStoreIndent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      storeIndentsApi.approve(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: storeIndentKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: storeIndentKeys.detail(variables.id),
      });
    },
  });
};

export const useRejectStoreIndent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      storeIndentsApi.reject(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: storeIndentKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: storeIndentKeys.detail(variables.id),
      });
    },
  });
};

export const useSubmitStoreIndent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      storeIndentsApi.submit(id, data),
    onMutate: async ({ id }) => {
      await queryClient.cancelQueries({ queryKey: storeIndentKeys.lists() });
      await queryClient.cancelQueries({ queryKey: storeIndentKeys.detail(id) });

      const previousList = queryClient.getQueryData(storeIndentKeys.lists());
      const previousDetail = queryClient.getQueryData(storeIndentKeys.detail(id));

      queryClient.setQueriesData({ queryKey: storeIndentKeys.lists() }, (old: any) => {
        if (!old || !old.results) return old;
        return {
          ...old,
          results: old.results.map((item: any) =>
            item.id === id ? { ...item, status: "pending_college_approval" } : item
          ),
        };
      });

      return { previousList, previousDetail };
    },
    onError: (err, newTodo, context) => {
      if (context?.previousList) {
        queryClient.setQueryData(storeIndentKeys.lists(), context.previousList);
      }
      if (context?.previousDetail) {
        queryClient.setQueryData(storeIndentKeys.detail(newTodo.id), context.previousDetail);
      }
    },
    onSettled: (_, __, variables) => {
      queryClient.invalidateQueries({ queryKey: storeIndentKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: storeIndentKeys.detail(variables.id),
      });
    },
  });
};

// College Admin Approvals
export const usePendingCollegeApprovals = (filters?: any) => {
  return useQuery({
    queryKey: [...storeIndentKeys.lists(), "pending_college", filters],
    queryFn: () => storeIndentsApi.pendingCollegeApprovals(filters),
  });
};

export const useCollegeAdminApprove = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      storeIndentsApi.collegeAdminApprove(id, data),
    onMutate: async ({ id }) => {
      await queryClient.cancelQueries({ queryKey: storeIndentKeys.lists() });
      await queryClient.cancelQueries({ queryKey: storeIndentKeys.detail(id) });

      const previousList = queryClient.getQueryData(storeIndentKeys.lists());
      const previousDetail = queryClient.getQueryData(storeIndentKeys.detail(id));

      queryClient.setQueriesData({ queryKey: storeIndentKeys.lists() }, (old: any) => {
        if (!old || !old.results) return old;
        return {
          ...old,
          results: old.results.map((item: any) =>
            item.id === id ? { ...item, status: "pending_super_admin" } : item
          ),
        };
      });

      return { previousList, previousDetail };
    },
    onError: (err, newTodo, context) => {
      if (context?.previousList) {
        queryClient.setQueryData(storeIndentKeys.lists(), context.previousList);
      }
      if (context?.previousDetail) {
        queryClient.setQueryData(storeIndentKeys.detail(newTodo.id), context.previousDetail);
      }
    },
    onSettled: (_, __, variables) => {
      queryClient.invalidateQueries({ queryKey: storeIndentKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: storeIndentKeys.detail(variables.id),
      });
    },
  });
};

export const useCollegeAdminReject = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      storeIndentsApi.collegeAdminReject(id, data),
    onMutate: async ({ id }) => {
      await queryClient.cancelQueries({ queryKey: storeIndentKeys.lists() });
      await queryClient.cancelQueries({ queryKey: storeIndentKeys.detail(id) });

      const previousList = queryClient.getQueryData(storeIndentKeys.lists());
      const previousDetail = queryClient.getQueryData(storeIndentKeys.detail(id));

      queryClient.setQueriesData({ queryKey: storeIndentKeys.lists() }, (old: any) => {
        if (!old || !old.results) return old;
        return {
          ...old,
          results: old.results.map((item: any) =>
            item.id === id ? { ...item, status: "rejected" } : item
          ),
        };
      });

      return { previousList, previousDetail };
    },
    onError: (err, newTodo, context) => {
      if (context?.previousList) {
        queryClient.setQueryData(storeIndentKeys.lists(), context.previousList);
      }
      if (context?.previousDetail) {
        queryClient.setQueryData(storeIndentKeys.detail(newTodo.id), context.previousDetail);
      }
    },
    onSettled: (_, __, variables) => {
      queryClient.invalidateQueries({ queryKey: storeIndentKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: storeIndentKeys.detail(variables.id),
      });
    },
  });
};

// Super Admin Approvals
export const usePendingSuperAdminApprovals = (filters?: any) => {
  return useQuery({
    queryKey: [...storeIndentKeys.lists(), "pending_super_admin", filters],
    queryFn: () => storeIndentsApi.pendingSuperAdminApprovals(filters),
  });
};

export const useSuperAdminApprove = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      storeIndentsApi.superAdminApprove(id, data),
    onMutate: async ({ id }) => {
      await queryClient.cancelQueries({ queryKey: storeIndentKeys.lists() });
      await queryClient.cancelQueries({ queryKey: storeIndentKeys.detail(id) });

      const previousList = queryClient.getQueryData(storeIndentKeys.lists());
      const previousDetail = queryClient.getQueryData(storeIndentKeys.detail(id));

      queryClient.setQueriesData({ queryKey: storeIndentKeys.lists() }, (old: any) => {
        if (!old || !old.results) return old;
        return {
          ...old,
          results: old.results.map((item: any) =>
            item.id === id ? { ...item, status: "super_admin_approved" } : item
          ),
        };
      });

      return { previousList, previousDetail };
    },
    onError: (err, newTodo, context) => {
      if (context?.previousList) {
        queryClient.setQueryData(storeIndentKeys.lists(), context.previousList);
      }
      if (context?.previousDetail) {
        queryClient.setQueryData(storeIndentKeys.detail(newTodo.id), context.previousDetail);
      }
    },
    onSettled: (_, __, variables) => {
      queryClient.invalidateQueries({ queryKey: storeIndentKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: storeIndentKeys.detail(variables.id),
      });
    },
  });
};

export const useSuperAdminReject = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      storeIndentsApi.superAdminReject(id, data),
    onMutate: async ({ id }) => {
      await queryClient.cancelQueries({ queryKey: storeIndentKeys.lists() });
      await queryClient.cancelQueries({ queryKey: storeIndentKeys.detail(id) });

      const previousList = queryClient.getQueryData(storeIndentKeys.lists());
      const previousDetail = queryClient.getQueryData(storeIndentKeys.detail(id));

      queryClient.setQueriesData({ queryKey: storeIndentKeys.lists() }, (old: any) => {
        if (!old || !old.results) return old;
        return {
          ...old,
          results: old.results.map((item: any) =>
            item.id === id ? { ...item, status: "rejected" } : item
          ),
        };
      });

      return { previousList, previousDetail };
    },
    onError: (err, newTodo, context) => {
      if (context?.previousList) {
        queryClient.setQueryData(storeIndentKeys.lists(), context.previousList);
      }
      if (context?.previousDetail) {
        queryClient.setQueryData(storeIndentKeys.detail(newTodo.id), context.previousDetail);
      }
    },
    onSettled: (_, __, variables) => {
      queryClient.invalidateQueries({ queryKey: storeIndentKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: storeIndentKeys.detail(variables.id),
      });
    },
  });
};

// Material Issuance
export const useIssueMaterials = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      storeIndentsApi.issueMaterials(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: storeIndentKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: storeIndentKeys.detail(variables.id),
      });
    },
  });
};
