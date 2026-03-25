"use client";

import { useAuth } from "../../../context/AuthContext";
import { ChevronDown } from "lucide-react";
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
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 sticky top-0 z-30">
      
      {/* Search or Logo could go here in the future */}
      <div className="flex-1" />

      {/* User Profile Section */}
      <div className="flex items-center gap-4">
        {/* Identity Text */}
        <div className="text-right hidden sm:block">
          <p className="text-sm font-bold text-gray-900 leading-tight">
            {user?.name || "Guest User"}
          </p>
          <p className="text-[10px] text-blue-600 uppercase font-black tracking-widest">
            {user?.role || "User"}
          </p>
        </div>
        
        {/* Profile Action Area */}
        <div className="flex items-center gap-2 cursor-pointer p-1 hover:bg-gray-50 rounded-xl transition-all duration-200 group">
          <Avatar className="h-10 w-10 border-2 border-gray-100 shadow-sm transition-transform group-hover:scale-105">
            <AvatarImage 
              src={profileImageUrl} 
              alt={user?.name || "User"} 
              className="object-cover"
            />
            <AvatarFallback className="bg-blue-600 text-white font-black text-sm">
              {getInitial()}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
};

export default Header;