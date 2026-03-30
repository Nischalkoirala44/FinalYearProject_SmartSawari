"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import axios from "axios";
import Image from "next/image";
import dynamic from "next/dynamic";
import {
  MapPin,
  Navigation,
  X,
  Printer,
  ArrowLeft,
  Loader2,
  Calendar,
  History,
  ExternalLink,
  Filter,
} from "lucide-react";

const BookingMap = dynamic(() => import("../(components)/BookingMap"), {
  ssr: false,
  loading: () => (
    <div className="h-[400px] w-full rounded-2xl bg-[#0f2435] flex items-center justify-center border border-white/10">
      <Loader2 className="animate-spin text-red-600" size={32} />
    </div>
  ),
});

interface Booking {
  id: number;
  bookingId: string;
  startDate: string;
  endDate: string;
  totalAmount: string;
  paymentStatus: string;
  bookingStatus: "confirmed" | "pending" | "cancelled";
  transactionId: string;
  vehicle: {
    registrationNumber: string;
    vehicleType: string;
    location: {
      locationName: string;
      city: string;
      province: string;
      latitude: number;
      longitude: number;
      addressLine: string;
    } | null;
    documentImage: { vehicleImages: string[] };
  };
}

const MyBookings: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showMap, setShowMap] = useState<boolean>(false);
  const [filterStatus, setFilterStatus] = useState<string>("All");

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("http://localhost:3001/api/bookings/user-bookings", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.data.success) setBookings(response.data.bookings);
      } catch (err) {
        console.error("Error fetching bookings:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  // Filter Bookings
  const filteredBookings = useMemo(() => {
    if (filterStatus === "All") return bookings;
    return bookings.filter((b) => b.bookingStatus === filterStatus.toLowerCase());
  }, [bookings, filterStatus]);

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-[#0b1a27]">
      <Loader2 className="animate-spin text-red-600" size={40} />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0b1a27] text-white p-4 md:p-10 font-sans selection:bg-red-600/30">
      <div className="max-w-6xl mx-auto">
        
        {/* PAGE HEADER */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 border-b border-white/5 pb-8">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-red-600/10 rounded-2xl border border-red-600/20">
              <History className="text-red-600" size={32} />
            </div>
            <div>
              <h2 className="text-4xl font-black tracking-tighter uppercase italic">Booking <span className="text-red-600">History</span></h2>
              <p className="text-[10px] text-gray-500 uppercase tracking-[0.2em] font-bold">Precision Fleet Logs</p>
            </div>
          </div>

          {/* STATUS FILTERS */}
          <div className="flex bg-[#0d1f2f] p-1 rounded-xl border border-white/5">
            {["All", "Confirmed", "Pending"].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                  filterStatus === status 
                  ? "bg-red-600 text-white shadow-lg shadow-red-900/20" 
                  : "text-gray-500 hover:text-white"
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {filteredBookings.length === 0 ? (
          <div className="text-center py-24 bg-[#0d1f2f] rounded-[3rem] border border-dashed border-white/10">
            <Filter className="mx-auto text-gray-700 mb-4" size={40} />
            <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">No entries found for "{filterStatus}"</p>
          </div>
        ) : (
          <div className="space-y-3">
            {/* TABLE HEADER */}
            <div className="hidden md:grid grid-cols-12 px-8 py-4 text-[10px] font-black uppercase tracking-[0.3em] text-gray-600">
              <div className="col-span-5">Machine & Reference</div>
              <div className="col-span-3">Booking Date</div>
              <div className="col-span-2">Amount</div>
              <div className="col-span-2 text-right">Status</div>
            </div>

            {/* HISTORY ROWS */}
            {filteredBookings.map((booking) => (
              <div 
                key={booking.id}
                onClick={() => setSelectedBooking(booking)}
                className="grid grid-cols-1 md:grid-cols-12 items-center gap-4 bg-[#0d1f2f] hover:bg-[#122a3f] border border-white/5 p-5 md:px-8 rounded-[1.5rem] transition-all cursor-pointer group hover:border-red-600/30"
              >
                <div className="col-span-5 flex items-center gap-5">
                  <div className="relative w-20 h-12 rounded-xl overflow-hidden flex-shrink-0 border border-white/10 bg-black">
                    <Image 
                      src={booking.vehicle.documentImage.vehicleImages[0] || "/placeholder.png"} 
                      alt="vehicle" fill className="object-cover opacity-80 group-hover:opacity-100 transition-opacity" 
                    />
                  </div>
                  <div>
                    <h3 className="font-black uppercase italic text-sm tracking-tight group-hover:text-red-500 transition-colors">
                      {booking.vehicle.vehicleType}
                    </h3>
                    <p className="text-[9px] font-mono text-gray-500 uppercase tracking-tighter mt-0.5">
                      REF: {booking.bookingId} • {booking.vehicle.registrationNumber}
                    </p>
                  </div>
                </div>

                <div className="col-span-3">
                  <div className="flex items-center gap-2 text-[11px] font-bold text-gray-400">
                    <span>{booking.startDate.split('T')[0]}</span>
                    <div className="h-px w-4 bg-gray-700"></div>
                    <span>{booking.endDate.split('T')[0]}</span>
                  </div>
                </div>

                <div className="col-span-2">
                  <p className="text-sm font-black italic text-white">Rs. {booking.totalAmount}</p>
                </div>

                <div className="col-span-2 flex items-center justify-between md:justify-end gap-6">
                   <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-lg border ${
                     booking.bookingStatus === 'confirmed' ? 'border-emerald-500/20 text-emerald-400 bg-emerald-500/5' : 'border-amber-500/20 text-amber-400 bg-amber-500/5'
                   }`}>
                     {booking.bookingStatus}
                   </span>
                   <ChevronIcon />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* --- SIDE-DRAWER STYLE MODAL --- */}
      {selectedBooking && (
        <div className="fixed inset-0 bg-[#07111a]/95 backdrop-blur-xl z-[100] flex items-center justify-center p-4">
          <div className="bg-[#0d1f2f] w-full max-w-2xl rounded-[3rem] border border-white/10 shadow-[0_0_80px_rgba(0,0,0,0.6)] overflow-hidden animate-in fade-in zoom-in-95 duration-300">
            <div className="p-10">
              {!showMap ? (
                <>
                  <div className="flex justify-between items-center mb-10">
                    <h2 className="text-3xl font-black uppercase italic tracking-tighter">Machine <span className="text-red-600">Manifest</span></h2>
                    <button onClick={() => setSelectedBooking(null)} className="p-3 bg-white/5 hover:bg-white/10 rounded-full transition-colors"><X size={20}/></button>
                  </div>

                  <div className="space-y-8">
                    <div className="grid grid-cols-2 gap-10 border-b border-white/5 pb-8">
                      <div>
                        <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-2">Deployed Unit</p>
                        <p className="text-2xl font-black uppercase italic">{selectedBooking.vehicle.vehicleType}</p>
                        <p className="text-xs text-gray-400 mt-1 font-mono">{selectedBooking.vehicle.registrationNumber}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-2">Total Budget</p>
                        <p className="text-3xl font-black text-red-600 italic">Rs. {selectedBooking.totalAmount}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4 bg-[#0f2435] p-6 rounded-[2rem] border border-white/5">
                      <div className="p-3 bg-red-600/10 rounded-xl"><MapPin size={20} className="text-red-600" /></div>
                      <div>
                        <p className="text-[10px] text-gray-500 uppercase font-black mb-1">Retrieval Point</p>
                        <p className="font-bold text-white uppercase italic">{selectedBooking.vehicle.location?.locationName}</p>
                        <p className="text-xs text-gray-400 mt-1 leading-relaxed">{selectedBooking.vehicle.location?.addressLine}, {selectedBooking.vehicle.location?.city}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                       <button 
                        onClick={() => setShowMap(true)} 
                        className="bg-red-600 text-white py-5 rounded-2xl font-black uppercase text-[11px] tracking-[0.2em] hover:bg-red-700 transition-all shadow-lg shadow-red-900/20 flex items-center justify-center gap-3 active:scale-[0.98]"
                       >
                         <Navigation size={16} fill="currentColor"/> View Live Route
                       </button>
                       <div className="flex gap-4">
                        <button onClick={() => setSelectedBooking(null)} className="flex-1 bg-white text-black py-4 rounded-2xl font-black uppercase text-[11px] tracking-widest hover:bg-gray-200">
                          Close
                        </button>
                       </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="animate-in slide-in-from-right duration-400">
                   <div className="flex justify-between items-center mb-6">
                    <button  onClick={() => window.location.reload()} className="flex items-center gap-2 text-red-600 font-black text-[11px] uppercase tracking-widest hover:translate-x-[-4px] transition-transform">
                      <ArrowLeft size={16} strokeWidth={3}/> Return to Manifest
                    </button>
                    <X size={20} className="text-gray-700 cursor-pointer" onClick={() => window.location.reload()}/>
                   </div>
                   
                   {/* Pass coordinates for routing */}
                   <BookingMap 
                      destLat={Number(selectedBooking.vehicle.location?.latitude)} 
                      destLng={Number(selectedBooking.vehicle.location?.longitude)}
                      hubName={selectedBooking.vehicle.location?.locationName || "Destination Hub"}
                      showRoute={true} 
                   />
                   
                   <p className="mt-6 text-[9px] text-gray-600 uppercase tracking-widest text-center">Satellite uplink active • Route optimized for precision</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Simple Icon Component
const ChevronIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-gray-700 group-hover:text-red-600 group-hover:translate-x-1 transition-all">
    <path d="m9 18 6-6-6-6"/>
  </svg>
);

export default MyBookings;