// src/app/dashboard/layout.tsx
import Sidebar from "./(components)/OwnerSidebar";
import Header from "./(components)/OwnerHeader";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (

    <ProtectedRoute allowedRoles={["owner"]}>
   
    <div className="flex h-screen w-full bg-[#0b1a27] overflow-hidden">
      {/* Sidebar */}
      <Sidebar />

      <div className="flex flex-col flex-1 min-w-0">
        {/* Top Navigation Bar */}
        <Header />

        {/* Dynamic Page Content */}
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