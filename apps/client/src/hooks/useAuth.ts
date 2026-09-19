"use client";

import { useMe } from "./useUser";

export const useAuth = () => {
  const { data: user, isLoading, isError } = useMe();
  return {
    user,
    isLoading,
    isAuthenticated: !!user && !isError,
  };
};
