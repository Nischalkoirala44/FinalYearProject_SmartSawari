'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Radar, Shield, Activity } from 'lucide-react';
import OwnerTracking from '../../(components)/OwnerTracking';
import { Button } from "@/components/ui/button";

export default function LiveTrackingPage() {
  const params = useParams();
  const router = useRouter();
  const bookingId = params?.id as string;

  return (
    <div className="min-h-screen bg-[#0b1a27] text-white">
      {/* Top Navigation Bar */}
      <div className="border-b border-white/5 bg-[#0d1f2f]/50 backdrop-blur-md sticky top-0 z-[120]">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              onClick={() => window.history.back()}
              className="text-gray-400 hover:text-white hover:bg-white/5 rounded-xl"
            >
              <ArrowLeft size={20} />
            </Button>
            <div>
              <h1 className="text-xl font-black uppercase italic tracking-tighter leading-none">
                Live <span className="text-red-600">Vehicle Location</span>
              </h1>
              <p className="text-[9px] text-gray-500 font-bold uppercase tracking-[0.2em] mt-1">
                Booking ID: {bookingId || "Loading..."}
              </p>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-6">
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Sidebar Stats */}
          <div className="lg:col-span-1 space-y-4">
            

            <div className="bg-[#0d1f2f] border border-white/5 p-6 rounded-[2rem]">
              <div className="flex items-center gap-3 mb-4">
                <Activity className="text-blue-500" size={20} />
                <h2 className="text-sm font-black uppercase tracking-widest">Safety</h2>
              </div>
              <p className="text-[9px] text-gray-500 font-bold leading-relaxed uppercase">
                Continuous asset tracking active.
              </p>
            </div>
          </div>

          {/* Main Map Area */}
          <div className="lg:col-span-3">
            <div className="bg-[#0d1f2f] border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl h-[70vh] relative flex items-center justify-center">
              {bookingId ? (
                <OwnerTracking 
                  bookingId={bookingId} 
                  vehicleName="Active Deployment"
                />
              ) : (
                <div className="text-gray-500 font-black uppercase tracking-widest animate-pulse">
                  Establishing Satellite Link...
                </div>
              )}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}