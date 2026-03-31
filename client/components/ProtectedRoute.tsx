"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import { Spinner } from "./ui/spinner";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];  
}

export default function ProtectedRoute({
  children,
  allowedRoles,
}: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        console.log("ProtectedRoute: No user, redirecting to login");
        router.push("/login");
        return;
      }

      if (allowedRoles && !allowedRoles.includes(user.role)) {
        router.push("/unauthorized");
        return;
      }
    }
  }, [user, loading, router, allowedRoles]);

  if (loading) return <Spinner />;
  if (!user) return null;
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return null; 
  }

  return <>{children}</>;
}
