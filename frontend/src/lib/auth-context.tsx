"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, setStoredTokens, removeStoredTokens, getStoredToken } from "./api";
import { MockUser, MOCK_USERS } from "./mock-data";

interface AuthContextType {
  user: MockUser | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  quickSwitch: (roleKey: "owner" | "dev" | "qa") => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<MockUser | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();

  // Load and verify user from real API on initial render
  useEffect(() => {
    let isMounted = true;

    async function initAuth() {
      const token = getStoredToken();
      if (token) {
        try {
          const profile = await api.auth.getMe();
          if (isMounted && profile) {
            const formattedUser: MockUser = {
              id: profile.id,
              name: profile.name,
              email: profile.email,
              avatar: profile.avatar || profile.name.slice(0, 2).toUpperCase(),
              role: profile.role || "USER",
              jobTitle: profile.role === "ADMIN" ? "Chủ dự án (Owner)" : "Thành viên dự án",
            };
            setUser(formattedUser);
            setIsLoggedIn(true);
            setIsLoading(false);
            return;
          }
        } catch {
          removeStoredTokens();
          if (isMounted) {
            setUser(null);
            setIsLoggedIn(false);
          }
        }
      } else {
        if (isMounted) {
          setUser(null);
          setIsLoggedIn(false);
        }
      }
      if (isMounted) {
        setIsLoading(false);
      }
    }

    initAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api.auth.login({
      email: email.trim(),
      password: password,
    });

    setStoredTokens(res.accessToken, res.refreshToken);
    const formattedUser: MockUser = {
      id: res.user.id,
      name: res.user.name,
      email: res.user.email,
      avatar: res.user.avatar || res.user.name.slice(0, 2).toUpperCase(),
      role: res.user.role || "USER",
      jobTitle: res.user.role === "ADMIN" ? "Chủ dự án (Owner)" : "Thành viên dự án",
    };

    setUser(formattedUser);
    setIsLoggedIn(true);
  };

  const register = async (name: string, email: string, password: string) => {
    const res = await api.auth.register({
      name: name.trim(),
      email: email.trim(),
      password,
    });

    setStoredTokens(res.accessToken, res.refreshToken);
    const formattedUser: MockUser = {
      id: res.user.id,
      name: res.user.name,
      email: res.user.email,
      avatar: res.user.avatar || res.user.name.slice(0, 2).toUpperCase(),
      role: res.user.role || "USER",
      jobTitle: "Thành viên dự án",
    };

    setUser(formattedUser);
    setIsLoggedIn(true);
  };

  const logout = async () => {
    try {
      await api.auth.logout();
    } catch {
      // ignore
    } finally {
      removeStoredTokens();
      setIsLoggedIn(false);
      setUser(null);
      router.push("/login");
    }
  };

  const quickSwitch = async (roleKey: "owner" | "dev" | "qa") => {
    const emailMap = {
      owner: "chien@example.com",
      dev: "an@example.com",
      qa: "binh@example.com",
    };
    const targetEmail = emailMap[roleKey] || "chien@example.com";

    try {
      const res = await api.auth.login({
        email: targetEmail,
        password: "password123",
      });
      setStoredTokens(res.accessToken, res.refreshToken);

      const formattedUser: MockUser = {
        id: res.user.id,
        name: res.user.name,
        email: res.user.email,
        avatar: res.user.avatar || res.user.name.slice(0, 2).toUpperCase(),
        role: res.user.role || (roleKey === "owner" ? "ADMIN" : "USER"),
        jobTitle:
          roleKey === "owner"
            ? "Chủ dự án / Tech Lead"
            : roleKey === "dev"
            ? "Frontend Developer"
            : "QA / Test Engineer",
      };

      setUser(formattedUser);
      setIsLoggedIn(true);
      window.dispatchEvent(new Event("ftodo_permissions_updated"));
      window.dispatchEvent(new Event("storage"));
    } catch {
      // Fallback
      const targetUser = MOCK_USERS[roleKey] || MOCK_USERS.owner;
      setUser(targetUser);
      setIsLoggedIn(true);
      window.dispatchEvent(new Event("ftodo_permissions_updated"));
      window.dispatchEvent(new Event("storage"));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoggedIn,
        isLoading,
        login,
        register,
        logout,
        quickSwitch,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
