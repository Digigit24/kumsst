/**
 * Authentication Service for KUMSS ERP
 * Handles all authentication-related API calls
 */

import { API_ENDPOINTS, buildApiUrl, getDefaultHeaders } from '../config/api.config';
import type { ApiError, LoginCredentials, LoginResponse, User } from '../types/auth.types';

/**
 * Local storage keys
 */
const STORAGE_KEYS = {
  USER: 'kumss_user',
  IS_AUTHENTICATED: 'kumss_is_authenticated',
  AUTH_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
} as const;

/**
 * Get stored auth token
 */
export const getAuthToken = (): string | null => {
  return localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
};

/**
 * Fetch full user details from /api/v1/accounts/users/me/
 */
const fetchUserDetails = async (): Promise<User> => {
  const token = getAuthToken();
  const headers = new Headers();
  const defaultHeaders = getDefaultHeaders();
  Object.entries(defaultHeaders).forEach(([key, value]) => {
    headers.set(key, value);
  });

  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(buildApiUrl(API_ENDPOINTS.users.me), {
    method: 'GET',
    headers,
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Failed to fetch user details');
  }

  const userData = await response.json();

  return {
    id: userData.id,
    username: userData.username,
    email: userData.email,
    firstName: userData.first_name,
    lastName: userData.last_name,
    fullName: userData.full_name,
    isStaff: userData.is_staff,
    isSuperuser: userData.is_superuser,
    isActive: userData.is_active,
    userType: userData.user_type,
    college: userData.college,
    dateJoined: userData.date_joined || userData.created_at,
    lastLogin: userData.last_login,
    avatar: userData.profile_photo || userData.avatar || null,
  };
};

/**
 * Login user with credentials
 */
export const loginUser = async (credentials: LoginCredentials): Promise<LoginResponse> => {
  try {
    // Build headers properly
    const headers = new Headers();
    const defaultHeaders = getDefaultHeaders();
    Object.entries(defaultHeaders).forEach(([key, value]) => {
      headers.set(key, value);
    });

    const response = await fetch(buildApiUrl(API_ENDPOINTS.auth.login), {
      method: 'POST',
      headers,
      credentials: 'include', // Important for session cookies
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw {
        message: (typeof errorData.detail === 'string' ? errorData.detail : typeof errorData.message === 'string' ? errorData.message : typeof errorData.error === 'string' ? errorData.error : 'Login failed'),
        status: response.status,
        detail: errorData.detail,
        errors: errorData,
      } as ApiError;
    }

    // Get response data (could be token auth or session auth)
    const data = await response.json().catch(() => ({}));

    console.log('[loginUser] Login response:', data);

    // Store auth token if present (JWT or DRF Token)
    /*
     * Support for JWT (access/refresh) and legacy Token (key/token)
     */
    const accessToken = data.access || data.key || data.token;
    const refreshToken = data.refresh;

    if (accessToken) {
      localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, accessToken);
      console.log('[loginUser] Access Token stored in localStorage');

      if (refreshToken) {
        localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
      }
    } else {
      console.warn('[loginUser] No token found in response! (Using session auth?)', data);
    }

    // Fetch full user details from /api/v1/accounts/users/me/
    let user: User;
    try {
      user = await fetchUserDetails();
      console.log('[loginUser] User details fetched:', user);
    } catch (error) {
      console.warn('[loginUser] Failed to fetch user details, using login response data');
      // Fallback to login response data
      user = data.user || {
        id: data.id || 0,
        username: credentials.username,
        email: data.email || '',
        firstName: data.first_name || data.firstName,
        lastName: data.last_name || data.lastName,
        fullName: data.full_name || data.fullName,
        isStaff: data.is_staff || data.isStaff,
        isSuperuser: data.is_superuser || data.isSuperuser,
        isActive: data.is_active !== undefined ? data.is_active : true,
        userType: data.user_type,
        college: data.college,
      };
    }

    // Store auth state in localStorage
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    localStorage.setItem(STORAGE_KEYS.IS_AUTHENTICATED, 'true');

    return {
      success: true,
      user,
      message: 'Login successful',
    };
  } catch (error) {
    // Clear any stored auth data on error
    clearAuthData();

    if ((error as ApiError).message) {
      throw error;
    }

    throw {
      message: 'Network error. Please check your connection.',
      status: 0,
    } as ApiError;
  }
};

/**
 * Logout user
 */
export const logoutUser = async (): Promise<void> => {
  try {
    const token = getAuthToken();
    // Build headers properly
    const headers = new Headers();
    const defaultHeaders = getDefaultHeaders();
    Object.entries(defaultHeaders).forEach(([key, value]) => {
      headers.set(key, value);
    });

    if (token && !headers.has('Authorization')) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    await fetch(buildApiUrl(API_ENDPOINTS.auth.logout), {
      method: 'POST',
      headers,
      credentials: 'include',
    });
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    // Always clear local auth data
    clearAuthData();
  }
};

/**
 * Check if user is authenticated (verify session)
 */
export const checkAuthentication = async (): Promise<User | null> => {
  try {
    // First check localStorage
    const storedUser = localStorage.getItem(STORAGE_KEYS.USER);
    const isAuthenticated = localStorage.getItem(STORAGE_KEYS.IS_AUTHENTICATED);

    if (!storedUser || isAuthenticated !== 'true') {
      return null;
    }

    // Verify session with backend (optional - depends on your API)
    // You might have a /api/auth/me or /api/auth/verify endpoint
    // For now, we'll trust the localStorage if cookies are present

    return JSON.parse(storedUser) as User;
  } catch (error) {
    console.error('Auth check error:', error);
    clearAuthData();
    return null;
  }
};

/**
 * Get current user from localStorage
 */
export const getCurrentUser = (): User | null => {
  try {
    const storedUser = localStorage.getItem(STORAGE_KEYS.USER);
    const isAuthenticated = localStorage.getItem(STORAGE_KEYS.IS_AUTHENTICATED);

    if (!storedUser || isAuthenticated !== 'true') {
      return null;
    }

    return JSON.parse(storedUser) as User;
  } catch (error) {
    console.error('Get current user error:', error);
    return null;
  }
};

/**
 * Clear authentication data from localStorage
 */
export const clearAuthData = (): void => {
  // Clear all localStorage data on logout
  localStorage.clear();
};

/**
 * Check if user is authenticated (synchronous check)
 */
export const isAuthenticated = (): boolean => {
  return localStorage.getItem(STORAGE_KEYS.IS_AUTHENTICATED) === 'true';
};
