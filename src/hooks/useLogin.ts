import { login } from "@/api/auth";
import { LoginRequest } from "@/types";
import type { User } from "@/types/auth.types";
import { extractEnabledPermissions } from "@/utils/permissions";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./useAuth";

export const useLogin = () => {
  const { setToken, setUser } = useAuth();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (data: LoginRequest) => login(data),
    onSuccess: (response) => {
      // Store token
      const accessToken = response?.access || response?.key;
      const refreshToken = response?.refresh;

      if (accessToken) {
        setToken(accessToken);
        // Store in localStorage as per new JWT requirement
        localStorage.setItem("access_token", accessToken);
        if (refreshToken) {
          localStorage.setItem("refresh_token", refreshToken);
        }

        // Legacy support (optional, can be removed if specific cleanup is desired)
        localStorage.setItem("kumss_auth_token", accessToken);
        localStorage.setItem("kumss_user_id", response.user?.id || "");

        // Store college_id for forms
        if (response.user?.college) {
          localStorage.setItem("kumss_college_id", String(response.user.college));
        }
      }

      // Process and store complete user data
      if (response?.user) {
        // Extract flattened permissions from nested structure
        const flatPermissions = extractEnabledPermissions(response.user_permissions);

        // Build comprehensive user object with all data
        const fullUser: User = {
          ...response.user,
          // Add permissions
          user_permissions: response.user_permissions,
          permissions: flatPermissions,
          // Add roles
          user_roles: response.user_roles,
          // Add college info
          accessible_colleges: response.accessible_colleges,
          tenant_ids: response.tenant_ids,
          college_id: response.college_id,
        };

        // Store in auth context
        setUser(fullUser);

        // CRITICAL: Store complete data in localStorage for API config and permissions
        localStorage.setItem("kumss_user", JSON.stringify(fullUser));

        // Redirect based on user type
        const redirectPath = fullUser.user_type === 'accountant' ? '/income-dashboard' : '/dashboard';
        navigate(redirectPath, { replace: true });
      } else {
        // Fallback if user data is not available
        navigate("/dashboard", { replace: true });
      }
    },
  });
};
