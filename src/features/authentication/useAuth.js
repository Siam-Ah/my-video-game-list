import { useUser } from "./useUser";
import { useLogout } from "./useLogout";
import { useCallback } from "react";

export const useAuth = () => {
  const {
    user,
    isPending: isLoadingUser,
    isAuthenticated,
    isAdmin,
  } = useUser();

  const { logout, isPending: isLoggingOut } = useLogout();

  const handleLogout = useCallback(
    async (options = {}) => {
      await logout(undefined, {
        onSuccess: options.onSuccess,
        onError: options.onError,
      });
    },
    [logout]
  );

  return {
    user,
    isLoading: isLoadingUser,
    isAuthenticated,
    isAdmin,

    isLoggingOut,

    logout: handleLogout,

    currentRole: user?.profile?.role || null,
    isEmailVerified: !!user?.email_confirmed_at,

    session: user?.session,
  };
};
