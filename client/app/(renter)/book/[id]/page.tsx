"use client";

import { useState, use, useEffect, useMemo } from "react";
import {
  CreditCard, Loader2, ShieldCheck, MapPin,
  ArrowLeft, Calendar, Tag, Gauge, Star,
  Clock, Car, MessageCircle, X
} from "lucide-react";
import { useAuth } from "../../../../context/AuthContext";
import { getPublicVehicleById } from "@/services/Vehicle";
import Image from "next/image";
import Link from "next/link";
import SmartChat from "../../../../components/ChatWindow";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export default function BookingPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const vehicleId = resolvedParams.id;
  const { user, token } = useAuth();
  const userId = user?.id;

  const [loading, setLoading] = useState(false);
  const [owner, setOwner] = useState<{ ownerName: string; ownerImage: string } | null>(null);
  const [fetching, setFetching] = useState(true);
  const [vehicle, setVehicle] = useState<any>(null);
  const [location, setLocation] = useState<any>(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isChatOpen, setIsChatOpen] = useState(false); // UI State for Floating Chat
  const [ownerName, setOwnerName] = useState("");
  const [ownerImage, setOwnerImage] = useState("");


  useEffect(() => {
    if (vehicle) console.log("Vehicle data:", vehicle);
  }, [vehicle]);

  useEffect(() => {
    const loadData = async () => {
      const data = await getPublicVehicleById(vehicleId);
      if (data && data.success) {
        setVehicle(data.vehicle);
        if (data.vehicle?.id && token) {
          try {
            const ownerRes = await fetch(`${API_URL}/api/chat/owner/${data.vehicle.id}`, {
              headers: { "Authorization": `Bearer ${token}` }
            });
            const ownerData = await ownerRes.json();
            if (ownerData.success) setOwner(ownerData.owner);
            console.log("Owner data:", ownerData);
          } catch { /* Fail silently */ }
        }
        if (data.vehicle?.locationId) {
          try {
            const locRes = await fetch(`${API_URL}/api/locations/${data.vehicle.locationId}`);
            const locData = await locRes.json();
            if (locData?.success) setLocation(locData.location);
          } catch { /* Fail silently */ }
        }
      }
      setFetching(false);
    };
    if (vehicleId) loadData();
  }, [vehicleId]);

  const locationDisplay = location
    ? [location.locationName].filter(Boolean).join(", ")
    : vehicle?.locationId ? `Location #${vehicle.locationId}` : "Main Hub";

  const getVehicleThumbnail = (docImage: any): string[] => {
    if (!docImage) return [];
    try {
      const data = typeof docImage === "string" ? JSON.parse(docImage) : docImage;
      return data.vehicleImages ?? [];
    } catch { return []; }
  };

  const { days, totalAmount } = useMemo(() => {
    if (!startDate || !endDate || !vehicle) return { days: 0, totalAmount: 0 };
    const start = new Date(startDate);
    const end = new Date(endDate);
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);
    const diff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    const dayCount = diff > 0 ? diff : 0;
    return { days: dayCount, totalAmount: dayCount * Number(vehicle.pricePerDay) };
  }, [startDate, endDate, vehicle]);

  const handleBooking = async () => {
    if (!userId) return alert("Please log in to book.");
    if (totalAmount <= 0) return alert("Please select valid dates.");
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/bookings/intent`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ vehicleId, renterId: userId, startDate, endDate, totalAmount }),
      });
      const data = await response.json();
      if (data.success) {
        const form = document.createElement("form");
        form.method = "POST";
        form.action = "https://rc-epay.esewa.com.np/api/epay/main/v2/form";
        const fields: any = {
          amount: totalAmount, tax_amount: "0", total_amount: totalAmount,
          transaction_uuid: data.bookingId, product_code: "EPAYTEST",
          product_service_charge: "0", product_delivery_charge: "0",
          success_url: `${API_URL}/api/bookings/verify-esewa`,
          failure_url: `${window.location.origin}/payment-failed`,
          signed_field_names: "total_amount,transaction_uuid,product_code",
          signature: data.signature,
        };
        Object.entries(fields).forEach(([key, value]) => {
          const input = document.createElement("input");
          input.type = "hidden"; input.name = key; input.value = String(value);
          form.appendChild(input);
        });
        document.body.appendChild(form);
        form.submit();
      }
    } catch { alert("Connection failed."); } finally { setLoading(false); }
  };

  if (fetching) return (
    <div className="min-h-[70vh] bg-[#0a1620] flex flex-col items-center justify-center gap-4">
      <div className="w-12 h-12 rounded-full border-4 border-gray-800 border-t-red-600 animate-spin" />
      <p className="text-xs font-bold text-gray-500 uppercase tracking-widest text-white/50">Warming up the engines...</p>
    </div>
  );

  const images = getVehicleThumbnail(vehicle?.documentImage);
  const isAvailable = vehicle?.availabilityStatus === "available" || vehicle?.currentAvailability === "available";

  return (
    <div className="min-h-screen bg-[#0a1620] text-gray-100 pb-20 relative overflow-x-hidden">
      <main className="max-w-6xl mx-auto px-6 pt-10 grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-10">

        {/* LEFT: INFO & GALLERY */}
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-4 px-2">
            <Link href="/vehicles" className="flex items-center gap-2 text-[10px] font-black text-gray-500 hover:text-red-500 transition-colors uppercase tracking-[0.2em]">
              <ArrowLeft size={14} /> Back to Fleet
            </Link>
            <span className="text-gray-800">/</span>
            <span className="text-[10px] font-black text-red-600 uppercase tracking-[0.2em]">{vehicle?.vehicleType}</span>
          </div>

          <div className="bg-[#0e1f2e] rounded-3xl overflow-hidden border border-gray-800 shadow-2xl relative group">
            <div className="h-[480px] relative bg-gray-900 flex items-center justify-center overflow-hidden">
              {images?.[0] ? (
                <Image src={images[0]} alt="Vehicle" fill className="object-cover transition-transform duration-1000 group-hover:scale-105" priority />
              ) : (
                <div className="text-8xl opacity-10">🚗</div>
              )}
              <div className={`absolute top-6 right-6 z-10 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] backdrop-blur-md border shadow-lg ${isAvailable ? "bg-green-500/10 border-green-500/20 text-green-500" : "bg-red-500/10 border-red-500/20 text-red-500"}`}>
                {isAvailable ? "Available" : "Reserved"}
              </div>
            </div>
          </div>

          <div className="bg-[#0e1f2e] rounded-3xl border border-gray-800 p-8 shadow-xl">
            <h2 className="text-5xl font-black tracking-tighter text-white uppercase leading-none mb-4">{vehicle?.registrationNumber}</h2>
            <div className="flex items-center gap-2 text-gray-400 font-bold text-sm">
              <MapPin size={16} className="text-red-600" /> {locationDisplay}
            </div>
          </div>
        </div>

        {/* RIGHT: BOOKING CARD */}
        <aside className="relative">
          <div className="bg-[#0e1f2e] rounded-3xl border border-gray-800 p-8 sticky top-10 shadow-2xl">
            <h3 className="text-2xl font-black uppercase tracking-tighter text-white mb-8 border-b border-gray-800 pb-4">
              Reserve <span className="text-red-600">Ride</span>
            </h3>

            <div className="space-y-5 mb-10">
              <input type="date" value={startDate} min={new Date().toISOString().split("T")[0]} onChange={(e) => setStartDate(e.target.value)} className="w-full px-6 py-5 bg-gray-900 border border-gray-800 rounded-2xl outline-none text-sm font-bold text-white focus:border-red-600 transition-all" />
              <input type="date" value={endDate} min={startDate || new Date().toISOString().split("T")[0]} onChange={(e) => setEndDate(e.target.value)} className="w-full px-6 py-5 bg-gray-900 border border-gray-800 rounded-2xl outline-none text-sm font-bold text-white focus:border-red-600 transition-all" />
            </div>

            <div className="bg-gray-900/50 rounded-[2rem] p-8 mb-10 border border-gray-800">
              <div className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-600 mb-2">Grand Total</div>
              <div className="text-4xl font-black text-white tracking-tighter">
                <span className="text-red-600 text-lg mr-1">Rs.</span>
                {totalAmount > 0 ? totalAmount.toLocaleString() : "0"}
              </div>
            </div>

            <button onClick={handleBooking} disabled={loading || totalAmount <= 0 || !userId} className="w-full py-6 bg-red-600 hover:bg-red-700 disabled:opacity-30 text-white rounded-[1.25rem] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 shadow-2xl shadow-red-900/20 active:scale-95">
              {loading ? <Loader2 className="animate-spin" size={20} /> : <><CreditCard size={18} /> Pay with eSewa</>}
            </button>
          </div>
        </aside>
      </main>

      {/* --- FLOATING SMART CHAT RESTORED --- */}
      <div className="fixed bottom-8 right-8 z-[100] flex flex-col items-end gap-4">
        {isChatOpen && (
          <div className="w-[400px] h-[550px] bg-[#0e1f2e] border border-gray-800 rounded-[2rem] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] animate-in slide-in-from-bottom-5 duration-300">
            <SmartChat
              bookingId={vehicleId}
              user={user}
              token={token}
              ownerName={owner?.ownerName || ""}
              ownerImage={owner?.ownerImage || ""}
            />
          </div>
        )}

        <button
          onClick={() => setIsChatOpen(!isChatOpen)}
          className={`w-16 h-16 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 active:scale-90 ${isChatOpen
            ? "bg-gray-800 text-white rotate-90"
            : "bg-red-600 text-white hover:bg-red-700 hover:scale-110"
            }`}
        >
          {isChatOpen ? <X size={28} /> : <MessageCircle size={28} />}
        </button>
      </div>
    </div>
  );
}