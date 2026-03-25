import type { VehicleResponse, VehiclesResponse } from "../types/Vehicle";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

// Fetch approved vehicles
export const fetchVehicles = async (): Promise<VehiclesResponse | null> => {
  try {
    const res = await fetch(`${API_URL}/api/vehicles/approved`, {
      method: "GET",
    });

    if (!res.ok) throw new Error("Failed to fetch vehicles");

    return await res.json();
  } catch (err) {
    console.error("Fetch error:", err);
    return null;
  }
};

// Fetch public vehicle by id
export const getPublicVehicleById = async (id: string): Promise<VehicleResponse | null> => {
  try {
    const res = await fetch(`${API_URL}/api/vehicles/public/${id}`, {
      method: "GET",
    });

    if (!res.ok) throw new Error("Failed to fetch public vehicle by ID");

    return await res.json();
  }
  catch (err) {
    console.error("Fetch error:", err);
    return null;  
  }
}

// Fetch vehicle by ID
export const getVehicleById = async (id: string): Promise<VehicleResponse | null> => {
  try {
    const res = await fetch(`${API_URL}/api/vehicles/approved/${id}`, {
      method: "GET",
      credentials: "include",
    });

    if (!res.ok) throw new Error("Failed to fetch vehicle by ID");

    return await res.json();
  } catch (err) {
    console.error("Fetch error:", err);
    return null;
  }
};

// Notifications
export const getNotifications = async () => {
  try {
    const res = await fetch(`${API_URL}/api/vehicles/notifications`, {
      method: "GET",
      credentials: "include",
    });

    if (!res.ok) throw new Error("Failed to fetch notifications");

    return await res.json();
  } catch (err) {
    console.error("Fetch error:", err);
    return null;
  }
};
