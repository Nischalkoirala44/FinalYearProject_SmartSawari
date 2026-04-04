"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet-routing-machine";
import { useMap } from "react-leaflet";

export default function RoutingMachine({ userPos, destPos, onSummaryFetched }: any) {
  const map = useMap();
  const routingControlRef = useRef<any>(null);
  const isMountedRef = useRef(true);

  // Sync mounted status
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!map || !userPos || !destPos) return;

    if (!routingControlRef.current) {
      const control = (L as any).Routing.control({
        waypoints: [
          L.latLng(userPos[0], userPos[1]),
          L.latLng(destPos[0], destPos[1]),
        ],
        lineOptions: {
          styles: [{ color: "#ef4444", weight: 6, opacity: 0.8 }],
          addWaypoints: false,
        },
        show: false,
        addWaypoints: false,
        draggableWaypoints: false,
        fitSelectedRoutes: true,
        createMarker: () => null,
        containerClassName: "smart-sawari-itinerary hidden",
      });

      control.on("routesfound", (e: any) => {
        if (!isMountedRef.current) return;
        const route = e.routes?.[0];
        if (route) {
          onSummaryFetched?.({
            distance: route.summary.totalDistance / 1000,
            time: Math.round(route.summary.totalTime / 60),
          });
        }
      });

      // Add to map and save to ref
      control.addTo(map);
      routingControlRef.current = control;
    } else {
      // Update waypoints if control already exists
      const plan = routingControlRef.current.getPlan();
      if (plan) {
        plan.setWaypoints([
          L.latLng(userPos[0], userPos[1]),
          L.latLng(destPos[0], destPos[1]),
        ]);
      }
    }
  }, [map, userPos, destPos, onSummaryFetched]);

  // CRITICAL CLEANUP FIX
  useEffect(() => {
    return () => {
      if (routingControlRef.current) {
        try {
          const control = routingControlRef.current;
          control.off();
          const plan = control.getPlan();
          if (plan) {
            plan.setWaypoints([]);
          }
          if (map && control.getContainer()) {
            map.removeControl(control);
          }
        } catch (err) {
          console.debug("Routing cleanup handled safely:", err);
        } finally {
          routingControlRef.current = null;
        }
      }
    };
  }, [map]);

  return null;
}