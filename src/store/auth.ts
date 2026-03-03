import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { AuthUser } from "../types";

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  setUser: (user: AuthUser | null) => void;
  setToken: (token: string | null) => void;
  reset: () => void;
}

const getInitialState = (): Pick<AuthState, "user" | "token" | "isAuthenticated"> => {
  try {
    const token = localStorage.getItem('access_token');
    const userStr = localStorage.getItem('kumss_user');
    let user: AuthUser | null = null;

    if (userStr) {
      user = JSON.parse(userStr);
    }

    return {
      user,
      token,
      isAuthenticated: !!token,
    };
  } catch {
    return {
      user: null,
      token: null,
      isAuthenticated: false,
    };
  }
};

const initialState = getInitialState();

export const useAuthStore = create<AuthState>()(
  devtools((set) => ({
    ...initialState,
    setUser: (user) =>
      set((state) => ({
        ...state,
        user,
      })),
    setToken: (token) => {
      // Store token in localStorage for backward compatibility with fetch API calls
      if (token) {
        localStorage.setItem('access_token', token);
      } else {
        localStorage.removeItem('access_token');
      }

      return set((state) => ({
        ...state,
        token,
        isAuthenticated: Boolean(token),
      }));
    },
    reset: () => {
      // Clear all auth-related data from localStorage
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('kumss_auth_token');
      localStorage.removeItem('kumss_user_id');
      localStorage.removeItem('kumss_college_id');
      localStorage.removeItem('kumss_user');
      localStorage.removeItem('auth-storage');
      return set(() => ({
        user: null,
        token: null,
        isAuthenticated: false,
      }));
    },
  }))
);
