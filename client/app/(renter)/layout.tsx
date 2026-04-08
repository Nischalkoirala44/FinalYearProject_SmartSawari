"use client";

import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function RenterLayout({ children }: { children: React.ReactNode }) {
  
  return (
    <ProtectedRoute allowedRoles={["renter"]}>
      <div className="min-h-screen flex flex-col bg-[#0e1f2e]">
        <Navbar />
        <main className="flex-1 flex flex-col w-full overflow-hidden">
            {children}
        </main>
        <Footer />
      </div>
    </ProtectedRoute>
  );
}