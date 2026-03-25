"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Bell, Check, BellOff } from 'lucide-react';
import { fetchNotifications, markAsRead } from '../services/Notification';
import { Notification } from '../types/Notification';

const NotificationBell: React.FC = () => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const loadNotifications = async () => {
        try {
            const data = await fetchNotifications();
            setNotifications(data.notifications);
        } catch (err) {
            console.error("Notification Sync Error:", err);
        }
    };

    useEffect(() => {
        loadNotifications();
        const interval = setInterval(loadNotifications, 60000); // Poll every minute
        
        // Close dropdown when clicking outside
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            clearInterval(interval);
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const unreadCount = notifications.filter(n => !n.isRead).length;

    const handleMarkRead = async (id: number) => {
        try {
            await markAsRead(id);
            setNotifications(prev => 
                prev.map(n => n.id === id ? { ...n, isRead: true } : n)
            );
        } catch (err) {
            console.error("Update failed", err);
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button 
                onClick={() => setIsOpen(!isOpen)} 
                className="relative text-gray-700 hover:bg-gray-100 rounded-full transition-all"
                aria-label="Notifications"
            >
                <Bell size={22} className={unreadCount > 0 ? "text-red-600" : "text-gray-600"} />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 bg-red-600 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center animate-pulse">
                        {unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-3 w-80 bg-white border border-gray-100 rounded-xl shadow-2xl z-50 overflow-hidden ring-1 ring-black ring-opacity-5">
                    <div className="p-4 bg-gray-50 border-b flex justify-between items-center">
                        <h3 className="font-bold text-gray-900">Notifications</h3>
                        <span className="text-xs font-medium text-red-600 bg-red-50 px-2 py-1 rounded-full">
                            {unreadCount} New
                        </span>
                    </div>

                    <div className="max-h-[400px] overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="p-8 text-center flex flex-col items-center">
                                <BellOff className="text-gray-300 mb-2" size={32} />
                                <p className="text-sm text-gray-500">All caught up!</p>
                            </div>
                        ) : (
                            notifications.map((n) => (
                                <div 
                                    key={n.id} 
                                    className={`p-4 border-b last:border-0 transition-colors flex gap-3 ${!n.isRead ? 'bg-red-50/50' : 'hover:bg-gray-50'}`}
                                >
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start mb-1">
                                            <p className={`text-sm ${!n.isRead ? 'font-bold text-gray-900' : 'text-gray-700'}`}>
                                                {n.title}
                                            </p>
                                            <span className="text-[10px] text-gray-400">
                                                {new Date(n.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-500 leading-relaxed">{n.message}</p>
                                    </div>
                                    {!n.isRead && (
                                        <button 
                                            onClick={() => handleMarkRead(n.id)}
                                            className="mt-1 text-gray-400 hover:text-green-600 transition-colors"
                                            title="Mark as read"
                                        >
                                            <Check size={16} />
                                        </button>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationBell;