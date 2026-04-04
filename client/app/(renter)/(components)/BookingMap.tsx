"use client";

import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
// @ts-ignore
import "leaflet/dist/leaflet.css";
import { useEffect, useState } from "react";
import RoutingMachine from "./RoutingMachine";
import { Timer, Map as MapIcon, Shield, Navigation, AlertTriangle } from "lucide-react";

const hubIcon = L.icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const userIcon = L.icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

export default function BookingMap({ destLat, destLng, hubName }: any) {
  const [userPos, setUserPos] = useState<[number, number] | null>(null);
  const [stableUserPos, setStableUserPos] = useState<[number, number] | null>(null);
  const [summary, setSummary] = useState<{ distance: number; time: number } | null>(null);
  const [showSteps, setShowSteps] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setGeoError("Browser does not support Geolocation");
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        setUserPos([pos.coords.latitude, pos.coords.longitude]);
        setGeoError(null);
      },
      (err) => {
        let msg = "Location Access Denied";
        if (err.code === err.POSITION_UNAVAILABLE) msg = "GPS Signal Unavailable";
        if (err.code === err.TIMEOUT) msg = "Location Request Timed Out";
        console.error("Location Error:", msg, err);
        setGeoError(msg);
      },
      { 
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0 
      }
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  const hasMoved = (a: any, b: any) => {
    if (!a || !b) return true;
    const dx = a[0] - b[0];
    const dy = a[1] - b[1];
    return Math.sqrt(dx * dx + dy * dy) > 0.0003;
  };

  useEffect(() => {
    if (userPos && hasMoved(userPos, stableUserPos)) {
      setStableUserPos(userPos);
    }
  }, [userPos, stableUserPos]);

  const toggleSteps = () => {
    const container = document.querySelector('.smart-sawari-itinerary');
    if (container) {
      container.classList.toggle('hidden');
      setShowSteps(!showSteps);
    }
  };

  return (
    <div className="relative h-[450px] w-full rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl bg-[#0b1a27]">
      
      {/* Geolocation Error Overlay */}
      {geoError && (
        <div className="absolute bottom-20 left-6 z-[1000] flex items-center gap-3 bg-red-600/90 backdrop-blur-md px-4 py-2 rounded-xl border border-red-400/20 text-white shadow-2xl animate-in fade-in slide-in-from-left-4">
          <AlertTriangle size={14} />
          <span className="text-[10px] font-black uppercase tracking-widest">{geoError}</span>
        </div>
      )}

      {/* Floating Summary UI */}
      {summary && (
        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-[1000] flex gap-4 bg-[#0d1f2f]/90 backdrop-blur-xl px-6 py-4 rounded-3xl border border-white/10 shadow-2xl">
          <div className="flex items-center gap-3 border-r pr-4 border-white/10">
            <div className="p-2 bg-red-600/20 rounded-lg"><MapIcon size={18} className="text-red-500" /></div>
            <div>
              <span className="text-[10px] text-gray-500 uppercase">Range</span>
              <div className="text-sm font-bold text-white">{summary.distance.toFixed(1)} KM</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg"><Timer size={18} className="text-emerald-500" /></div>
            <div>
              <span className="text-[10px] text-gray-500 uppercase">Arrival</span>
              <div className="text-sm font-bold text-white">{Math.round(summary.time)} MINS</div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW STEPS TOGGLE BUTTON */}
      <button 
        onClick={toggleSteps}
        disabled={!stableUserPos}
        className={`absolute bottom-6 right-6 z-[1000] px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl transition-all active:scale-95 flex items-center gap-2 ${
          stableUserPos 
          ? "bg-red-600 hover:bg-red-700 text-white" 
          : "bg-gray-800 text-gray-500 cursor-not-allowed opacity-50"
        }`}
      >
        <Navigation size={14} fill={stableUserPos ? "currentColor" : "none"} />
        {showSteps ? "Close Manifest" : "View Steps"}
      </button>

      <MapContainer
        center={[destLat, destLng]}
        zoom={13}
        style={{ height: "100%", width: "100%" }}
        zoomControl={false}
      >
        <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />

        <Marker position={[destLat, destLng]} icon={hubIcon}>
          <Popup><b>Vehicle Hub: {hubName}</b></Popup>
        </Marker>

        {stableUserPos && (
          <>
            <Marker position={stableUserPos} icon={userIcon}>
              <Popup><b>Your Location</b></Popup>
            </Marker>
            <RoutingMachine
              userPos={stableUserPos}
              destPos={[destLat, destLng]}
              onSummaryFetched={setSummary}
            />
          </>
        )}
      </MapContainer>

      <div className="absolute bottom-6 left-6 z-[1000] flex items-center gap-2 px-4 py-2 rounded-full border border-white/5 bg-[#0d1f2f]/50 backdrop-blur-md">
        <Shield size={12} className="text-red-600" />
        <span className="text-[8px] font-black uppercase tracking-widest text-gray-400">
          Smart Sawari Tracking
        </span>
      </div>
    </div>
  );
}