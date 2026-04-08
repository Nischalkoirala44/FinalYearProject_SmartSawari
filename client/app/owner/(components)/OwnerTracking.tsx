"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import dynamic from "next/dynamic";
import { 
 Activity, Navigation, Loader2 
} from "lucide-react";

interface BookingMapProps {
  destLat: number;
  destLng: number;
  hubName: string;
  showRoute: boolean;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const BookingMap = dynamic<BookingMapProps>(
  () => import("../../(renter)/(components)/BookingMap"), 
  {
    ssr: false,
    loading: () => (
      <div className="h-96 w-full bg-[#0f2435] animate-pulse rounded-3xl flex items-center justify-center">
        <Loader2 className="animate-spin text-red-600" size={32} />
      </div>
    ),
  }
);

interface TrackingData {
  lat: number;
  lng: number;
  timestamp: string;
}

const OwnerTracking = ({ bookingId, vehicleName }: { bookingId: string, vehicleName: string }) => {
  const [data, setData] = useState<TrackingData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchLiveLocation = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_URL}/api/vehicles/location/${bookingId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.success) {
        const locationData = res.data.location || res.data.data;
        setData({
          lat: parseFloat(locationData.lat),
          lng: parseFloat(locationData.lng),
          timestamp: locationData.timestamp || locationData.lastUpdated || new Date().toISOString()
        });
      }
    } catch (err: any) {
      console.error("Signal Lost:", err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (bookingId) {
      fetchLiveLocation();
      const interval = setInterval(fetchLiveLocation, 10000);
      return () => clearInterval(interval);
    }
  }, [bookingId]);

  return (
    <div className="bg-[#0b1a27] text-white p-8 rounded-[3rem] border border-white/10 shadow-2xl overflow-hidden w-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 border-b border-white/5 pb-6">
        <div className="flex items-center gap-4">
          <div className=" none p-4 bg-red-600/10 rounded-2xl border border-red-600/20">
          </div>
          <div>
            <h2 className="text-2xl font-black uppercase italic tracking-tighter">
              Asset <span className="text-red-600">Surveillance</span>
            </h2>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">
              Uplink Active • {vehicleName}
            </p>
          </div>
        </div>
        <div className="text-right">
            <p className="text-[9px] text-gray-600 uppercase font-black">Secure Tunnel</p>
            <p className="text-[10px] font-mono text-blue-400">{bookingId}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="space-y-4">
          <div className="bg-[#0d1f2f] p-6 rounded-[2rem] border border-white/5">
            <div className="flex items-center gap-3 mb-6 text-red-600">
              <Activity size={18} />
              <span className="text-xs font-black uppercase italic">Telemetry Logs</span>
            </div>
            
            <div className="space-y-6">
              <div>
                <p className="text-[9px] text-gray-500 uppercase font-black mb-1">Latitude</p>
                <p className="text-xl font-mono font-bold text-white tracking-tighter">
                    {data?.lat ? data.lat.toFixed(6) : "---.------"}
                </p>
              </div>
              <div>
                <p className="text-[9px] text-gray-500 uppercase font-black mb-1">Longitude</p>
                <p className="text-xl font-mono font-bold text-white tracking-tighter">
                    {data?.lng ? data.lng.toFixed(6) : "---.------"}
                </p>
              </div>
              <div className="pt-4 border-t border-white/5">
                <p className="text-[9px] text-gray-500 uppercase font-black mb-1">Last Transmission</p>
                <p className="text-[10px] font-mono text-emerald-400">
                  {data ? new Date(data.timestamp).toLocaleTimeString() : 'WAITING FOR PING...'}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 relative h-[450px]">
          {(!data && !loading) && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0d1f2f] rounded-[2.5rem] z-10 border border-dashed border-white/10">
              <Navigation className="text-gray-700 mb-3 animate-bounce" size={40} />
              <p className="text-xs text-gray-500 font-black uppercase tracking-widest">No Link Established</p>
            </div>
          )}
          
          <div className="rounded-[2.5rem] overflow-hidden border border-white/10 h-full shadow-inner">
            {data ? (
              <BookingMap 
                destLat={data.lat} 
                destLng={data.lng} 
                hubName="Live Location" 
                showRoute={false}
              />
            ) : (
                <div className="w-full h-full bg-[#07111a] flex items-center justify-center">
                    <Loader2 className="animate-spin text-white/10" size={48} />
                </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OwnerTracking;