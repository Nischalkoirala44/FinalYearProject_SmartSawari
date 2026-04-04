"use client";
import { useEffect, useRef, useState } from "react";
import { MapPinOff, Loader2 } from "lucide-react";

export default function RenterBeacon({ bookingId, token }: { bookingId: number, token: string }) {
  const [status, setStatus] = useState<"active" | "denied" | "syncing">("syncing");
  const lastCoords = useRef<{ lat: number; lng: number } | null>(null);
  const watchIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) return;

    // Start tracking immediately on mount
    watchIdRef.current = navigator.geolocation.watchPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        // Movement threshold to prevent spamming the API if the user is stationary
        if (lastCoords.current) {
          const moveThreshold = 0.0001; 
          if (Math.abs(lastCoords.current.lat - latitude) < moveThreshold && 
              Math.abs(lastCoords.current.lng - longitude) < moveThreshold) {
            setStatus("active");
            return;
          }
        }

        try {
          await fetch(`http://localhost:3001/api/vehicles/track-location`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ bookingId, lat: latitude, lng: longitude })
          });
          lastCoords.current = { lat: latitude, lng: longitude };
          setStatus("active");
        } catch (err) {
          console.error("Location sync failed");
        }
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED) setStatus("denied");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );

    // Cleanup: Stop tracking immediately when unmounted
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [bookingId, token]);

  if (status === "denied") {
    return (
      <div className="text-[8px] text-red-500 font-black uppercase flex items-center gap-1">
        <MapPinOff size={10}/> GPS PERMISSION DENIED
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 px-2 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
      <span className="relative flex h-1.5 w-1.5">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
      </span>
      <span className="text-[8px] font-black uppercase text-emerald-400 tracking-tighter">
        {status === "syncing" ? "Establishing Uplink..." : "Live Transmission"}
      </span>
    </div>
  );
}