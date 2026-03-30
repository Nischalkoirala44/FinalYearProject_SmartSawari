'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  Camera, Save, ArrowLeft, Loader2, MapPin, 
  CheckCircle, XCircle, Info, RefreshCcw, Image as ImageIcon 
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import Image from 'next/image';

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

interface SavedLocation {
  id: number;
  locationName: string;
}

export default function EditVehiclePage() {
  const { id } = useParams();
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    vehicleCondition: '',
    pricePerDay: '',
    locationId: '',
    availabilityStatus: 'available',
  });
  
  const [locations, setLocations] = useState<SavedLocation[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  useEffect(() => {
    const initializeData = async () => {
      try {
        const headers = getAuthHeader();
        
        const [vehicleRes, hubsRes] = await Promise.all([
          axios.get(`${API_URL}/api/vehicles/owner-vehicles/${id}`, { headers }),
          axios.get(`${API_URL}/api/locations/my-locations`, { headers })
        ]);

        if (hubsRes.data.success) {
          setLocations(hubsRes.data.data);
        }

        if (vehicleRes.data.success && vehicleRes.data.vehicle) {
          const v = vehicleRes.data.vehicle;
          setFormData({
            vehicleCondition: v.vehicleCondition || '',
            pricePerDay: v.pricePerDay || '',
            locationId: v.locationId?.toString() || '',
            availabilityStatus: v.availabilityStatus || 'available',
          });
          setExistingImages(v.documentImage?.vehicleImages || []);
        }
      } catch (err) {
        console.error("Initialization error:", err);
        toast.error("Failed to load vehicle telemetry");
      } finally {
        setFetching(false);
      }
    };

    initializeData();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const data = new FormData();
    data.append('vehicleCondition', formData.vehicleCondition);
    data.append('pricePerDay', formData.pricePerDay);
    data.append('locationId', formData.locationId);
    data.append('availabilityStatus', formData.availabilityStatus);

    if (selectedFiles) {
      Array.from(selectedFiles).forEach((file) => data.append('vehicleImages', file));
    }

    try {
      await axios.put(`${API_URL}/api/vehicles/update/${id}`, data, {
        headers: { 
          ...getAuthHeader(),
          'Content-Type': 'multipart/form-data' 
        }
      });
      toast.success("System updated successfully");
      router.push('/owner/my-vehicles');
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Update sequence failed");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#0b1a27]">
      <div className="w-12 h-12 rounded-full border-2 border-red-900/20 border-t-red-600 animate-spin mb-4" />
      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">Recalibrating Asset Data...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0b1a27] p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        <button 
          onClick={() => router.back()} 
          className="flex items-center gap-2 text-gray-500 mb-8 hover:text-white transition-colors group"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> 
          <span className="text-[10px] font-black uppercase tracking-widest">Abort Edit</span>
        </button>

        <div className="bg-[#0d1f2f] rounded-[3rem] border border-white/5 p-8 md:p-12 shadow-2xl relative overflow-hidden">
          {/* Background Glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/5 blur-[100px] rounded-full" />
          
          <div className="relative z-10">
            <header className="mb-10">
              <h1 className="text-4xl font-black text-white italic uppercase tracking-tighter leading-none">
                Update <span className="text-red-600">Configuration</span>
              </h1>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em] mt-3">
                Asset ID: <span className="text-gray-400">#SW-{id?.toString().slice(-4).toUpperCase()}</span>
              </p>
            </header>
            
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Condition */}
                <div className="bg-[#0b1a27] p-5 rounded-[1.5rem] border border-white/5">
                  <label className="text-[9px] font-black uppercase text-red-600 tracking-widest block mb-3">Vehicle Status/Condition</label>
                  <input 
                    value={formData.vehicleCondition}
                    placeholder="e.g. Pristine, Minor Scratches"
                    onChange={(e) => setFormData({...formData, vehicleCondition: e.target.value})}
                    className="w-full bg-transparent text-white font-bold outline-none placeholder:text-gray-700 italic"
                  />
                </div>

                {/* Price */}
                <div className="bg-[#0b1a27] p-5 rounded-[1.5rem] border border-white/5">
                  <label className="text-[9px] font-black uppercase text-red-600 tracking-widest block mb-3">Daily Yield (NPR)</label>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-gray-600 italic">Rs.</span>
                    <input 
                      type="number"
                      value={formData.pricePerDay}
                      placeholder="0.00"
                      onChange={(e) => setFormData({...formData, pricePerDay: e.target.value})}
                      className="w-full bg-transparent text-xl font-black text-white outline-none placeholder:text-gray-800 italic"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Hub Selector */}
                <div className="bg-[#0b1a27] p-5 rounded-[1.5rem] border border-white/5">
                  <label className="text-[9px] font-black uppercase text-gray-500 tracking-widest block mb-3 flex items-center gap-2">
                    <MapPin size={12} className="text-red-600" /> Operational Hub
                  </label>
                  <select 
                    value={formData.locationId}
                    onChange={(e) => setFormData({...formData, locationId: e.target.value})}
                    className="w-full bg-transparent text-sm font-black text-white outline-none cursor-pointer uppercase tracking-tighter"
                  >
                    <option value="" className="bg-[#0d1f2f]">Select Location</option>
                    {locations.map(loc => (
                      <option key={loc.id} value={loc.id} className="bg-[#0d1f2f]">{loc.locationName}</option>
                    ))}
                  </select>
                </div>

                {/* Availability Status */}
                <div className="bg-[#0b1a27] p-5 rounded-[1.5rem] border border-white/5">
                  <label className="text-[9px] font-black uppercase text-gray-500 tracking-widest block mb-3">Deployment Status</label>
                  <select 
                    value={formData.availabilityStatus}
                    onChange={(e) => setFormData({...formData, availabilityStatus: e.target.value})}
                    className="w-full bg-transparent text-sm font-black text-white outline-none cursor-pointer uppercase tracking-tighter"
                  >
                    <option value="available" className="bg-[#0d1f2f]">Active Fleet</option>
                    <option value="unavailable" className="bg-[#0d1f2f]">Maintenance / Offline</option>
                  </select>
                </div>
              </div>

              {/* Image Section */}
              <div className="space-y-4">
                <label className="text-[9px] font-black uppercase text-gray-500 tracking-widest block">Visual Telemetry (Current)</label>
                <div className="flex flex-wrap gap-3">
                  {existingImages.map((img, idx) => (
                    <div key={idx} className="relative w-20 h-20 rounded-2xl overflow-hidden border border-white/10 group">
                      <Image 
                        src={img} 
                        fill 
                        className="object-cover grayscale hover:grayscale-0 transition-all duration-500" 
                        alt="vehicle" 
                        unoptimized 
                      />
                    </div>
                  ))}
                  <div className="relative w-20 h-20 rounded-2xl border border-dashed border-white/10 flex items-center justify-center bg-white/5">
                    <ImageIcon className="text-gray-700" size={20} />
                  </div>
                </div>
                
                <div className="relative border-2 border-dashed border-white/5 rounded-[2rem] p-8 text-center hover:bg-white/5 transition-all cursor-pointer group">
                  <input 
                    type="file" multiple 
                    onChange={(e) => setSelectedFiles(e.target.files)}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <div className="inline-flex p-4 bg-red-600/10 rounded-full mb-3 group-hover:scale-110 transition-transform">
                    <Camera className="text-red-600" size={24} />
                  </div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic">Overwrite Visual Data</p>
                  <p className="text-[8px] text-gray-600 font-bold uppercase mt-1">Select new files to replace the existing image set</p>
                </div>
              </div>

              <div className="pt-6">
                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full group bg-red-600 text-white py-5 rounded-[1.5rem] font-black text-xs uppercase tracking-[0.3em] flex justify-center items-center hover:bg-red-700 transition-all shadow-xl shadow-red-900/20 disabled:bg-gray-800 disabled:text-gray-600"
                >
                  {loading ? (
                    <Loader2 className="animate-spin mr-2" />
                  ) : (
                    <>
                      <Save className="mr-3 group-hover:scale-110 transition-transform" size={18} />
                      Commit Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* System Note */}
        <div className="mt-8 flex items-start gap-4 p-6 bg-[#0d1f2f]/50 rounded-[2rem] border border-white/5">
          <Info className="text-red-600 shrink-0" size={20} />
          <p className="text-[9px] text-gray-500 font-bold uppercase leading-relaxed tracking-tight">
            Note: Changing the daily yield will only affect future bookings. Existing confirmed reservations will maintain their original rate at the time of booking.
          </p>
        </div>
      </div>
    </div>
  );
}