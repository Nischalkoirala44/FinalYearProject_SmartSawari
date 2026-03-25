"use client";
import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet-routing-machine";
import { useMap } from "react-leaflet";

export default function RoutingMachine({ userPos, destPos, onSummaryFetched }: any) {
  const map = useMap();
  const routingControlRef = useRef<any>(null);

  useEffect(() => {
    if (!map || !userPos || !destPos) return;

    const control = (L as any).Routing.control({
      waypoints: [L.latLng(userPos[0], userPos[1]), L.latLng(destPos[0], destPos[1])],
      lineOptions: { styles: [{ color: "#2563eb", weight: 5 }] },
      show: false,
      addWaypoints: false,
      createMarker: () => null,
    });

    control.on('routesfound', (e: any) => {
      if (routingControlRef.current && e.routes[0]) {
        onSummaryFetched({
          distance: e.routes[0].summary.totalDistance / 1000,
          time: Math.round(e.routes[0].summary.totalTime / 60)
        });
      }
    });

    control.addTo(map);
    routingControlRef.current = control;

    return () => {
      if (routingControlRef.current) {
        try {
          routingControlRef.current.getPlan().setWaypoints([]);
          
          if (map && (map as any)._loaded) {
            map.removeControl(routingControlRef.current);
          }
        } catch (e) {
          console.debug("Routing cleanup safely handled.");
        } finally {
          routingControlRef.current = null;
        }
      }
    };
  }, [map, userPos, destPos]);

  return null;
}