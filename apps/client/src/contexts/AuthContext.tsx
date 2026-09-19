"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import axiosInstance from "@/lib/axiosInstance";
import { redirectToLogout } from "@/lib/auth";

interface User {
  user_id: string;
  user_name: string;
  email: string;
  user_email?: string;
  profile_pic?: string;
  atlassian_connected?: boolean;
  slack_connected?: boolean;
  calendar_connected?: boolean;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function normalizeUser(raw: any): User | null {
  if (!raw) return null;
  return {
    ...raw,
    email: raw.email || raw.user_email || "",
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUser = async () => {
    try {
      const { data } = await axiosInstance.get("/api/v1/users/me");
      setUser(normalizeUser(data.data));
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    axiosInstance
      .get("/api/v1/users/me")
      .then(({ data }) => {
        if (isMounted) setUser(normalizeUser(data.data));
      })
      .catch(() => {
        if (isMounted) setUser(null);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const logout = () => {
    redirectToLogout();
  };

  const refreshUser = async () => {
    await fetchUser();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
