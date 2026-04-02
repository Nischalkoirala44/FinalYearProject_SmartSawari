"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import SmartChat from "@/components/ChatWindow";
import { Search, MessageSquare, Loader2, Trash2 } from "lucide-react";
import Image from "next/image";
import LayoutWrapper from "@/components/LayoutWrapper";

export default function MessengerPage() {
  const { user, token } = useAuth();
  const [conversations, setConversations] = useState<any[]>([]);
  const [activeChat, setActiveChat] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const handleClearChat = async () => {
    if (!activeChat || !token) return;

    try {
      const res = await fetch(`http://localhost:3001/api/chat/clear/${activeChat.bookingId}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (res.ok) {
        setIsDeleteModalOpen(false);
        setConversations(prev => prev.map(c =>
          c.bookingId === activeChat.bookingId
            ? { ...c, lastMessage: "This message was deleted" }
            : c
        ));
        setActiveChat({ ...activeChat, refresh: Date.now() });
      }
    } catch (err) {
      console.error("Clear chat error:", err);
    }
  };

  const fetchInbox = async () => {
    if (!token) return;
    try {
      const res = await fetch(`http://localhost:3001/api/chat/inbox`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setConversations(data.chats || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchInbox(); }, [token]);

  // Handler to mark as seen on click
  const handleChatSelect = async (chat: any) => {
    setActiveChat(chat);
    if (!token) return;

    try {
      await fetch(`http://localhost:3001/api/chat/seen/${chat.bookingId}`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` }
      });
      // Update local UI immediately
      setConversations(prev => prev.map(c =>
        c.bookingId === chat.bookingId ? { ...c, isSeen: true } : c
      ));
    } catch (err) {
      console.error("Seen API error:", err);
    }
  };

  return (
    <LayoutWrapper>
      <div className="flex flex-1 h-screen bg-[#0a1620] border border-gray-800 rounded-2xl overflow-hidden">
        <aside className="w-20 md:w-80 border-r border-gray-800 flex flex-col bg-[#0e1f2e] shrink-0">
          <div className="p-4 md:p-6 border-b border-gray-800">
            <h2 className="hidden md:block text-xl font-black uppercase tracking-tighter text-white mb-4">Messages</h2>
            <div className="relative">
              <Search className="absolute left-3 top-3 text-gray-500" size={16} />
              <input placeholder="Search..." className="w-full bg-[#0a1620] border border-gray-800 rounded-xl py-2 pl-10 pr-4 text-xs font-bold text-white focus:border-red-600 outline-none hidden md:block" />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {loading ? (
              <div className="p-10 text-center flex flex-col items-center gap-2">
                <Loader2 className="animate-spin text-red-600" size={20} />
                <span className="hidden md:block text-gray-600 uppercase font-black text-[9px] tracking-[0.2em]">Syncing...</span>
              </div>
            ) : (
              conversations.map((chat) => (
                <div
                  key={chat.bookingId}
                  onClick={() => handleChatSelect(chat)}
                  className={`p-4 flex items-center gap-4 cursor-pointer transition-all border-l-4 ${activeChat?.bookingId === chat.bookingId ? "bg-red-600/10 border-red-600" : "border-transparent hover:bg-white/5"
                    }`}
                >
                  <div className="relative w-10 h-10 md:w-12 md:h-12 shrink-0">
                    <Image src={chat.ownerImage || "/default-avatar.png"} alt={chat.ownerName} fill className="rounded-full object-cover border border-gray-800" />
                    {!chat.isSeen && <div className="absolute top-0 right-0 w-3 h-3 bg-red-600 rounded-full border-2 border-[#0e1f2e]" />}
                  </div>
                  <div className="hidden md:block flex-1 min-w-0">
                    <div className="flex justify-between items-baseline">
                      <h4 className={`text-sm uppercase truncate ${!chat.isSeen ? "font-black text-white" : "font-bold text-gray-400"}`}>{chat.ownerName}</h4>
                      <span className="text-[8px] font-bold text-gray-600">{new Date(chat.lastTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <p className={`text-[11px] truncate ${!chat.isSeen ? "text-white font-black" : "text-gray-500 font-bold"}`}>{chat.lastMessage}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </aside>

        <main className="flex-1 flex flex-col bg-[#0a1620] min-w-0 relative">
          {activeChat && (
            <button
              onClick={() => setIsDeleteModalOpen(true)}
              className="absolute top-4 right-4 z-50 p-3 bg-gray-900/80 hover:bg-red-600/20 text-gray-500 hover:text-red-500 rounded-xl border border-gray-800 transition-all backdrop-blur-md"
            >
              <Trash2 size={18} />
            </button>
          )}

          {activeChat ? (
            <div className="flex-1 flex flex-col min-h-0 animate-in fade-in duration-500">
              <SmartChat
                key={activeChat.bookingId + (activeChat.refresh || '')}
                bookingId={activeChat.bookingId}
                user={user}
                token={token}
                ownerName={activeChat.ownerName}
                ownerImage={activeChat.ownerImage}
              />
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center opacity-10 select-none">
              <MessageSquare size={100} strokeWidth={1} />
              <p className="mt-6 text-[12px] font-black uppercase tracking-[1em]">Select Terminal</p>
            </div>
          )}
        </main>
      </div>

      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleClearChat}
      />
    </LayoutWrapper>
  );
}

function DeleteModal({ isOpen, onClose, onConfirm }: any) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
      <div className="bg-[#0e1f2e] border border-gray-800 rounded-[2rem] p-8 max-w-sm w-full shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="w-12 h-12 bg-red-600/10 rounded-full flex items-center justify-center mb-6">
          <Trash2 className="text-red-600" size={24} />
        </div>
        <h3 className="text-xl font-black uppercase tracking-tighter text-white mb-2">Delete All?</h3>
        <p className="text-gray-400 text-[11px] font-bold leading-relaxed mb-8 uppercase tracking-wider">
          Warning: This will delete your message history. This action is irreversible.
        </p>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-4 rounded-xl bg-gray-800 text-[10px] font-black uppercase tracking-[0.2em] text-white hover:bg-gray-700 transition-all">
            Cancel
          </button>
          <button onClick={onConfirm} className="flex-1 py-4 rounded-xl bg-red-600 text-[10px] font-black uppercase tracking-[0.2em] text-white hover:bg-red-700 transition-all shadow-lg shadow-red-900/40">
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}