"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Car, Menu, X, LogOut, User, Settings, MessageCircleIcon } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import NotificationBell from "./NotificationBell";

export default function Navbar() {
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

    const getDashboardLink = () => {
        if (!user) return "/";
        if (user.role === "renter") return "/";
        if (user.role === "owner") return "/owner/dashboard";
        if (user.role === "admin") return "/admin/dashboard";
        return "/";
    };

    const getInitial = () => {
        if (!user?.name) return "U";
        return user.name.charAt(0).toUpperCase();
    };

    // Professional active link styling
    const isActive = (path: string) => pathname === path;

    const navLinkClasses = (path: string) => `
        text-sm font-medium px-4 py-2 rounded-md transition-all duration-200
        ${isActive(path) 
            ? "text-white bg-white/10 shadow-[inset_0_-2px_0_0_#dc2626]" 
            : "text-gray-400 hover:text-white hover:bg-white/5"}
    `;

    if (loading) return null;

    return (
        <nav className="sticky top-0 z-50 bg-[#0e1f2e] border-b border-gray-800 shadow-lg">
            <div className="container mx-auto max-w-7xl px-4">
                <div className="flex items-center justify-between h-20">
                    
                    {/* LEFT: Logo */}
                    <Link href="/" className="flex items-center gap-3 shrink-0 group">
                        <div className="bg-red-600 p-2 rounded-lg shadow-[0_0_15px_rgba(220,38,38,0.2)] group-hover:rotate-3 transition-transform">
                            <Car className="w-7 h-7 text-white" />
                        </div>
                        <span className="text-2xl font-black text-white tracking-tight">
                            Smart<span className="text-red-600">Sawari</span>
                        </span>
                    </Link>

                    {/* CENTER: Desktop Links with Active State */}
                    <div className="hidden md:flex items-center gap-1">
                        <Link href="/" className={navLinkClasses("/")}>
                            Home
                        </Link>
                        <Link href="/vehicles" className={navLinkClasses("/vehicles")}>
                            Browse
                        </Link>
                        <Link href="/how-it-works" className={navLinkClasses("/how-it-works")}>
                            Process
                        </Link>
                        <Link href="/about-us" className={navLinkClasses("/about-us")}>
                            About
                        </Link>
                    </div>

                    {/* RIGHT: User Action Cluster */}
                    <div className="flex items-center gap-3 md:gap-5">
                        {user ? (
                            <div className="flex items-center gap-3 md:gap-4 border-l border-gray-700 pl-5">
                                
                                {/* Notification Bell - Positioned for utility */}
                                <div className="relative">
                                    <NotificationBell />
                                </div>

                                {/* User Dropdown */}
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            className="relative h-10 w-10 rounded-full p-0 border border-gray-700 hover:border-red-600 hover:ring-2 hover:ring-red-600/20 transition-all overflow-hidden"
                                        >
                                            <Avatar className="h-full w-full">
                                                <AvatarImage src={user.profileImage?.replace(/"/g, "")} alt={user.name} />
                                                <AvatarFallback className="bg-red-600 text-white font-bold">
                                                    {getInitial()}
                                                </AvatarFallback>
                                            </Avatar>
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent className="w-64 mt-2 bg-[#0e1f2e] border-gray-700 text-white" align="end">
                                        <DropdownMenuLabel className="p-4">
                                            <div className="flex flex-col space-y-1">
                                                <p className="text-sm font-bold">{user.name}</p>
                                                <p className="text-xs text-gray-400 truncate">{user.email}</p>
                                                <div className="mt-2 inline-flex w-fit items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-red-600/10 text-red-500 border border-red-600/20">
                                                    {user.role}
                                                </div>
                                            </div>
                                        </DropdownMenuLabel>
                                        <DropdownMenuSeparator className="bg-gray-700" />
                                        <DropdownMenuItem asChild className="focus:bg-white/5 focus:text-white cursor-pointer py-3">
                                            <Link href="/chat" className="flex items-center">
                                                <MessageCircleIcon className="mr-3 h-4 w-4" />
                                                <span>Chat</span>
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem asChild className="focus:bg-white/5 focus:text-white cursor-pointer py-3">
                                            <Link href="/profile" className="flex items-center">
                                                <User className="mr-3 h-4 w-4 text-gray-400" />
                                                <span>My Profile</span>
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem asChild className="focus:bg-white/5 focus:text-white cursor-pointer py-3">
                                            <Link href="/settings" className="flex items-center">
                                                <Settings className="mr-3 h-4 w-4 text-gray-400" />
                                                <span>Settings</span>
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator className="bg-gray-700" />
                                        <DropdownMenuItem
                                            onClick={handleLogout}
                                            className="text-red-500 focus:bg-red-600 focus:text-white cursor-pointer py-3"
                                        >
                                            <LogOut className="mr-3 h-4 w-4" />
                                            <span>Sign Out</span>
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        ) : (
                            <div className="hidden md:flex items-center gap-2">
                                <Link href="/login" className="text-sm font-semibold text-gray-300 hover:text-white px-5 py-2 transition-colors">
                                    Login
                                </Link>
                                <Button asChild className="bg-red-600 hover:bg-red-700 text-white font-bold px-6 h-10 rounded-md shadow-lg shadow-red-900/20">
                                    <Link href="/register">Sign Up</Link>
                                </Button>
                            </div>
                        )}

                        {/* Mobile Toggle */}
                        <button
                            className="md:hidden p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        >
                            {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu Overlay */}
                {mobileMenuOpen && (
                    <div className="md:hidden fixed inset-0 top-20 bg-[#0e1f2e] z-40 p-6 flex flex-col animate-in fade-in slide-in-from-top-4 duration-200">
                        <div className="flex flex-col gap-2">
                            <Link 
                                href="/" 
                                className={`text-xl font-semibold p-4 rounded-lg ${isActive('/') ? 'bg-red-600/10 text-red-500' : 'text-white'}`}
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Home
                            </Link>
                            <Link 
                                href="/vehicles" 
                                className={`text-xl font-semibold p-4 rounded-lg ${isActive('/vehicles') ? 'bg-red-600/10 text-red-500' : 'text-white'}`}
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Browse Vehicles
                            </Link>
                            <Link 
                                href="/how-it-works" 
                                className={`text-xl font-semibold p-4 rounded-lg ${isActive('/how-it-works') ? 'bg-red-600/10 text-red-500' : 'text-white'}`}
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                How It Works
                            </Link>
                        </div>
                        
                        <div className="mt-auto pb-10 flex flex-col gap-4">
                            {user ? (
                                <div className="bg-white/5 border border-gray-800 p-4 rounded-xl flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-10 w-10 border border-gray-700">
                                            <AvatarImage src={user.profileImage?.replace(/"/g, "")} />
                                            <AvatarFallback className="bg-red-600 text-white text-xs">{getInitial()}</AvatarFallback>
                                        </Avatar>
                                        <span className="text-white font-bold truncate">{user.name}</span>
                                    </div>
                                    <NotificationBell />
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 gap-4">
                                    <Button asChild variant="outline" className="h-14 border-gray-700 text-white font-bold rounded-xl" onClick={() => setMobileMenuOpen(false)}>
                                        <Link href="/login">Login</Link>
                                    </Button>
                                    <Button asChild className="h-14 bg-red-600 font-bold rounded-xl" onClick={() => setMobileMenuOpen(false)}>
                                        <Link href="/register">Sign Up</Link>
                                    </Button>
                                </div>
                            )}
                            {user && (
                                <Button onClick={handleLogout} variant="destructive" className="w-full h-14 font-bold rounded-xl">
                                    Sign Out
                                </Button>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
}