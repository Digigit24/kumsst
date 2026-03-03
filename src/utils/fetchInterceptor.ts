/**
 * Global Fetch Interceptor
 * Handles 401 errors and automatic logout
 */

let isRedirecting = false;

/**
 * Handle authentication failure
 */
const handleAuthFailure = () => {
  if (isRedirecting) return;

  // If we are already on the login page, don't trigger a redirect loop
  if (window.location.pathname.includes("/login")) return;

  isRedirecting = true;

  // Clear all auth data
  localStorage.removeItem("kumss_user");
  localStorage.removeItem("kumss_user_id");
  localStorage.removeItem("kumss_college_id");
  localStorage.removeItem("kumss_is_authenticated");
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("kumss_auth_token");
  localStorage.removeItem("auth-storage");

  // Redirect to login
  window.location.href = "/login";
};

/**
 * Setup global fetch interceptor
 */
export const setupFetchInterceptor = () => {
  const originalFetch = window.fetch;

  window.fetch = async (...args) => {
    try {
      const response = await originalFetch(...args);

      // Check for 401 Unauthorized
      if (response.status === 401) {
        const requestInfo = args[0];
        const url =
          typeof requestInfo === "string"
            ? requestInfo
            : requestInfo instanceof URL
              ? requestInfo.toString()
              : requestInfo.url;

        // Don't logout on login endpoint failures
        if (!url.includes("/auth/login/")) {
          handleAuthFailure();
        }
      }

      return response;
    } catch (error) {
      throw error;
    }
  };

};
