"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MockUser, MOCK_USERS } from "./mock-data";

interface AuthContextType {
  user: MockUser;
  isLoggedIn: boolean;
  login: (email: string, password?: string) => Promise<void>;
  logout: () => void;
  quickSwitch: (roleKey: "owner" | "dev" | "qa") => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<MockUser>(MOCK_USERS.owner);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(true);
  const router = useRouter();

  // Load user from localStorage on initial render
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedUser = localStorage.getItem("ftodo_mock_user");
      const loggedInStatus = localStorage.getItem("ftodo_mock_logged_in");

      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser));
        } catch {
          setUser(MOCK_USERS.owner);
        }
      } else {
        // Default to owner so opening localhost:3000 shows working app immediately
        setUser(MOCK_USERS.owner);
        localStorage.setItem("ftodo_mock_user", JSON.stringify(MOCK_USERS.owner));
        localStorage.setItem("ftodo_mock_logged_in", "true");
      }

      if (loggedInStatus === "false") {
        setIsLoggedIn(false);
      } else {
        setIsLoggedIn(true);
      }
    }
  }, []);

  const login = async (email: string) => {
    let matchedUser = Object.values(MOCK_USERS).find(
      (u) => u.email.toLowerCase() === email.toLowerCase()
    );

    if (!matchedUser) {
      matchedUser = {
        id: "u-" + Date.now(),
        name: email.split("@")[0],
        email: email,
        avatar: email.slice(0, 2).toUpperCase(),
        role: "USER",
        jobTitle: "Thành viên dự án",
      };
    }

    setUser(matchedUser);
    setIsLoggedIn(true);
    if (typeof window !== "undefined") {
      localStorage.setItem("ftodo_mock_user", JSON.stringify(matchedUser));
      localStorage.setItem("ftodo_mock_logged_in", "true");
    }
    router.push("/");
  };

  const logout = () => {
    setIsLoggedIn(false);
    if (typeof window !== "undefined") {
      localStorage.setItem("ftodo_mock_logged_in", "false");
    }
    router.push("/login");
  };

  const quickSwitch = (roleKey: "owner" | "dev" | "qa") => {
    const targetUser = MOCK_USERS[roleKey] || MOCK_USERS.owner;
    setUser(targetUser);
    setIsLoggedIn(true);
    if (typeof window !== "undefined") {
      localStorage.setItem("ftodo_mock_user", JSON.stringify(targetUser));
      localStorage.setItem("ftodo_mock_logged_in", "true");
      window.dispatchEvent(new Event("ftodo_permissions_updated"));
      window.dispatchEvent(new Event("storage"));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoggedIn,
        login,
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
