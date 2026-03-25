"use client";
import { useState } from "react";
import AdminSidebar from "./(components)/Sidebar";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <div className="flex h-screen w-full bg-gray-50 overflow-hidden">
        {/* Changed onSetOpen to setIsOpenAction */}
        <AdminSidebar isOpen={sidebarOpen} setIsOpenAction={setSidebarOpen} />
        
        <div className="flex flex-col flex-1 min-w-0">
          
          
          <main className="flex-1 overflow-y-auto p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}