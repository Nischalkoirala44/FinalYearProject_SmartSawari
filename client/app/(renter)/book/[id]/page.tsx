"use client";

import { useState, use, useEffect, useMemo } from "react";
import {
  CreditCard, Loader2, ShieldCheck, MapPin, 
  ArrowLeft, Calendar, Tag, Gauge, Star,
  Clock, Car, MessageCircle, X 
} from "lucide-react";
import { useAuth } from "../../../../context/AuthContext";
import { getPublicVehicleById } from "@/services/Vehicle";
import SmartChat from "../../../../components/ChatWindow"; 
import Image from "next/image";
import Link from "next/link";

export default function BookingPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const vehicleId = resolvedParams.id;
  const { user, token } = useAuth();

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [vehicle, setVehicle] = useState<any>(null);
  const [location, setLocation] = useState<any>(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isChatOpen, setIsChatOpen] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      const data = await getPublicVehicleById(vehicleId);
      if (data && data.success) {
        setVehicle(data.vehicle);
        if (data.vehicle?.locationId) {
          try {
            const locRes = await fetch(`http://localhost:3001/api/locations/${data.vehicle.locationId}`);
            const locData = await locRes.json();
            if (locData?.success) setLocation(locData.location);
          } catch { /* Fail silently */ }
        }
      }
      setFetching(false);
    };
    if (vehicleId) loadData();
  }, [vehicleId]);

  // SAFE IMAGE PARSING
  const images = useMemo(() => {
    if (!vehicle?.documentImage) return [];
    try {
      const data = typeof vehicle.documentImage === "string" 
        ? JSON.parse(vehicle.documentImage) 
        : vehicle.documentImage;
      return data.vehicleImages || [];
    } catch { return []; }
  }, [vehicle]);

  const { days, totalAmount } = useMemo(() => {
    if (!startDate || !endDate || !vehicle) return { days: 0, totalAmount: 0 };
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    const dayCount = diff > 0 ? diff : 0;
    return { days: dayCount, totalAmount: dayCount * Number(vehicle.pricePerDay) };
  }, [startDate, endDate, vehicle]);

  const handleBooking = async () => {
    if (!user?.id) return alert("Please log in to book.");
    setLoading(true);
    // ... booking intent logic
    setLoading(false);
  };

  if (fetching) return (
    <div className="min-h-screen bg-[#0a1620] flex items-center justify-center">
      <Loader2 className="animate-spin text-red-600" size={40} />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a1620] text-gray-100 pb-20 relative">
      <main className="max-w-6xl mx-auto px-6 pt-10 grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-10">
        <div className="flex flex-col gap-6">
          <Link href="/vehicles" className="flex items-center gap-2 text-[10px] font-black text-gray-500 hover:text-red-500 uppercase tracking-widest">
            <ArrowLeft size={14} /> Back to Fleet
          </Link>

          <div className="bg-[#0e1f2e] rounded-3xl overflow-hidden border border-gray-800 shadow-2xl relative">
            <div className="h-[480px] relative bg-gray-900 flex items-center justify-center">
              {images?.[0] ? (
                <Image src={images[0]} alt="Vehicle" fill className="object-cover" priority />
              ) : (
                <div className="text-8xl opacity-10">🚗</div>
              )}
            </div>
          </div>
          
          <div className="bg-[#0e1f2e] p-8 rounded-3xl border border-gray-800">
             <h2 className="text-4xl font-black uppercase text-white">{vehicle?.registrationNumber || "Vehicle Details"}</h2>
             <p className="text-gray-400 mt-2">{location?.locationName || "Main Hub"}</p>
          </div>
        </div>

        <aside className="relative">
          <div className="bg-[#0e1f2e] rounded-3xl border border-gray-800 p-8 sticky top-10 shadow-2xl">
            <h3 className="text-2xl font-black uppercase tracking-tighter mb-8">Reserve <span className="text-red-600">Ride</span></h3>
            
            <div className="space-y-4 mb-8">
                <label className="text-[10px] font-black uppercase text-gray-500">Pick-up Date</label>
                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full p-4 bg-gray-900 border border-gray-800 rounded-xl text-white outline-none focus:border-red-600" />
                <label className="text-[10px] font-black uppercase text-gray-500">Return Date</label>
                <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full p-4 bg-gray-900 border border-gray-800 rounded-xl text-white outline-none focus:border-red-600" />
            </div>

            <div className="mb-6 p-4 bg-gray-900/50 rounded-xl border border-gray-800">
               <div className="flex justify-between text-xs font-bold uppercase">
                  <span>Total</span>
                  <span className="text-red-600">Rs. {totalAmount.toLocaleString()}</span>
               </div>
            </div>

            <button onClick={handleBooking} disabled={loading || totalAmount <= 0} className="w-full py-6 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl transition-all disabled:opacity-50">
              {loading ? <Loader2 className="animate-spin mx-auto" /> : "Pay with eSewa"}
            </button>
          </div>
        </aside>
      </main>

      {/* FLOATING CHAT */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4">
        {isChatOpen && (
          <div className="w-[380px] h-[500px] animate-in slide-in-from-bottom-4 duration-300 shadow-2xl">
            <SmartChat bookingId={vehicleId} user={user} token={token} />
          </div>
        )}
        <button
          onClick={() => setIsChatOpen(!isChatOpen)}
          className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 shadow-2xl ${
            isChatOpen ? "bg-gray-800 rotate-90" : "bg-red-600 hover:scale-110"
          }`}
        >
          {isChatOpen ? <X size={28} className="text-white" /> : <MessageCircle size={28} className="text-white" />}
        </button>
      </div>
    </div>
  );
}