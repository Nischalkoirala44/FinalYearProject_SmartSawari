"use client";

import { useRouter } from "next/navigation";
import { ShieldAlert, Lock } from "lucide-react";

export default function UnauthorizedPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#0a1620] flex items-center justify-center px-6 relative overflow-hidden">
      {/* Background Decorative Element */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] blur-[120px] rounded-full" />

      <div className="max-w-md w-full text-center relative z-10">
        {/* Icon with Ring Animation */}
        <div className="relative inline-block mb-8">
          <div className="absolute -inset-4 bg-red-600/20 rounded-full animate-ping opacity-25" />
          <div className="relative bg-[#0e1f2e] border-2 border-red-600/50 p-6 rounded-3xl shadow-2xl">
            <ShieldAlert size={48} className="text-red-600" />
          </div>
          <div className="absolute -bottom-2 -right-2 bg-red-600 rounded-lg p-1.5 border-4 border-[#0a1620]">
            <Lock size={14} className="text-white" />
          </div>
        </div>

        {/* Text Content */}
        <h1 className="text-5xl font-black uppercase tracking-tighter text-white mb-4">
          Access <span className="text-red-600">Denied</span>
        </h1>
        
        <p className="text-gray-400 font-bold text-sm uppercase tracking-widest leading-relaxed mb-10 opacity-80">
          Your current credentials lack the <span className="text-white">Clearance Level</span> 
          required to view this sector of the Smart Sawari ecosystem.
        </p>

        {/* Footer Detail */}
        <div className="mt-16 pt-8 border-t border-white/5">
          <p className="text-[10px] font-black text-gray-600 uppercase tracking-[0.3em]">
            Security Protocol: 403_FORBIDDEN_ACCESS
          </p>
        </div>
      </div>
    </div>
  );
}