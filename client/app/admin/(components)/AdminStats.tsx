import React from "react";
import { Activity, DollarSign, Car, Users } from "lucide-react";

export const AdminStats = ({ stats }: any) => {
  const cards = [
    { 
      label: "Platform Earnings (10%)", 
      value: `Rs. ${Number(stats.revenue).toLocaleString()}`, 
      icon: <DollarSign size={22} />, 
      color: "bg-emerald-500",
      textColor: "text-emerald-600"
    },
    { 
      label: "Active Rentals", 
      value: stats.activeBookings || 0, 
      icon: <Activity size={22} />, 
      color: "bg-red-500",
      textColor: "text-red-600"
    },
    { 
      label: "Total Vehicles", 
      value: stats.totalVehicles || 0, 
      icon: <Car size={22} />, 
      color: "bg-blue-500",
      textColor: "text-blue-600"
    },
    { 
      label: "Total Users", 
      value: stats.totalUsers || 0, 
      icon: <Users size={22} />, 
      color: "bg-slate-500",
      textColor: "text-slate-600"
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {cards.map((card, i) => (
        <div 
          key={i} 
          className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden group"
        >
          {/* Subtle Icon Background Decor */}
          <div className={`absolute -top-2 -right-2 p-6 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity ${card.textColor}`}>
            {card.icon}
          </div>

          <div className="flex items-center gap-3 mb-4">
            <div className={`p-2 rounded-lg ${card.color} bg-opacity-10 ${card.textColor}`}>
              {card.icon}
            </div>
            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500">
              {card.label}
            </p>
          </div>

          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            {card.value}
          </h2>

          {/* Bottom Accent Bar */}
          <div className={`h-1.5 w-10 mt-4 rounded-full ${card.color} opacity-80`} />
        </div>
      ))}
    </div>
  );
};