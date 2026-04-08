'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Calendar, MapPin, User, Phone, 
  ChevronRight, Radar, Clock 
} from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function OwnerBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOwnerBookings = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${API_URL}/api/bookings/owner-bookings`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data.success) setBookings(res.data.bookings);
      } catch (err) {
        console.error("Failed to fetch bookings", err);
      } finally {
        setLoading(false);
      }
    };
    fetchOwnerBookings();
  }, []);

  const getStatusStyle = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'confirmed': return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case 'pending': return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      case 'cancelled': return "bg-red-500/10 text-red-400 border-red-500/20";
      default: return "bg-slate-500/10 text-slate-400 border-slate-500/20";
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-[#0b1a27]">
      <div className="animate-pulse text-red-600 font-black tracking-widest uppercase">Syncing Revenue Streams...</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0b1a27] text-white p-6 md:p-12">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter leading-none">
              Asset <span className="text-red-600">Deployments</span>
            </h1>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.3em] mt-3">
              Real-time rental oversight & logistics
            </p>
          </div>
          <div className="flex gap-4">
            <div className="bg-[#0d1f2f] border border-white/5 p-4 rounded-2xl">
              <p className="text-[8px] text-gray-500 font-black uppercase mb-1">Active Rents</p>
              <p className="text-xl font-black italic">{bookings.length}</p>
            </div>
          </div>
        </div>

        {bookings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-[#0d1f2f]/30 border border-dashed border-white/10 rounded-[3rem]">
            <Clock className="text-gray-700 mb-4" size={48} />
            <p className="text-sm font-black text-gray-500 uppercase tracking-widest">No active bookings found</p>
          </div>
        ) : (
          <div className="space-y-6">
            {bookings.map((booking: any) => {
              const now = new Date();
              const start = new Date(booking.startDate);
              const end = new Date(booking.endDate);
              
              end.setHours(23, 59, 59, 999);
              const isCurrentlyActive = now >= start && now <= end;

              return (
                <Card key={booking.id} className="bg-[#0d1f2f] border-white/5 hover:border-white/10 transition-all rounded-[2rem] overflow-hidden">
                  <CardContent className="p-0">
                    <div className="flex flex-col lg:flex-row">
                      {/* Vehicle Preview */}
                      <div className="relative w-full lg:w-72 h-48 bg-[#07111a]">
                        <Image 
                          src={booking.vehicle?.documentImage?.vehicleImages?.[0] || "/placeholder.png"} 
                          alt="vehicle" 
                          fill 
                          className="object-cover opacity-80"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-[#0d1f2f] via-transparent to-transparent hidden lg:block" />
                      </div>

                      {/* Booking Stats */}
                      <div className="flex-1 p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Column 1: Asset Info */}
                        <div className="space-y-4">
                          <div>
                            <Badge className={`mb-2 font-black uppercase text-[9px] ${getStatusStyle(booking.bookingStatus)}`}>
                              {booking.bookingStatus}
                            </Badge>
                            <h3 className="text-2xl font-black uppercase italic tracking-tighter text-white">
                              {booking.vehicle?.vehicleType}
                            </h3>
                            <p className="text-[10px] text-gray-500 font-bold uppercase">{booking.vehicle?.registrationNumber}</p>
                          </div>
                          <div className="flex items-center gap-2 text-gray-400">
                            <MapPin size={14} className="text-red-600" />
                            <span className="text-[11px] font-bold uppercase">{booking.vehicle?.location?.city}</span>
                          </div>
                        </div>

                        {/* Column 2: Renter Details */}
                        <div className="space-y-3 border-l border-white/5 pl-0 md:pl-8">
                          <p className="text-[8px] text-red-600 font-black uppercase tracking-widest">Operator Details</p>
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-600/20 flex items-center justify-center text-blue-400">
                              <User size={16} />
                            </div>
                            <div>
                              <p className="text-sm font-black uppercase tracking-tight text-white">{booking.renter?.name}</p>
                              <div className="flex items-center gap-1 text-gray-500 text-[10px]">
                                <Phone size={10} />
                                <span>{booking.renter?.mobile}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Column 3: Timeline & Actions */}
                        <div className="flex flex-col justify-between border-l border-white/5 pl-0 md:pl-8">
                          <div>
                            <p className="text-[8px] text-red-600 font-black uppercase tracking-widest mb-2">Rental Period</p>
                            <div className="flex items-center gap-2 text-xs font-bold text-gray-300">
                              <Calendar size={14} className="text-gray-600" />
                              <span>{new Date(booking.startDate).toLocaleDateString()}</span>
                              <ChevronRight size={12} className="text-gray-700" />
                              <span>{new Date(booking.endDate).toLocaleDateString()}</span>
                            </div>
                          </div>

                          <div className="flex gap-2 mt-6">
                            {/* Track Live button shown only if current date is within booking range */}
                            {isCurrentlyActive ? (
                              <Link 
                                href={`/owner/bookings/${booking.bookingId}`}
                                className="flex-1 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white text-[10px] font-black uppercase tracking-widest py-3 rounded-xl transition-all"
                              >
                                <Radar size={14} className="animate-pulse" />
                                Track Live
                              </Link>
                            ) : (
                              <div className="flex-1 flex items-center justify-center gap-2 bg-white/5 text-gray-500 text-[10px] font-black uppercase tracking-widest py-3 rounded-xl cursor-not-allowed">
                                Session Ended
                              </div>
                            )}
                            <div className="bg-[#0b1a27] border border-white/5 px-4 flex items-center justify-center rounded-xl">
                              <span className="text-emerald-400 font-black italic text-xs">Rs.{booking.totalAmount}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}