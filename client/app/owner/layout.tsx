// src/app/dashboard/layout.tsx
import Sidebar from "./(components)/OwnerSidebar";
import Header from "./(components)/OwnerHeader";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen w-full bg-gray-50 overflow-hidden">
      {/* Fixed Sidebar */}
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
  );
}