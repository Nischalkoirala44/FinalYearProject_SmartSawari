import { io } from "socket.io-client";

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
export const socket = io(SOCKET_URL, { autoConnect: false });

export const fetchChatHistory = async (bookingId: string, token: string) => {
  const res = await fetch(`${SOCKET_URL}/api/chat/history/${bookingId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error("Failed to load history");
  return res.json();
};