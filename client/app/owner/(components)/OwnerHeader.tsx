"use client";

import { useAuth } from "../../../context/AuthContext";
import { Bell} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const Header = () => {
  const { user } = useAuth();

  const getInitial = () => {
    if (!user?.name) return "U";
    return user.name.charAt(0).toUpperCase();
  };
  
  const profileImageUrl = user?.profileImage && user.profileImage.trim() !== "" 
    ? user.profileImage.replace(/"/g, "") 
    : undefined;

  return (
    <header className="h-20 bg-[#0d1f2f] border-b border-white/5 flex items-center justify-between px-8 sticky top-0 z-50 backdrop-blur-md bg-opacity-80">
      
      {/* System Status / Telemetry */}
      <div className="flex-1 hidden md:flex items-center gap-6">
        <div className="flex items-center gap-2">
        </div>
        <div className="flex items-center gap-2 text-gray-600">
        </div>
      </div>

      {/* Action Icons & User Profile Section */}
      <div className="flex items-center gap-6">
        {/* Notifications */}
        <button className="relative p-2 text-gray-500 hover:text-red-600 transition-colors group">
          <Bell size={20} className="group-hover:rotate-12 transition-transform" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-600 rounded-full border-2 border-[#0d1f2f]" />
        </button>

        <div className="h-8 w-[1px] bg-white/5" />

        {/* User Identity */}
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-black text-white italic uppercase tracking-tighter leading-tight">
              {user?.name || "Guest Operator"}
            </p>
            <div className="flex items-center justify-end gap-1.5 mt-0.5">
               <p className="text-[9px] text-red-600 uppercase font-black tracking-[0.2em]">
                {user?.role || "Infiltrator"}
              </p>
            </div>
          </div>
          
          {/* Avatar Area */}
          <div className="relative group cursor-pointer">
            {/* Outer Glow Ring */}
            <div className="absolute -inset-1 rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity blur-sm" />
            
            <Avatar className="h-11 w-11 rounded-2xl border border-white/10 shadow-2xl transition-all duration-500 group-hover:scale-105 group-hover:border-red-600/50">
              <AvatarImage 
                src={profileImageUrl} 
                alt={user?.name || "User"} 
                className="object-cover"
              />
              <AvatarFallback className="bg-red-600 text-white font-black text-xs italic tracking-tighter rounded-2xl">
                {getInitial()}
              </AvatarFallback>
            </Avatar>

            {/* Status Indicator */}
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-[#0d1f2f] rounded-full flex items-center justify-center border border-white/5">
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;