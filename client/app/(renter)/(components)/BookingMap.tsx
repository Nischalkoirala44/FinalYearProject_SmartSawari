"use client";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect, useState } from "react";
import RoutingMachine from "./RoutingMachine";
import { Timer, Map as MapIcon } from "lucide-react";

export default function BookingMap({ destLat, destLng, hubName }: any) {
  const [userPos, setUserPos] = useState<[number, number] | null>(null);
  const [summary, setSummary] = useState<{ distance: number; time: number } | null>(null);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => setUserPos([pos.coords.latitude, pos.coords.longitude]),
      (err) => console.error("Location blocked", err)
    );
  }, []);

  return (
    <div className="relative h-[450px] w-full rounded-3xl overflow-hidden border-4 border-white shadow-xl">
      {/* Floating Info Badge */}
      {summary && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] flex gap-3 bg-white/80 backdrop-blur-md px-6 py-3 rounded-2xl border border-white shadow-lg animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="flex items-center gap-2 border-r pr-3 border-gray-200">
            <MapIcon size={16} className="text-blue-600" />
            <span className="text-sm font-black text-gray-900">{summary.distance.toFixed(1)} km</span>
          </div>
          <div className="flex items-center gap-2">
            <Timer size={16} className="text-emerald-600" />
            <span className="text-sm font-black text-gray-900">{summary.time} mins</span>
          </div>
        </div>
      )}

      <MapContainer center={[destLat, destLng]} zoom={13} style={{ height: "100%" }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        
        {/* Hub Marker */}
        <Marker position={[destLat, destLng]} icon={L.icon({
          iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
          iconSize: [25, 41], iconAnchor: [12, 41],
        })}>
          <Popup><b>Pickup: {hubName}</b></Popup>
        </Marker>

        {userPos && (
          <>
            {/* User Marker */}
            <Marker position={userPos} icon={L.icon({
              iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
              iconSize: [25, 41], iconAnchor: [12, 41],
            })}>
              <Popup><b>Your Location</b></Popup>
            </Marker>

            <RoutingMachine 
              userPos={userPos} 
              destPos={[destLat, destLng]} 
              onSummaryFetched={setSummary} 
            />
          </>
        )}
      </MapContainer>
    </div>
  );
}