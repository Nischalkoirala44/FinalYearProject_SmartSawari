// components/AdminSidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Car, CheckCircle, LogOut, X, Monitor, CreditCard, Wallet } from "lucide-react";
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
    { name: "Payout Queue", href: "/admin/payouts", icon: CreditCard },
    { name: "Withdrawals", href: "/admin/withdraw", icon: Wallet },
    { name: "System Monitor", href: "/admin/monitor", icon: Monitor },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsOpenAction(false)}
        />
      )}

      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 text-slate-600 transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="bg-red-600 p-1.5 rounded-lg">
              <Car className="w-6 h-6 text-white" />
            </div>
            <span className="font-black text-slate-900 uppercase tracking-tighter text-lg">
              Smart Sawari
            </span>
          </div>
          <button onClick={() => setIsOpenAction(false)} className="lg:hidden text-slate-400 hover:text-slate-600 transition">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1.5">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] px-4 mb-4">
            Main Menu
          </p>
          
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all duration-200 ${
                  isActive 
                    ? "bg-red-50 text-red-600 shadow-sm shadow-red-100" 
                    : "hover:bg-slate-50 text-slate-500 hover:text-slate-900"
                }`}
              >
                <item.icon className={`w-5 h-5 ${isActive ? "text-red-600" : "text-slate-400"}`} />
                {item.name}
              </Link>
            );
          })}
          
          <div className="pt-4 mt-4 border-t border-slate-100">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 text-slate-500 hover:text-red-600 font-bold text-sm rounded-xl transition-all"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </button>
          </div>
        </nav>

        {/* Footer Info */}
        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-slate-100 bg-slate-50/50">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Logged in as Admin
          </p>
          <p className="text-[9px] text-slate-400 mt-1 uppercase tracking-tighter font-medium">
            © 2026 Smart Sawari Platform
          </p>
        </div>
      </aside>
    </>
  );
}