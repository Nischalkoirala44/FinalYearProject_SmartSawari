"use client";
import { useState, useEffect, useRef } from "react";
import { socket, fetchChatHistory } from "@/services/Chat";
import { Send, Zap, Loader2 } from "lucide-react";

export default function SmartChat({ bookingId, user, token }: any) {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!socket.connected) socket.connect();

    const loadData = async () => {
      setIsLoading(true);
      try {
        const data = await fetchChatHistory(bookingId, token);
        
        if (data && Array.isArray(data.messages)) {
          setMessages(data.messages);
        } else if (Array.isArray(data)) {
          setMessages(data);
        } else {
          setMessages([]);
        }
      } catch (err) {
        console.error("Failed to load chat history:", err);
        setMessages([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
    socket.emit("join_chat", { chatId: bookingId });

    const handleReceive = (msg: any) => {
      setMessages((prev) => [...prev, msg]);
    };

    socket.on("receive_message", handleReceive);

    return () => {
      socket.off("receive_message", handleReceive);
    };
  }, [bookingId, token]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

  const handleSend = () => {
    if (!input.trim() || !user) return;

    const messageData = {
      chatId: bookingId,
      senderId: user.id,
      senderName: user.name,
      text: input,
      created_at: new Date().toISOString() 
    };

    socket.emit("send_message", messageData);
    
    setInput("");
  };

  return (
    <div className="flex flex-col h-full bg-[#0e1f2e] border border-gray-800 rounded-[2rem] overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="p-4 bg-gray-900/80 border-b border-gray-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap size={14} className="text-red-600" />
          <span className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-400">
            Secure Channel // {bookingId}
          </span>
        </div>
        <div className="flex items-center gap-2">
           <span className="text-[8px] font-bold text-green-500 uppercase tracking-widest">Live</span>
           <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_green]" />
        </div>
      </div>

      {/* Message Area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-4 bg-[#0a1620]/30 custom-scrollbar">
        {isLoading ? (
          <div className="h-full flex flex-col items-center justify-center gap-2 opacity-50">
            <Loader2 className="animate-spin text-red-600" size={20} />
            <span className="text-[9px] font-black uppercase tracking-widest">Decrypting Logs...</span>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-10 opacity-20 text-[10px] uppercase font-black tracking-widest">
            No communication history found
          </div>
        ) : (
          messages.map((m, i) => {
            const isMe = (m.sender_id || m.senderId) === user?.id;
            
            return (
              <div key={i} className={`flex ${isMe ? "justify-end" : "justify-start"} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                <div className={`max-w-[80%] p-4 rounded-2xl text-xs font-bold leading-relaxed ${
                  isMe 
                    ? "bg-red-600 text-white rounded-tr-none shadow-lg shadow-red-900/20" 
                    : "bg-gray-800 text-gray-200 rounded-tl-none border border-gray-700"
                }`}>
                  {m.message || m.text}
                  <div className={`text-[8px] mt-2 opacity-50 ${isMe ? "text-right" : "text-left"}`}>
                    {m.created_at ? new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Just now"}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Input Area */}
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
          className="bg-red-600 p-3 rounded-xl hover:bg-red-700 text-white transition-all disabled:opacity-50 disabled:hover:bg-red-600 shadow-lg shadow-red-900/40 active:scale-95"
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  );
}