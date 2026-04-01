'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Edit3, Trash2, Plus, MapPin, CheckCircle,
  Clock, AlertCircle, Calendar, ShieldCheck
} from 'lucide-react';
import axios from 'axios';
import Image from 'next/image';

export default function MyVehiclesPage() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [vehicleToDelete, setVehicleToDelete] = useState<number | null>(null);

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get("http://localhost:3001/api/vehicles/owner-vehicles", {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.success) {
        setVehicles(res.data.vehicles);
      }
    } catch (err: any) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const promptDelete = (id: number) => {
    setVehicleToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!vehicleToDelete) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:3001/api/vehicles/delete/${vehicleToDelete}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setVehicles(vehicles.filter((v: any) => v.id !== vehicleToDelete));
      setIsDeleteModalOpen(false);
    } catch (err) {
      alert("Failed to decommission asset");
    } finally {
      setVehicleToDelete(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = "flex items-center gap-1.5 px-3 py-1 rounded-xl border text-[9px] font-black uppercase tracking-widest backdrop-blur-md";
    switch (status.toLowerCase()) {
      case 'approved':
        return <span className={`${baseClasses} text-emerald-400 border-emerald-500/30 bg-emerald-500/10`}><CheckCircle size={10} /> Verified</span>;
      case 'pending':
        return <span className={`${baseClasses} text-amber-400 border-amber-500/30 bg-amber-500/10`}><Clock size={10} /> Pending Review</span>;
      default:
        return <span className={`${baseClasses} text-red-400 border-red-500/30 bg-red-500/10`}><AlertCircle size={10} /> {status}</span>;
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] bg-[#0b1a27]">
      <div className="w-12 h-12 rounded-full border-2 border-red-900/20 border-t-red-600 animate-spin mb-4" />
      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">Syncing Fleet Assets...</p>
    </div>
  );

  return (
    <div className="flex-1 bg-[#0b1a27] min-h-screen px-4 md:px-8 py-10">
      
      {/* DELETE MODAL */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#0b1a27]/80 backdrop-blur-md" onClick={() => setIsDeleteModalOpen(false)} />
          <div className="relative bg-[#0d1f2f] border border-white/10 p-8 rounded-[2.5rem] max-w-sm w-full shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center">
              <div className="p-4 bg-red-600/10 text-red-600 rounded-full mb-6">
                <AlertCircle size={32} />
              </div>
              <h3 className="text-xl font-black text-white uppercase italic tracking-tighter mb-2">
                Decommission <span className="text-red-600">Asset?</span>
              </h3>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest leading-relaxed mb-8">
                This will permanently remove the vehicle from active fleet deployment.
              </p>
              <div className="flex gap-4 w-full">
                <button
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="flex-1 py-4 bg-[#0b1a27] text-gray-400 font-black text-[10px] uppercase tracking-widest rounded-2xl border border-white/5 hover:bg-white/5 transition-all"
                >
                  No
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 py-4 bg-red-600 text-white font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-red-700 transition-all shadow-lg shadow-red-900/20"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
          <div>
            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter uppercase italic leading-none">
              Fleet <span className="text-red-600">Management</span>
            </h1>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.3em] mt-3">
              Operational Overview of Registered Assets
            </p>
          </div>
          <Link
            href="/owner/post"
            className="group flex items-center gap-3 bg-red-600 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-700 transition-all shadow-xl shadow-red-900/20 active:scale-95"
          >
            <Plus size={18} />
            Deploy New Asset
          </Link>
        </div>

        {vehicles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 bg-[#0d1f2f]/30 border border-dashed border-white/10 rounded-[3rem] text-center">
            <ShieldCheck className="text-gray-800 mb-4" size={48} />
            <h3 className="text-sm font-black text-gray-400 uppercase tracking-[0.4em]">No Active Assets</h3>
            <p className="text-[10px] text-gray-600 font-bold uppercase mt-2">Begin deployment to start generating revenue</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {vehicles.map((vehicle: any) => {
              const mainImage = vehicle.documentImage?.vehicleImages?.[0] || null;
              return (
                <div key={vehicle.id} className="group relative flex flex-col bg-[#0d1f2f] rounded-[2.5rem] overflow-hidden border border-white/5 transition-all duration-500 hover:border-white/20 hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(0,0,0,0.6)]">
                  {/* IMAGE HEADER */}
                  <div className="relative h-56 w-full bg-[#07111a] overflow-hidden">
                    {mainImage ? (
                      <Image src={mainImage} alt={vehicle.vehicleType} fill className="object-cover transition-transform duration-700 group-hover:scale-110" unoptimized />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl opacity-10 font-black italic text-white uppercase">{vehicle.vehicleType}</div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0d1f2f] via-transparent to-transparent opacity-90" />
                    <div className="absolute top-4 left-4 z-10">{getStatusBadge(vehicle.status)}</div>
                  </div>

                  {/* CONTENT */}
                  <div className="p-7 flex flex-col flex-1">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-xl font-black text-white uppercase italic tracking-tighter leading-none">{vehicle.vehicleType}</h3>
                      <div className="text-right">
                        <span className="text-[8px] font-black text-red-600 uppercase tracking-widest block mb-0.5">Rate</span>
                        <span className="text-sm font-black text-white italic">Rs. {vehicle.pricePerDay}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mb-6 group/status">
                      <div className="flex items-center gap-2">
                        <MapPin size={12} className="text-red-600 group-hover/status:animate-pulse" />
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] italic">{vehicle.registrationNumber}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${vehicle.availabilityStatus?.toLowerCase() === 'available' ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" : "bg-red-600 shadow-[0_0_10px_rgba(220,38,38,0.5)]"}`} />
                        <span className={`text-[9px] font-black uppercase tracking-[0.2em] ${vehicle.availabilityStatus?.toLowerCase() === 'available' ? "text-emerald-500" : "text-red-600"}`}>{vehicle.availabilityStatus}</span>
                      </div>
                    </div>

                    <div className="h-px w-full bg-gradient-to-r from-white/10 to-transparent mb-6" />

                    <div className="flex items-center justify-between mt-auto">
                      <div className="flex gap-2">
                        <Link href={`/owner/my-vehicles/${vehicle.id}`} className="p-3 bg-[#0b1a27] text-gray-400 hover:text-white border border-white/5 hover:border-white/20 rounded-xl transition-all shadow-lg"><Edit3 size={16} /></Link>
                        <button onClick={() => promptDelete(vehicle.id)} className="p-3 bg-[#0b1a27] text-gray-400 hover:text-red-500 border border-white/5 hover:border-red-500/20 rounded-xl transition-all shadow-lg"><Trash2 size={16} /></button>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-[8px] font-black text-gray-700 uppercase tracking-widest mb-1">Registered On</span>
                        <div className="flex items-center gap-1.5 text-gray-500">
                          <Calendar size={10} />
                          <span className="text-[10px] font-bold">{new Date(vehicle.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}