"use client";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Sidebar from "@/app/owner/(components)/OwnerSidebar";

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  // 1. OWNER/ADMIN LAYOUT (Professional Dashboard)
  if (user?.role === "owner") {
    return (
      <div className="flex h-screen w-full bg-[#0a1620] overflow-hidden">
        <Sidebar /> 
        <div className="flex flex-col flex-1 min-w-0 overflow-y-auto p-8 custom-scrollbar">
          {children}
        </div>
      </div>
    );
  }

  // 2. RENTER LAYOUT (Cinematic/Dark Mode)
  if (user?.role === "renter") {
    return (
      <div className="flex flex-col min-h-screen bg-[#0a1620]">
        <Navbar />
        {/* Removed the white rounded-[2.5rem] box and the gray-50 background */}
        <main className="flex-1 w-full max-w-7xl mx-auto px-6 py-10">
           {children}
        </main>
        <Footer />
      </div>
    );
  }

  // 3. FALLBACK
  return (
    <div className="h-screen w-full flex items-center justify-center bg-[#0a1620] text-white">
      <div className="text-center">
        <h2 className="text-4xl font-black uppercase tracking-widest mb-4">404</h2>
        <p className="text-gray-500 font-bold uppercase tracking-tighter">System Access Denied</p>
      </div>
    </div>
  );
}