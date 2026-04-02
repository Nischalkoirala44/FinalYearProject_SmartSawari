"use client";
import { useState, useEffect, useRef } from "react";
import { socket, fetchChatHistory } from "@/services/Chat";
import { Send, Loader2, Check, CheckCheck, MoreVertical, Pencil, Trash2, X, Check as Save } from "lucide-react";
import Image from "next/image";

export default function SmartChat({ bookingId, user, token, ownerName, ownerImage }: any) {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  // UI States for Edit/Delete
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [showMenu, setShowMenu] = useState<string | null>(null);

  useEffect(() => {
    if (!socket.connected) socket.connect();

    const loadData = async () => {
      setIsLoading(true);
      try {
        const data = await fetchChatHistory(bookingId, token);
        const history = data?.messages || data || [];
        setMessages(history);
      } catch (err) {
        console.error("Failed to load chat history:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
    socket.emit("join_chat", { chatId: bookingId });

    const handleReceive = (msg: any) => {
      setMessages((prev) => [...prev, msg]);
    };

    const handleUpdate = (updatedMsg: any) => {
      setMessages((prev) =>
        prev.map((m) => (m.id === updatedMsg.id ? updatedMsg : m))
      );
    };

    const handleSeenUpdate = ({ bookingId: seenBookingId }: any) => {
      if (String(seenBookingId) === String(bookingId)) {
        setMessages((prev) => prev.map(m => ({ ...m, is_seen: true })));
      }
    };

    socket.on("receive_message", handleReceive);
    socket.on("message_updated", handleUpdate);
    socket.on("message_seen_update", handleSeenUpdate);

    return () => {
      socket.off("receive_message", handleReceive);
      socket.off("message_updated", handleUpdate);
      socket.off("message_seen_update", handleSeenUpdate);
    };
  }, [bookingId, token]);

  useEffect(() => {
    const markAsRead = async () => {
      if (!token || !bookingId || messages.length === 0) return;
      const lastMsg = messages[messages.length - 1];
      const isOtherPerson = (lastMsg.sender_id || lastMsg.senderId) !== user?.id;

      if (isOtherPerson && !lastMsg.is_seen) {
        try {
          await fetch(`http://localhost:3001/api/chat/seen/${bookingId}`, {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${token}`,
              "Content-Type": "application/json"
            }
          });
          socket.emit("message_seen", { bookingId, userId: user.id });
        } catch (err) {
          console.error("Error marking seen:", err);
        }
      }
    };

    markAsRead();
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages.length, bookingId, token, user?.id]);

  const handleSend = () => {
    if (!input.trim() || !user) return;
    const messageData = {
      chatId: bookingId,
      senderId: user.id,
      senderName: user.name,
      text: input,
      created_at: new Date().toISOString(),
      is_seen: false
    };
    socket.emit("send_message", messageData);
    setInput("");
  };

  const handleUpdateMessage = async (msgId: any, action: 'edit' | 'delete', text?: string) => {
    try {
      const res = await fetch(`http://localhost:3001/api/chat/message/${msgId}`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ action, text })
      });

      if (res.ok) {
        const updatedMsg = await res.json();
        setMessages(prev => prev.map(m => m.id === msgId ? updatedMsg : m));
        setEditingId(null);
        setShowMenu(null);
        socket.emit("update_message", updatedMsg);
      }
    } catch (err) {
      console.error("Failed to update message:", err);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0e1f2e] border border-gray-800 overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="p-4 bg-gray-900/80 border-b border-gray-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {ownerImage && (
            <div className="relative w-8 h-8 shrink-0">
              <Image src={ownerImage} alt={ownerName} fill className="rounded-full object-cover border border-gray-700" />
            </div>
          )}
          <span className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-400">{ownerName}</span>
        </div>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-5 space-y-6 bg-[#0a1620]/30 custom-scrollbar"
        onClick={() => setShowMenu(null)} // Close menu on background click
      >
        {isLoading ? (
          <div className="h-full flex flex-col items-center justify-center gap-2 opacity-50">
            <Loader2 className="animate-spin text-red-600" size={20} />
            <span className="text-[9px] font-black uppercase tracking-widest">Decrypting Logs...</span>
          </div>
        ) : (
          messages.map((m, i) => {
            const isMe = (m.sender_id || m.senderId) === user?.id;
            const isDeleted = !!m.deleted_at;
            const isBeingEdited = editingId === m.id;

            return (
              <div key={m.id || i} className={`flex ${isMe ? "justify-end" : "justify-start"} group relative animate-in fade-in slide-in-from-bottom-2 duration-300`}>

                {/* Context Menu Trigger - Now on the Right */}
                {isMe && !isDeleted && !isBeingEdited && (
                  <div className="absolute -right-2 -top-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowMenu(showMenu === m.id ? null : m.id);
                      }}
                      className="p-1.5 bg-gray-900 border border-gray-700 rounded-full text-gray-400 hover:text-white shadow-xl transition-colors"
                    >
                      <MoreVertical size={14} />
                    </button>

                    {/* Dropdown Menu - Adjusted to drop down from the right */}
                    {showMenu === m.id && (
                      <div className="absolute top-full right-0 mt-1 w-28 bg-gray-900 border border-gray-700 rounded-lg shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                        <button
                          onClick={() => { setEditingId(m.id); setEditText(m.message); setShowMenu(null); }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-[10px] uppercase font-black text-blue-400 hover:bg-white/10 transition-colors"
                        >
                          <Pencil size={12} /> Edit
                        </button>
                        <button
                          onClick={() => handleUpdateMessage(m.id, 'delete')}
                          className="w-full flex items-center gap-2 px-3 py-2 text-[10px] uppercase font-black text-red-500 hover:bg-white/10 border-t border-gray-800 transition-colors"
                        >
                          <Trash2 size={12} /> Delete
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Message Bubble */}
                <div className={`max-w-[85%] p-4 rounded-2xl text-xs font-bold leading-relaxed relative ${isMe ? "bg-red-600 text-white rounded-tr-none shadow-lg shadow-red-900/20"
                    : "bg-gray-800 text-gray-200 rounded-tl-none border border-gray-700"
                  } ${isDeleted ? "opacity-40 italic font-medium" : ""}`}>

                  {isBeingEdited ? (
                    <div className="space-y-2 min-w-[200px]">
                      <textarea
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        className="w-full bg-black/30 border border-white/20 rounded-lg p-2 text-white outline-none focus:border-white/40 resize-none"
                        rows={2}
                        autoFocus
                      />
                      <div className="flex justify-end gap-2">
                        <button onClick={() => setEditingId(null)} className="p-1 hover:bg-white/10 rounded">
                          <X size={14} className="text-white/70" />
                        </button>
                        <button onClick={() => handleUpdateMessage(m.id, 'edit', editText)} className="p-1 bg-white/20 hover:bg-white/30 rounded">
                          <Save size={14} className="text-white" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="whitespace-pre-wrap">{m.message || m.text}</p>
                  )}

                  {/* Metadata */}
                  <div className="flex items-center justify-end gap-1.5 mt-2 select-none">
                    {m.is_edited && !isDeleted && (
                      <span className="text-[7px] uppercase tracking-tighter opacity-60">Edited</span>
                    )}
                    <span className="text-[8px] opacity-40 font-medium">
                      {m.created_at ? new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Just now"}
                    </span>
                    {isMe && !isDeleted && (
                      <div className="ml-0.5">
                        {m.is_seen ? (
                          <CheckCheck size={10} className="text-blue-300" />
                        ) : (
                          <Check size={10} className="text-white/40" />
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Input area */}
      <div className="p-4 bg-gray-900/50 border-t border-gray-800 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Transmit message..."
          className="flex-1 bg-[#0a1620] border border-gray-800 rounded-xl px-4 py-3 text-xs font-bold text-white focus:border-red-600 outline-none transition-all placeholder:text-gray-700"
        />
        <button
          onClick={handleSend}
          disabled={!input.trim()}
          className="bg-red-600 p-3 rounded-xl hover:bg-red-700 text-white transition-all disabled:opacity-50 active:scale-95 shadow-lg shadow-red-900/40"
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  );
}