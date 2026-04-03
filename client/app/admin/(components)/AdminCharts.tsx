"use client";
import { useEffect, useState } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export const AdminCharts = ({ data }: { data: any[] }) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    console.log("Chart received data:", data);
  }, [data]);

  // Initial Mount Check
  if (!isMounted) return <div className="h-[300px] w-full bg-slate-50 animate-pulse rounded-2xl" />;

  // Loading State
  if (!data) {
    return (
      <div className="bg-white border border-slate-200 p-6 rounded-2xl h-[300px] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
      </div>
    );
  }

  // Empty Data Check
  if (data.length === 0) {
    return (
      <div className="bg-white border border-slate-200 p-6 rounded-2xl h-[300px] flex flex-col items-center justify-center">
        <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">No Revenue Data for this month</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm mb-8 w-full">
      <div className="mb-6">
        <h3 className="text-sm font-black uppercase tracking-widest text-slate-800">
          30-Day Revenue Trend
        </h3>
        <p className="text-[10px] text-slate-400 uppercase font-bold tracking-tight">
          Platform Earnings (10% Commission)
        </p>
      </div>

      <div className="h-[300px] w-full min-w-0">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis 
              dataKey="date" 
              axisLine={false} 
              tickLine={false} 
              tick={{fill: '#94a3b8', fontSize: 9, fontWeight: 'bold'}}
              dy={10}
              interval={4}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 'bold'}}
            />
            <Tooltip 
              contentStyle={{ 
                borderRadius: '12px', 
                border: 'none', 
                boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                fontSize: '12px'
              }}
            />
            <Area 
              type="monotone" 
              dataKey="revenue" 
              stroke="#ef4444" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorRev)"
              animationDuration={1000}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};