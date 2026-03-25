"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Car, CheckCircle, LogOut, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export default function AdminSidebar({ 
  isOpen, 
  setIsOpenAction 
}: { 
  isOpen: boolean; 
  setIsOpenAction: (val: boolean) => void 
}) {
  const pathname = usePathname();
  const { logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const navItems = [
    { name: "Verifications", href: "/admin/dashboard", icon: CheckCircle },
    { name: "Payout Queue", href: "/admin/payouts", icon: Car },
    { name: "Withdrawals", href: "/admin/withdraw", icon: Car },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsOpenAction(false)}
        />
      )}

      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-gray-900 text-white transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <div className="flex items-center gap-2 font-bold text-xl">
            <Car className="w-8 h-8 text-blue-400" />
            <span>Admin Panel</span>
          </div>
          <button onClick={() => setIsOpenAction(false)} className="lg:hidden text-gray-400">
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="p-4 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                pathname === item.href ? "bg-blue-600 text-white" : "hover:bg-gray-800 text-gray-300"
              }`}
            >
              <item.icon className="w-5 h-5" />
              {item.name}
            </Link>
          ))}
          
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-900/20 text-gray-300 hover:text-red-400 rounded-lg transition"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-gray-800 text-xs text-gray-500">
          © 2025 Vehicle Verification
        </div>
      </aside>
    </>
  );
}