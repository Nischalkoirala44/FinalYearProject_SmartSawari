"use client";

import { useEffect, useState } from "react";
import { fetchVehicles } from "@/services/Vehicle";
import {
  MapPin, Search, Filter, Star, ArrowRight, X, SlidersHorizontal,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

const VEHICLE_ICONS: Record<string, string> = {
  Car: "🚗", Bike: "🏍️", Scooter: "🛵",
};

const TYPE_ACCENT: Record<string, string> = {
  Car: "#ef4444",
  Bike: "#f59e0b",
  Scooter: "#10b981",
};

const TYPE_PILL: Record<string, string> = {
  Car: "bg-red-500/10 border-red-500/30 text-red-400",
  Bike: "bg-amber-500/10 border-amber-500/30 text-amber-400",
  Scooter: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400",
};

export default function VehicleMarketplace() {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("All");
  const [maxPrice, setMaxPrice] = useState(15000);
  const [filterOpen, setFilterOpen] = useState(false);
  const [sortBy, setSortBy] = useState("default");

  useEffect(() => {
    const getVehicles = async () => {
      setLoading(true);
      const data = await fetchVehicles({
        search: searchQuery,
        type: selectedType,
        maxPrice: maxPrice,
        sortBy: sortBy
      });
      if (data?.vehicles) setVehicles(data.vehicles);
      setLoading(false);
    };

    const delayDebounceFn = setTimeout(() => {
      getVehicles();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, selectedType, maxPrice, sortBy]);

  const getVehicleThumbnail = (docImage: any) => {
    if (!docImage) return null;
    try {
      const data = typeof docImage === "string" ? JSON.parse(docImage) : docImage;
      if (data.vehicleImages?.length > 0) return data.vehicleImages[0];
    } catch (e) {
      console.error(e);
    }
    return null;
  };

  const displayVehicles = vehicles;

  return (
    <div className="flex flex-col flex-1 h-full overflow-hidden bg-[#0b1a27]">
      {/* SEARCH + FILTER BAR */}
      <div className="sticky top-0 z-40 bg-[#0a1620]/95 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-5 flex flex-col gap-4">
          <div className="flex flex-col md:flex-row gap-3 items-center">
            <div className="flex items-center flex-1 bg-[#0f2435] border border-white/10 rounded-2xl px-4 py-3 focus-within:border-red-500/70 transition">
              <Search size={16} className="text-gray-500 mr-3" />
              <input
                type="text"
                placeholder="Search by city name or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent outline-none text-sm text-gray-200 placeholder-gray-500 w-full"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} className="text-gray-500 hover:text-white">
                  <X size={16} />
                </button>
              )}
            </div>

            <div className="flex items-center bg-[#0f2435] border border-white/10 rounded-xl px-3 py-2">
              <SlidersHorizontal size={14} className="text-gray-400 mr-2" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent text-xs text-gray-300 outline-none cursor-pointer"
              >
                <option className="bg-[#0f2435]" value="default">Sort</option>
                <option className="bg-[#0f2435]" value="priceLow">Price: Low → High</option>
                <option className="bg-[#0f2435]" value="priceHigh">Price: High → Low</option>
              </select>
            </div>

            <button
              onClick={() => setFilterOpen(!filterOpen)}
              className="flex items-center gap-2 px-4 py-3 bg-red-600 text-white hover:bg-red-700 rounded-xl text-xs font-bold uppercase tracking-wide transition"
            >
              <Filter size={14} />
              Filters
            </button>
          </div>

          {filterOpen && (
            <div className="bg-[#0f2435] border border-white/10 rounded-2xl p-5 flex flex-col gap-6 animate-in fade-in slide-in-from-top-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs text-gray-400 font-semibold mr-2">Vehicle Type</span>
                {["All", "Car", "Bike", "Scooter"].map((type) => (
                  <button
                    key={type}
                    onClick={() => setSelectedType(type)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold transition ${selectedType === type ? "bg-red-600 text-white" : "bg-[#0b1a27] border border-white/10 text-gray-400"
                      }`}
                  >
                    <span>{VEHICLE_ICONS[type] ?? "🚗"}</span> {type}
                  </button>
                ))}
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex justify-between text-xs text-gray-400">
                  <span>Max Price Per Day</span>
                  <span className="text-red-400 font-bold">Rs. {maxPrice.toLocaleString()}</span>
                </div>
                <input
                  type="range" min="500" max="15000" step="500"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(parseInt(e.target.value))}
                  className="accent-red-600"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/*  MAIN CONTENT */}
      <main className="flex-1 overflow-y-auto bg-[#0b1a27] custom-scrollbar">
        <div className="px-4 sm:px-6 md:px-8 py-6 md:py-8">
          <div className="mb-8">
            <h2 className="text-3xl md:text-4xl font-black tracking-tighter text-white uppercase italic leading-none">
              Available <span className="text-red-600">Fleet</span>
            </h2>
            <p className="text-xs text-gray-500 mt-1.5 font-medium uppercase tracking-widest">
              {displayVehicles.length} units ready for deployment
            </p>
          </div>

          {displayVehicles.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {displayVehicles.map((vehicle) => {
                const mainImage = getVehicleThumbnail(vehicle.documentImage);
                const accent = TYPE_ACCENT[vehicle.vehicleType] ?? "#ef4444";
                const pillStyle = TYPE_PILL[vehicle.vehicleType] ?? TYPE_PILL.Car;

                return (
                  <div
                    key={vehicle.id}
                    className="group relative flex flex-col bg-[#0d1f2f] rounded-[2rem] overflow-hidden border border-white/5 transition-all duration-500 hover:border-white/20 hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(0,0,0,0.6)]"
                    style={{ "--glow-color": `${accent}33` } as any}
                  >
                    {/* IMAGE SECTION: "THE FULL STAGE" */}
                    <div className="relative w-full h-[280px] bg-[#07111a] overflow-hidden">
                      {/* Background Glow */}
                      <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_center,_var(--glow-color)_0%,_transparent_80%)]" />

                      {mainImage ? (
                        <Image
                          src={mainImage}
                          alt="Vehicle"
                          fill
                          className="object-cover transition-transform duration-700 group-hover:scale-110"
                          unoptimized
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-8xl opacity-10">
                          {VEHICLE_ICONS[vehicle.vehicleType]}
                        </div>
                      )}

                      {/* CINEMATIC OVERLAYS */}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0d1f2f] via-transparent to-transparent opacity-90" />
                      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-transparent opacity-50" />

                      {/* TYPE BADGE */}
                      <div className="absolute top-5 left-5 z-10">
                        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border border-white/10 backdrop-blur-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl ${pillStyle}`}>
                          {vehicle.vehicleType}
                        </div>
                      </div>
                    </div>

                    {/* DETAILS SECTION */}
                    <div className="px-7 py-6 flex flex-col flex-1 bg-[#0d1f2f]">
                      <div className="mb-5">
                        <h3 className="text-2xl font-black text-white uppercase tracking-tighter leading-none mb-2">
                          {vehicle.registrationNumber}
                        </h3>
                        <div className="flex items-center gap-2">
                          <MapPin size={14} style={{ color: accent }} />
                          <span className="text-xs font-bold uppercase tracking-widest text-gray-500">
                            {vehicle.location?.city || "Nepal"}
                          </span>
                        </div>
                      </div>

                      {/* SPACER / DIVIDER */}
                      <div className="h-px w-full bg-gradient-to-r from-white/10 via-white/5 to-transparent mb-6" />

                      {/* PRICING & ACTION */}
                      <div className="flex items-center justify-between mt-auto">
                        <div>
                          <span className="text-[10px] font-black text-gray-600 uppercase tracking-[0.2em] block mb-1">Rate / Day</span>
                          <div className="flex items-baseline gap-1">
                            <span className="text-sm font-bold text-gray-400">Rs.</span>
                            <span className="text-3xl font-black text-white italic">
                              {Number(vehicle.pricePerDay).toLocaleString()}
                            </span>
                          </div>
                        </div>

                        <Link
                          href={`/book/${vehicle.id}`}
                          className="group/btn relative flex items-center justify-center w-16 h-16 rounded-[1.5rem] transition-all duration-300 hover:rotate-6 active:scale-90 shadow-2xl"
                          style={{ background: `linear-gradient(135deg, ${accent}, ${accent}aa)` }}
                        >
                          <ArrowRight size={28} className="text-white group-hover/btn:translate-x-1 transition-transform" />
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-32 text-center">
              <Search size={40} className="text-gray-800 mb-4" />
              <h3 className="text-xl font-black text-white uppercase tracking-widest">No Matches Found</h3>
              <p className="text-xs text-gray-600 mt-2 uppercase font-bold">Try adjusting filters or search query</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function MarketplaceSkeleton() {
  return (
    <div className="flex-1 bg-[#0b1a27] flex flex-col items-center justify-center h-[80vh]">
      <div className="w-12 h-12 rounded-full border-2 border-red-900/20 border-t-red-600 animate-spin mb-4" />
      <p className="text-[10px] font-black text-gray-600 uppercase tracking-[0.3em]">Syncing Fleet</p>
    </div>
  );
}