import { logout as logoutApi } from "../api/auth";
import { useAuthStore } from "../store/auth";

export const useAuth = () => {
  const { user, token, isAuthenticated, setUser, setToken, reset } =
    useAuthStore();

  const logout = async () => {
    try {
      await logoutApi();
    } finally {
      reset();
    }
  };

  return {
    user,
    token,
    isAuthenticated,
    setUser,
    setToken,
    isLoading: false,
    logout,
  };
};
