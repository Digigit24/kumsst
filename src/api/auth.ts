import apiClient from "./apiClient";
import {
  AuthResponse,
  AuthUser,
  LoginRequest,
  LoginResponse,
  PasswordChangeRequest,
  PasswordResetConfirmRequest,
  PasswordResetRequest,
} from "../types";
import { API_ENDPOINTS, API_BASE_URL } from "@/config/api.config";

export const login = async (data: LoginRequest): Promise<LoginResponse> => {
  const response = await apiClient.post<LoginResponse>(
    API_ENDPOINTS.auth.login,
    data
  );
  return response.data;
};

export const logout = async (): Promise<AuthResponse> => {
  const response = await apiClient.post<AuthResponse>(
    API_ENDPOINTS.auth.logout,
    {}
  );
  return response.data;
};

export const passwordChange = async (
  data: PasswordChangeRequest
): Promise<AuthResponse> => {
  const response = await apiClient.post<AuthResponse>(
    API_ENDPOINTS.auth.passwordChange,
    data
  );
  return response.data;
};

export const passwordReset = async (
  data: PasswordResetRequest
): Promise<AuthResponse> => {
  const response = await apiClient.post<AuthResponse>(
    API_ENDPOINTS.auth.passwordReset,
    data
  );
  return response.data;
};

export const passwordResetConfirm = async (
  data: PasswordResetConfirmRequest
): Promise<AuthResponse> => {
  const response = await apiClient.post<AuthResponse>(
    API_ENDPOINTS.auth.passwordResetConfirm,
    data
  );
  return response.data;
};

// Fetch user from /api/v1/auth/user/ (basic auth user)
export const fetchAuthUser = async (): Promise<AuthUser> => {
  const response = await apiClient.get<AuthUser>(API_ENDPOINTS.auth.user);
  return response.data;
};

// Fetch full user details from /api/v1/accounts/users/me/ (includes college)
// This call bypasses apiClient to avoid sending X-College-ID header (which we don't have yet)
export const fetchUserDetails = async (): Promise<any> => {
  const token = localStorage.getItem('access_token');

  const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.users.me}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
      // Intentionally NOT including X-College-ID header
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(typeof errorData.detail === 'string' ? errorData.detail : typeof errorData.message === 'string' ? errorData.message : typeof errorData.error === 'string' ? errorData.error : 'Failed to fetch user details');
  }

  return await response.json();
};

export const updateAuthUser = async (data: AuthUser): Promise<AuthUser> => {
  const response = await apiClient.put<AuthUser>(
    API_ENDPOINTS.auth.user,
    data
  );
  return response.data;
};

export const patchAuthUser = async (data: Partial<AuthUser>): Promise<AuthUser> => {
  const response = await apiClient.patch<AuthUser>(
    API_ENDPOINTS.auth.user,
    data
  );
  return response.data;
};

/**
 * Helper functions for Chat API
 */

/**
 * Get stored auth token
 */
export const getAuthToken = (): string | null => {
  return localStorage.getItem('access_token');
};

/**
 * Get current user from localStorage
 */
export const getCurrentUser = (): any => {
  try {
    const userStr = localStorage.getItem('kumss_user');
    return userStr ? JSON.parse(userStr) : null;
  } catch {
    return null;
  }
};

/**
 * Get college ID
 */
export const getCollegeId = (): number | null => {
  const collegeId = localStorage.getItem('kumss_college_id');
  return collegeId ? parseInt(collegeId, 10) : null;
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = (): boolean => {
  const token = getAuthToken();
  return !!token;
};