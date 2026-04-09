// src/components/Sidebar.tsx
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, Car, MessageCircle, Settings, LogOut, 
  PlusCircle, MapPinPlus, BookDashedIcon, X
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

// Added Props interface
export default function Sidebar({ 
  isOpen, 
  setIsOpenAction 
}: { 
  isOpen: boolean; 
  setIsOpenAction: (val: boolean) => void 
}) {
  const { logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    await logout();
    toast.success("Logout successful");
    router.push("/");
  };

  const menuItems = [
    { name: "Overview", href: "/owner/dashboard", icon: <LayoutDashboard size={20} /> },
    { name: "Fleet Assets", href: "/owner/my-vehicles", icon: <Car size={20} /> },
    { name: "Deploy Vehicle", href: "/owner/post", icon: <PlusCircle size={20} /> },
    { name: "Establish Hub", href: "/owner/addLocation", icon: <MapPinPlus size={20} /> },
    { name: "View Bookings", href: "/owner/bookings", icon: <BookDashedIcon size={20} /> },
    { name: "Operator Profile", href: "/profile", icon: <Settings size={20} /> }, 
    { name: "Chat", href: "/chat", icon: <MessageCircle size={20} /> }, 
  ];

  return (
    <>
      {/* Dark Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsOpenAction(false)}
        />
      )}

      {/* Main Sidebar Element */}
      <aside 
        className={`fixed md:static inset-y-0 left-0 z-50 w-72 bg-[#0d1f2f] border-r border-white/5 h-screen shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        {/* Brand Identity */}
        <div className="p-8 mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center text-white shadow-[0_0_15px_rgba(220,38,38,0.4)] group-hover:scale-110 transition-transform duration-300">
              <Car size={20} strokeWidth={3} />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black italic tracking-tighter text-white leading-none">
                SMART<span className="text-red-600">SAWARI</span>
              </span>
            </div>
          </div>
          
          {/* Mobile Close Button */}
          <button 
            onClick={() => setIsOpenAction(false)} 
            className="md:hidden text-gray-500 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Navigation Matrix */}
        <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
          <p className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-700 mb-4 ml-4">Main Navigation</p>
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpenAction(false)} // Close sidebar on click (mobile)
                className={`flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 group relative overflow-hidden ${
                  isActive 
                    ? "bg-red-600 text-white shadow-lg shadow-red-900/20 active-glow" 
                    : "text-gray-500 hover:bg-white/5 hover:text-white"
                }`}
              >
                {/* Active Indicator Glow */}
                {isActive && (
                  <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-transparent opacity-20" />
                )}
                
                <span className={`${isActive ? "text-white" : "text-gray-600 group-hover:text-red-500 transition-colors"}`}>
                  {item.icon}
                </span>
                <span className="text-[11px] font-black uppercase tracking-widest italic">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Tactical Sidebar Footer */}
        <div className="p-6 mt-auto border-t border-white/5 bg-[#0b1a27]/50">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-4 w-full px-5 py-4 text-gray-500 hover:bg-red-600 hover:text-white rounded-2xl transition-all duration-300 group"
          >
            <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-[11px] font-black uppercase tracking-[0.2em] italic">Disconnect</span>
          </button>
        </div>

        {/* Internal Style for the active glow effect */}
        <style jsx>{`
          .active-glow {
            box-shadow: inset 0 0 20px rgba(255, 255, 255, 0.1);
          }
        `}</style>
      </aside>
    </>
  );
}