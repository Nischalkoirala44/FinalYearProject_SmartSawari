"use client";

import { useEffect, useState, useMemo } from "react";
import { fetchVehicles } from "@/services/Vehicle";
import {
  MapPin, Search, Filter, Star, Zap, ArrowRight, X, SlidersHorizontal, ChevronDown,
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
      const data = await fetchVehicles();
      if (data?.vehicles) setVehicles(data.vehicles);
      setLoading(false);
    };
    getVehicles();
  }, []);

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

const filteredVehicles = useMemo(() => {
  let result = vehicles.filter((v) => {
    const s = searchQuery.toLowerCase();

    const matchesSearch =
      v.registrationNumber?.toLowerCase().includes(s) ||
      v.location?.city?.toLowerCase().includes(s);

    const matchesType = selectedType === "All" || v.vehicleType === selectedType;

    const matchesPrice = Number(v.pricePerDay) <= maxPrice;

    return matchesSearch && matchesType && matchesPrice;
  });

  if (sortBy === "priceLow") {
    result = result.sort((a, b) => a.pricePerDay - b.pricePerDay);
  }

  if (sortBy === "priceHigh") {
    result = result.sort((a, b) => b.pricePerDay - a.pricePerDay);
  }

  return result;
}, [vehicles, searchQuery, selectedType, maxPrice, sortBy]);

  if (loading) return <MarketplaceSkeleton />;

  return (
    <div className="flex flex-col flex-1 h-full overflow-hidden bg-[#0b1a27]">

{/* ═══════════════ MARKETPLACE SEARCH + FILTER BAR ═══════════════ */}
<div className="sticky top-0 z-40 bg-[#0a1620]/95 backdrop-blur-md border-b border-white/10">

  <div className="max-w-7xl mx-auto px-4 md:px-8 py-5 flex flex-col gap-4">

    {/* ───────── SEARCH ROW ───────── */}
    <div className="flex flex-col md:flex-row gap-3 items-center">

      {/* SEARCH */}
      <div className="flex items-center flex-1 bg-[#0f2435] border border-white/10 rounded-2xl px-4 py-3 focus-within:border-red-500/70 transition">

        <Search size={16} className="text-gray-500 mr-3" />

        <input
          type="text"
          placeholder="Search vehicle number or city..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="bg-transparent outline-none text-sm text-gray-200 placeholder-gray-500 w-full"
        />

        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="text-gray-500 hover:text-white"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* SORT */}
      <div className="flex items-center bg-[#0f2435] border border-white/10 rounded-xl px-3 py-2">

        <SlidersHorizontal size={14} className="text-gray-400 mr-2" />

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="bg-transparent text-xs text-gray-300 outline-none"
        >
          <option className="bg-[#0f2435] text-white-100" value="default">Sort</option>
          <option className="bg-[#0f2435] text-white-100" value="priceLow">Price: Low → High</option>
          <option className="bg-[#0f2435] text-white-100" value="priceHigh">Price: High → Low</option>
        </select>

      </div>

      {/* FILTER BUTTON */}
      <button
        onClick={() => setFilterOpen(!filterOpen)}
        className="flex items-center gap-2 px-4 py-3 bg-red-600 text-white-100 hover:bg-red-700 rounded-xl text-xs font-bold uppercase tracking-wide transition"
      >
        <Filter size={14} />
        Filters
      </button>

    </div>


    {/* ───────── FILTER PANEL ───────── */}
    {filterOpen && (

      <div className="bg-[#0f2435] border border-white/10 rounded-2xl p-5 flex flex-col gap-6">

        {/* VEHICLE TYPES */}
        <div className="flex flex-wrap items-center gap-2">

          <span className="text-xs text-gray-400 font-semibold mr-2">
            Vehicle Type
          </span>

          {["All", "Car", "Bike", "Scooter"].map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold transition
              ${
                selectedType === type
                  ? "bg-red-600 text-white"
                  : "bg-[#0b1a27] border border-white/10 text-gray-400 hover:text-white"
              }`}
            >
              <span>{VEHICLE_ICONS[type] ?? "🚗"}</span>
              {type}
            </button>
          ))}

        </div>


        {/* PRICE SLIDER */}
        <div className="flex flex-col gap-2">

          <div className="flex justify-between text-xs text-gray-400">

            <span>Max Price Per Day</span>

            <span className="text-red-400 font-bold">
              Rs. {maxPrice.toLocaleString()}
            </span>

          </div>

          <input
            type="range"
            min="500"
            max="15000"
            step="500"
            value={maxPrice}
            onChange={(e) => setMaxPrice(parseInt(e.target.value))}
            className="accent-red-600"
          />

        </div>


        {/* ACTIVE FILTERS */}
        <div className="flex flex-wrap items-center gap-2">

          {(selectedType !== "All" || maxPrice !== 15000 || searchQuery) && (
            <button
              onClick={() => {
                setSelectedType("All");
                setMaxPrice(15000);
                setSearchQuery("");
                setSortBy("default");
              }}
              className="text-xs px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 text-gray-300 transition"
            >
              Clear Filters
            </button>
          )}

        </div>

      </div>

    )}

  </div>

</div>

      {/* ══ MAIN CONTENT ══ */}
      <main className="flex-1 overflow-y-auto bg-[#0b1a27] custom-scrollbar">
        <div className="px-4 sm:px-6 md:px-8 py-6 md:py-8">

          {/* Header row */}
          <div className="flex items-end justify-between mb-6 md:mb-8">
            <div>
              <h2 className="text-3xl md:text-4xl font-black tracking-tighter text-white uppercase italic leading-none">
                Available <span className="text-red-600">Fleet</span>
              </h2>
              <p className="text-xs text-gray-500 mt-1.5 font-medium">
                {filteredVehicles.length} unit{filteredVehicles.length !== 1 ? "s" : ""} ready to deploy
              </p>
            </div>
          </div>

          {/* Grid */}
          {filteredVehicles.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 md:gap-6">
              {filteredVehicles.map((vehicle) => {
                const mainImage = getVehicleThumbnail(vehicle.documentImage);
                const isBooked = vehicle.currentAvailability === "booked";
                const accent = TYPE_ACCENT[vehicle.vehicleType] ?? "#ef4444";
                const pillStyle = TYPE_PILL[vehicle.vehicleType] ?? TYPE_PILL.Car;

                return (
                  <div
                    key={vehicle.id}
                    className={`group relative flex flex-col bg-[#0d1f2f] rounded-3xl overflow-hidden border transition-all duration-500 ${isBooked
                      ? "opacity-45 border-white/5"
                      : "border-white/8 hover:border-white/20 hover:-translate-y-1 hover:shadow-2xl"
                      }`}
                    style={
                      !isBooked
                        ? { "--tw-shadow-color": `${accent}18` } as React.CSSProperties
                        : {}
                    }
                  >
                    {/* ── IMAGE STAGE ──
                        object-contain so the full vehicle is always visible
                        dark gradient stage background */}
                    <div className="relative w-full bg-gradient-to-b from-[#0d1e2c] to-[#091319] overflow-hidden"
                      style={{ height: "220px" }}>

                      {mainImage ? (
                        <Image
                          src={mainImage}
                          alt="Vehicle"
                          fill
                          className="object-contain p-4 transition-transform duration-700 group-hover:scale-105"
                          unoptimized
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-7xl opacity-20">{VEHICLE_ICONS[vehicle.vehicleType] || "🚗"}</span>
                        </div>
                      )}

                      {/* Subtle bottom vignette */}
                      <div className="absolute bottom-0 inset-x-0 h-16 bg-gradient-to-t from-[#0d1f2f] to-transparent" />

                      {/* Type badge — top left */}
                      <div className="absolute top-3.5 left-3.5">
                        <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${pillStyle}`}>
                          {vehicle.vehicleType}
                        </span>
                      </div>

                      {/* Booked overlay */}
                      {isBooked && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-[1px]">
                          <span className="px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-gray-600 bg-gray-900/80 text-gray-400">
                            Reserved
                          </span>
                        </div>
                      )}

                      {/* Rating — top right */}
                      {!isBooked && (
                        <div className="absolute top-3.5 right-3.5 flex items-center gap-1 bg-black/50 backdrop-blur-md border border-white/10 rounded-full px-2.5 py-1">
                          <Star size={10} className="text-amber-400 fill-amber-400" />
                          <span className="text-[10px] font-bold text-white">4.8</span>
                        </div>
                      )}
                    </div>

                    {/* ── DETAILS PANEL ── */}
                    <div className="flex flex-col gap-4 p-5 flex-1">

                      {/* Name + location */}
                      <div>
                        <h3 className="text-base font-black text-white uppercase tracking-tight truncate leading-tight">
                          {vehicle.registrationNumber}
                        </h3>
                        <div className="flex items-center gap-1.5 mt-1">
                          <MapPin size={11} style={{ color: accent }} />
                          <span className="text-[11px] text-gray-500 font-medium truncate">
                            {vehicle.location?.city || "Nepal"}
                          </span>
                        </div>
                      </div>

                      {/* Thin accent divider */}
                      <div
                        className="h-px w-full rounded-full opacity-30"
                        style={{ background: `linear-gradient(to right, ${accent}, transparent)` }}
                      />

                      {/* Price + CTA */}
                      <div className="flex items-center justify-between gap-2 mt-auto">
                        <div>
                          <p className="text-[8px] font-black uppercase tracking-[0.18em] text-gray-600 mb-0.5">/ day</p>
                          <p className="text-lg font-black text-white leading-none">
                            Rs.{" "}
                            <span style={{ color: accent }}>
                              {Number(vehicle.priceDay || vehicle.pricePerDay).toLocaleString()}
                            </span>
                          </p>
                        </div>

                        <Link
                          href={isBooked ? "#" : `/book/${vehicle.id}`}
                          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 shrink-0 ${isBooked
                            ? "bg-white/5 text-gray-600 cursor-not-allowed border border-white/5"
                            : "text-white shadow-lg hover:brightness-110"
                            }`}
                          style={
                            !isBooked
                              ? {
                                background: `linear-gradient(135deg, ${accent}ee, ${accent}99)`,
                                boxShadow: `0 6px 20px ${accent}25`,
                              }
                              : {}
                          }
                        >
                          {isBooked ? "N/A" : "Book"}
                          {!isBooked && <ArrowRight size={11} />}
                        </Link>
                      </div>
                    </div>

                    {/* Bottom accent glow line on hover */}
                    {!isBooked && (
                      <div
                        className="absolute bottom-0 inset-x-0 h-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                        style={{ background: `linear-gradient(to right, transparent, ${accent}, transparent)` }}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-32 text-center">
              <Search size={32} className="text-gray-700 mb-4" />
              <h3 className="text-lg font-bold text-white uppercase tracking-wide">No Fleet Matches</h3>
              <p className="text-xs text-gray-600 mt-2">Try adjusting your filters or search query</p>
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
      <div className="w-16 h-16 rounded-full border-4 border-red-900/30 border-t-red-600 animate-spin mb-4" />
      <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Deploying Fleet...</p>
    </div>
  );
}
