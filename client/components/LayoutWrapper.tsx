"use client";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Sidebar from "@/app/owner/(components)/OwnerSidebar";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react"; // Assuming you have lucide-react

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      console.log("LayoutWrapper: No user, redirecting to login");
      router.push("/login");
    }
  }, [user, loading, router]);

  // Handle Loading State
  if (loading) {
    return (
      <div className="h-screen w-full bg-[#0a1620] flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-red-600" size={40} />
        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">
          Authenticating Session...
        </span>
      </div>
    );
  }

  // Return nothing if no user
  if (!user) return null;

  // OWNER LAYOUT
  if (user.role === "owner") {
    return (
      <div className="flex h-screen w-full bg-[#0a1620] overflow-hidden">
        <Sidebar /> 
        <div className="flex flex-col flex-1 min-w-0 overflow-y-auto p-8 custom-scrollbar">
          {children}
        </div>
      </div>
    );
  }

  // RENTER LAYOUT (Default fallback)
  return (
    <div className="flex flex-col min-h-screen bg-[#0a1620]">
      <Navbar />
      <main className="flex-1 w-full max-w-7xl mx-auto px-6 py-10">
         {children}
      </main>
      <Footer />
    </div>
  );
}