"use client";

import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import Image from "next/image";
import dynamic from "next/dynamic";
import {
  MapPin,
  Navigation,
  X,
  ArrowLeft,
  Loader2,
  History,
  Filter,
  Clock,
  CheckCircle2,
  Radio,
  Lock,
  AlertTriangle,
  ShieldAlert,
} from "lucide-react";

import RenterBeacon from "../(components)/RenterBeacon";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

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
  isSharing: boolean;
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
  const [filterType, setFilterType] = useState<"Active" | "Past">("Active");

  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_URL}/api/bookings/user-bookings`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.success) {
        const initialized = response.data.bookings.map((b: any) => ({ ...b, isSharing: false }));
        setBookings(initialized);
      }
    } catch (err) {
      console.error("Error fetching bookings:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async () => {
    if (!cancellingId) return;

    setIsProcessing(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${API_URL}/api/bookings/${cancellingId}/cancel`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setCancellingId(null);
        setSelectedBooking(null);
        fetchBookings();
      }
    } catch (err: any) {
      setErrorMessage(
        err.response?.data?.message || "We couldn't process your cancellation right now. Please try again later."
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleLocalSharing = (bookingId: number) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, isSharing: !b.isSharing } : b))
    );
    if (selectedBooking?.id === bookingId) {
      setSelectedBooking(prev => prev ? { ...prev, isSharing: !prev.isSharing } : null);
    }
  };

  const { activeBookings, pastBookings } = useMemo(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return {
      activeBookings: bookings.filter((b) => new Date(b.endDate) >= now && b.bookingStatus !== "cancelled"),
      pastBookings: bookings.filter((b) => new Date(b.endDate) < now || b.bookingStatus === "cancelled"),
    };
  }, [bookings]);

  const displayBookings = filterType === "Active" ? activeBookings : pastBookings;

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-[#0b1a27]">
      <Loader2 className="animate-spin text-red-600" size={40} />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0b1a27] text-white p-4 md:p-10 font-sans selection:bg-red-600/30 relative">

      {/* ERROR POPUP OVERLAY */}
      {errorMessage && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[300] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="bg-[#0d1f2f] border border-red-500/30 w-full max-w-md rounded-[2.5rem] p-8 shadow-[0_0_50px_rgba(220,38,38,0.15)] text-center">
            <div className="w-20 h-20 bg-red-500/10 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-red-500/20">
              <AlertTriangle className="text-red-500" size={40} />
            </div>
            <h3 className="text-2xl font-black uppercase italic tracking-tight mb-2 text-white">
              Action <span className="text-red-600">Failed</span>
            </h3>
            <p className="text-gray-400 text-sm mb-8 leading-relaxed">
              {errorMessage}
            </p>
            <button
              onClick={() => {
                setErrorMessage(null);
                setCancellingId(null);
              }}
              className="w-full bg-white/5 hover:bg-white/10 text-white border border-white/10 font-black py-4 rounded-2xl uppercase tracking-widest transition-all"
            >
              Dismiss & Return
            </button>
          </div>
        </div>
      )}

      {/* CANCELLATION POPUP OVERLAY */}
      {cancellingId && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[200] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="bg-[#0d1f2f] border border-orange-500/30 w-full max-w-md rounded-[2.5rem] p-8 shadow-[0_0_50px_rgba(249,115,22,0.15)] text-center">
            <div className="w-20 h-20 bg-orange-500/10 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-orange-500/20">
              <ShieldAlert className="text-orange-500" size={40} />
            </div>
            <h3 className="text-2xl font-black uppercase italic tracking-tight mb-2">Cancel Booking?</h3>
            <p className="text-gray-400 text-sm mb-8 leading-relaxed">
              You are about to cancel booking <span className="text-white font-mono">{cancellingId}</span>.
            </p>
            <div className="flex flex-col gap-3">
              <button
                disabled={isProcessing}
                onClick={handleCancelBooking}
                className="w-full bg-orange-600 hover:bg-orange-500 text-white font-black py-4 rounded-2xl uppercase tracking-widest transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isProcessing ? <Loader2 className="animate-spin" size={18} /> : "Confirm Cancellation"}
              </button>
              <button
                onClick={() => setCancellingId(null)}
                className="w-full bg-white/5 hover:bg-white/10 text-gray-400 font-bold py-4 rounded-2xl uppercase tracking-widest transition-all"
              >
                Standby (Go Back)
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto">

        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 border-b border-white/5 pb-8">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-red-600/10 rounded-2xl border border-red-600/20">
              <History className="text-red-600" size={32} />
            </div>
            <div>
              <h2 className="text-4xl font-black tracking-tighter uppercase italic">Fleet <span className="text-red-600">Logs</span></h2>
              <p className="text-[10px] text-gray-500 uppercase tracking-[0.2em] font-bold">Smart Sawari Database</p>
            </div>
          </div>

          <div className="flex bg-[#0d1f2f] p-1 rounded-xl border border-white/5">
            {[{ id: "Active", icon: <Clock size={12} /> }, { id: "Past", icon: <CheckCircle2 size={12} /> }].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilterType(tab.id as any)}
                className={`px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${filterType === tab.id ? "bg-red-600 text-white shadow-lg shadow-red-900/20" : "text-gray-500 hover:text-white"}`}
              >
                {tab.icon} {tab.id}
              </button>
            ))}
          </div>
        </div>

        {displayBookings.length === 0 ? (
          <div className="text-center py-24 bg-[#0d1f2f] rounded-[3rem] border border-dashed border-white/10">
            <Filter className="mx-auto text-gray-700 mb-4" size={40} />
            <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">No {filterType.toLowerCase()} records found</p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="hidden md:grid grid-cols-12 px-8 py-4 text-[10px] font-black uppercase tracking-[0.3em] text-gray-600">
              <div className="col-span-5">Machine & Reference</div>
              <div className="col-span-3">Operational Window</div>
              <div className="col-span-2 text-center">Action / Signal</div>
              <div className="col-span-2 text-right">Status</div>
            </div>

            {displayBookings.map((booking) => {
              const now = new Date();
              now.setHours(0, 0, 0, 0);
              const start = new Date(booking.startDate);
              start.setHours(0, 0, 0, 0);
              const end = new Date(booking.endDate);
              end.setHours(23, 59, 59, 999);

              const isLive = now >= start && now <= end;
              const canCancel = now <= start && booking.bookingStatus !== 'cancelled';

              return (
                <div
                  key={booking.id}
                  onClick={() => setSelectedBooking(booking)}
                  className={`grid grid-cols-1 md:grid-cols-12 items-center gap-4 bg-[#0d1f2f] hover:bg-[#122a3f] border border-white/5 p-5 md:px-8 rounded-[1.5rem] transition-all cursor-pointer group hover:border-red-600/30 ${filterType === 'Past' ? 'opacity-70 grayscale-[0.5]' : ''}`}
                >
                  <div className="col-span-5 flex items-center gap-5">
                    <div className="relative w-20 h-12 rounded-xl overflow-hidden flex-shrink-0 border border-white/10 bg-black">
                      <Image src={booking.vehicle.documentImage.vehicleImages[0] || "/placeholder.png"} alt="vehicle" fill className="object-cover opacity-80" />
                    </div>
                    <div>
                      <h3 className="font-black uppercase italic text-sm tracking-tight">{booking.vehicle.vehicleType}</h3>
                      <p className="text-[9px] font-mono text-gray-500 uppercase tracking-tighter">{booking.bookingId}</p>
                    </div>
                  </div>

                  <div className="col-span-3">
                    <div className="flex items-center gap-2 text-[11px] font-bold text-gray-400 font-mono">
                      <span>{booking.startDate.split('T')[0]}</span>
                      <div className="h-px w-3 bg-gray-700"></div>
                      <span>{booking.endDate.split('T')[0]}</span>
                    </div>
                  </div>

                  {/* ACTION COLUMN */}
                  <div className="col-span-2 flex flex-col items-center justify-center gap-2">
                    {isLive ? (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleLocalSharing(booking.id);
                          }}
                          className={`relative w-11 h-5 rounded-full transition-all duration-300 flex items-center px-1 ${booking.isSharing ? 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]' : 'bg-gray-800'}`}
                        >
                          <div className={`w-3 h-3 rounded-full bg-white transition-transform duration-300 ${booking.isSharing ? 'translate-x-6' : 'translate-x-0'}`} />
                        </button>
                        {booking.isSharing && (
                          <div onClick={(e) => e.stopPropagation()} className="mt-1">
                            <RenterBeacon bookingId={booking.id} token={localStorage.getItem("token") || ""} />
                          </div>
                        )}
                      </>
                    ) : canCancel ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setCancellingId(booking.bookingId);
                        }}
                        className="bg-orange-600/10 hover:bg-orange-600 text-orange-500 hover:text-white border border-orange-600/20 px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-2 group/btn"
                      >
                        <AlertTriangle size={10} className="group-hover/btn:animate-pulse" /> Cancel
                      </button>
                    ) : (
                      <span className="text-[8px] font-black text-gray-600 uppercase tracking-widest border border-white/5 px-2 py-1 rounded">Locked</span>
                    )}
                  </div>

                  <div className="col-span-2 flex items-center justify-between md:justify-end gap-4">
                    <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-lg border ${booking.bookingStatus === 'pending'
                        ? 'border-amber-500/20 text-amber-400 bg-amber-500/5'
                        : booking.bookingStatus === 'cancelled'
                          ? 'border-red-500/20 text-red-500 bg-red-500/5'
                          : 'border-white/10 text-gray-500'
                      }`}>
                      {booking.bookingStatus}
                    </span>
                    <ChevronIcon />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* MODAL */}
      {selectedBooking && !cancellingId && (
        <div className="fixed inset-0 bg-[#07111a]/95 backdrop-blur-xl z-[100] flex items-center justify-center p-4">
          <div className="bg-[#0d1f2f] w-full max-w-2xl rounded-[3rem] border border-white/10 shadow-[0_0_80px_rgba(0,0,0,0.6)] overflow-hidden">
            <div className="p-10">
              {!showMap ? (
                <>
                  <div className="flex justify-between items-center mb-10">
                    <h2 className="text-3xl font-black uppercase italic tracking-tighter">Machine <span className="text-red-600">Manifest</span></h2>
                    <button onClick={() => setSelectedBooking(null)} className="p-3 bg-white/5 hover:bg-white/10 rounded-full transition-colors"><X size={20} /></button>
                  </div>

                  <div className="space-y-8">
                    <div className="grid grid-cols-2 gap-10 border-b border-white/5 pb-8">
                      <div>
                        <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-2">Deployed Unit</p>
                        <p className="text-2xl font-black uppercase italic">{selectedBooking.vehicle.vehicleType}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-2">Total Budget</p>
                        <p className="text-3xl font-black text-red-600 italic font-mono">Rs. {selectedBooking.totalAmount}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4 bg-[#0f2435] p-6 rounded-[2rem] border border-white/5">
                      <div className="p-3 bg-red-600/10 rounded-xl"><MapPin size={20} className="text-red-600" /></div>
                      <div>
                        <p className="text-[10px] text-gray-500 uppercase font-black mb-1">Retrieval Point</p>
                        <p className="font-bold text-white uppercase italic">{selectedBooking.vehicle.location?.locationName}</p>
                        <p className="text-xs text-gray-400 mt-1">{selectedBooking.vehicle.location?.addressLine}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                      {new Date() >= new Date(selectedBooking.startDate) && new Date() <= new Date(selectedBooking.endDate) ? (
                        <button onClick={() => setShowMap(true)} className="bg-red-600 text-white py-5 rounded-2xl font-black uppercase text-[11px] tracking-[0.2em] shadow-lg shadow-red-900/20 flex items-center justify-center gap-3">
                          <Navigation size={16} fill="currentColor" /> View Live Route
                        </button>
                      ) : selectedBooking.bookingStatus !== 'cancelled' ? (
                        <button
                          onClick={() => setCancellingId(selectedBooking.bookingId)}
                          className="bg-orange-600/20 border border-orange-600/30 text-orange-500 py-5 rounded-2xl font-black uppercase text-[11px] tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-orange-600 hover:text-white transition-all"
                        >
                          <AlertTriangle size={16} /> Cancel Booking
                        </button>
                      ) : (
                        <button disabled className="bg-white/5 border border-white/5 text-gray-600 py-5 rounded-2xl font-black uppercase text-[11px] tracking-[0.2em] flex items-center justify-center gap-3 cursor-not-allowed">
                          <Lock size={16} /> Window Closed
                        </button>
                      )}
                      <button onClick={() => setSelectedBooking(null)} className="bg-white text-black py-4 rounded-2xl font-black uppercase text-[11px] tracking-widest hover:bg-gray-200 transition-colors">
                        Close
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="animate-in slide-in-from-right duration-400">
                  <div className="flex justify-between items-center mb-6">
                    <button onClick={() => setShowMap(false)} className="flex items-center gap-2 text-red-600 font-black text-[11px] uppercase tracking-widest hover:translate-x-[-4px] transition-transform">
                      <ArrowLeft size={16} strokeWidth={3} /> Return to Manifest
                    </button>
                    <X size={20} className="text-gray-700 cursor-pointer" onClick={() => setShowMap(false)} />
                  </div>
                  <BookingMap
                    destLat={Number(selectedBooking.vehicle.location?.latitude)}
                    destLng={Number(selectedBooking.vehicle.location?.longitude)}
                    hubName={selectedBooking.vehicle.location?.locationName || "Destination Hub"}
                    showRoute={true}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const ChevronIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-gray-700 group-hover:text-red-600 transition-all">
    <path d="m9 18 6-6-6-6" />
  </svg>
);

export default MyBookings;