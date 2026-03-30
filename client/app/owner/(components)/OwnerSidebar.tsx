// src/components/Sidebar.tsx
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Car, Bell, Settings, LogOut, PlusCircle, MapPinPlus } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useState } from "react";

const Sidebar = () => {
  const { user, logout, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

      const handleLogout = async () => {
        await logout();
        toast.success("Logged out successfully!");
        router.push("/");
        setMobileMenuOpen(false);
    };

  const menuItems = [
    { name: "Overview", href: "/owner/dashboard", icon: <LayoutDashboard size={22} /> },
    { name: "My Vehicles", href: "/owner/my-vehicles", icon: <Car size={22} /> },
    { name: "Add Vehicle", href: "/owner/post", icon: <PlusCircle size={22} /> },
    { name: "Add Locations", href: "/owner/addLocation", icon: <MapPinPlus size={22} /> },
    { name: "Notifications", href: "/owner/notifications", icon: <Bell size={22} /> },
    { name: "Settings", href: "/profile", icon: <Settings size={22} /> }, 
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200">
      <div className="p-6 flex items-center gap-2">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">S</div>
        <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          Smart Sawari
        </span>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-1">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive 
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-200" 
                  : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              {item.icon}
              <span className="font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-100">
        <button className="flex items-center gap-3 w-full px-4 py-3 text-gray-500 hover:bg-red-50 hover:text-red-600 rounded-xl transition-colors">
          <LogOut size={22} />
          <span className="font-medium" onClick={handleLogout}>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;