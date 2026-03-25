"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import PublicLanding from "@/components/LandingPage";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If user is logged in, redirect them to their specific dashboard
    if (!loading && user) {
      if (user.role === "admin") {
        router.push("/admin/dashboard");
      } else if (user.role === "owner") {
        router.push("/owner/dashboard");
      }
      // Note: We usually keep Renters on the homepage so they can see vehicles
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
          <p className="text-xs font-black uppercase tracking-widest text-gray-400">Smart Sawari</p>
        </div>
      </div>
    );
  }

  // If user is a Renter or Guest, show the Landing Page
  return (
    <>
      <Navbar />
      <PublicLanding />
      <Footer />
    </>
  );
}