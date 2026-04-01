"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import SmartChat from "@/components/ChatWindow";
import { Search, MessageSquare, User, Shield, Loader2 } from "lucide-react";
import Image from "next/image";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function MessengerPage() {
  const { user, token } = useAuth();
  const [conversations, setConversations] = useState<any[]>([]);
  const [activeChat, setActiveChat] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInbox = async () => {
      if (!token) return;
      try {
        setError(null);
        const res = await fetch(`http://localhost:3001/api/chat/inbox`, {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        });

        const contentType = res.headers.get("content-type");
        if (!res.ok || !contentType || !contentType.includes("application/json")) {
          throw new Error("Server error: Check backend configuration.");
        }

        const data = await res.json();
        if (data.success) {
          setConversations(data.chats || []);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchInbox();
  }, [token]);

  return (
    <ProtectedRoute allowedRoles={["owner", "renter"]}>
      <div className="flex flex-1 h-screen bg-[#0a1620] border border-gray-800 rounded-2xl overflow-hidden">

        {/* LEFT SIDEBAR: INBOX */}
        <aside className="w-20 md:w-80 border-r border-gray-800 flex flex-col bg-[#0e1f2e] shrink-0">
          <div className="p-4 md:p-6 border-b border-gray-800">
            <h2 className="hidden md:block text-xl font-black uppercase tracking-tighter text-white mb-4">Messages</h2>
            <div className="relative">
              <Search className="absolute left-3 top-3 text-gray-500" size={16} />
              <input
                placeholder="Search..."
                className="w-full bg-[#0a1620] border border-gray-800 rounded-xl py-2 pl-10 pr-4 text-xs font-bold text-white focus:border-red-600 outline-none transition-all hidden md:block"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {loading ? (
              <div className="p-10 text-center flex flex-col items-center gap-2">
                <Loader2 className="animate-spin text-red-600" size={20} />
                <span className="hidden md:block text-gray-600 uppercase font-black text-[9px] tracking-[0.2em]">Syncing...</span>
              </div>
            ) : error ? (
              <div className="p-6 text-[10px] font-bold text-red-500 uppercase text-center opacity-50">{error}</div>
            ) : conversations.length === 0 ? (
              <div className="p-10 text-center text-gray-600 uppercase font-black text-[9px] tracking-widest opacity-30">No Logs</div>
            ) : (
              conversations.map((chat) => (
                <div
                  key={chat.bookingId}
                  onClick={() => setActiveChat(chat)}
                  className={`p-4 flex items-center gap-4 cursor-pointer transition-all border-l-4 ${activeChat?.bookingId === chat.bookingId
                      ? "bg-red-600/10 border-red-600"
                      : "border-transparent hover:bg-white/5"
                    }`}
                >
                  <div className="relative w-10 h-10 md:w-12 md:h-12 shrink-0">
                    <Image
                      src={chat.ownerImage || "/default-avatar.png"}
                      alt={chat.ownerName}
                      fill
                      className="rounded-full object-cover border border-gray-800"
                    />
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-[#0e1f2e]" />
                  </div>
                  <div className="hidden md:block flex-1 min-w-0">
                    <div className="flex justify-between items-baseline">
                      <h4 className="text-sm font-black text-white truncate uppercase">{chat.ownerName}</h4>
                      <span className="text-[8px] font-bold text-gray-600">
                        {new Date(chat.lastTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-400 truncate font-bold">{chat.lastMessage}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </aside>

        {/* ── MAIN CHAT AREA ── */}
        <main className="flex-1 flex flex-col bg-[#0a1620] min-w-0">
          {activeChat ? (
            <div className="flex-1 flex flex-col min-h-0 animate-in fade-in duration-500">
              {/* Active Header */}
              <div className="p-4 bg-gray-900/50 border-b border-gray-800 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 relative">
                    <Image
                      src={activeChat.ownerImage || "/default-avatar.png"}
                      fill
                      className="rounded-full border border-gray-700 object-cover"
                      alt="Active Session"
                    />
                  </div>
                  <div>
                    <h3 className="text-sm font-black uppercase text-white leading-none">{activeChat.ownerName}</h3>
                    <div className="flex items-center gap-1.5 mt-1">
                    </div>
                  </div>
                </div>
              </div>

              {/* Chat Body - Takes remaining space */}
              <div className="flex-1 min-h-0">
                <SmartChat
                  bookingId={activeChat.bookingId}
                  user={user}
                  token={token}
                  
                />
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center opacity-10 select-none">
              <MessageSquare size={100} strokeWidth={1} />
              <p className="mt-6 text-[12px] font-black uppercase tracking-[1em]">Select Terminal</p>
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}