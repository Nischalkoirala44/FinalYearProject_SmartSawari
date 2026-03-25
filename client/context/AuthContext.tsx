"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { loginUser, logoutUser, registerUser } from "../services/Auth";
import { User } from "../types/User";

// Define the context type
export interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<any>;
  register: (
    name: string,
    email: string,
    mobile: string,
    password: string,
    role: "owner" | "renter"
  ) => Promise<any>;
  logout: () => Promise<void>;
  updateUser: (fields: Partial<User>) => void;
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null); // JWT token
  const [loading, setLoading] = useState(true);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

  useEffect(() => {
    // Load user and token from localStorage if exists
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token");

    if (storedUser) setUser(JSON.parse(storedUser));
    if (storedToken) setToken(storedToken);

    setLoading(false);
  }, []);

  // Login function
  const login = async (email: string, password: string, rememberMe: boolean = false) => {
    const res = await loginUser({ email, password, rememberMe });

    if (res.user) {
      setUser(res.user);
      localStorage.setItem("user", JSON.stringify(res.user));

      if (res.token) {
        setToken(res.token);
        localStorage.setItem("token", res.token);
      }
    }

    return res;
  };

  const updateUser = (updatedFields: Partial<User>) => {
    setUser((prev) => (prev ? { ...prev, ...updatedFields } : prev));
  };

  // Register function
  const register = async (
    name: string,
    email: string,
    mobile: string,
    password: string,
    role: "owner" | "renter"
  ) => {
    const res = await registerUser({ name, email, mobile, password, role });
    return res;
  };

  // Logout function
  const logout = async () => {
    await logoutUser();
    setUser(null);
    setToken(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
