"use client";

import { useState } from "react";
import { CheckCircle2, Loader2, Wallet } from "lucide-react";

interface ReleaseButtonProps {
  bookingId: string;
  isReleased: boolean;
  totalAmount: number;
  amountAlreadyReleased: number;
}

export default function ReleaseButton({ 
  bookingId, 
  isReleased, 
  totalAmount, 
  amountAlreadyReleased 
}: ReleaseButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleFullRelease = async () => {
    const maxOwnerShare = totalAmount * 0.9;
    const remainingToRelease = maxOwnerShare - (amountAlreadyReleased || 0);

    if (remainingToRelease <= 0) return;

    if (!confirm(`Release the remaining Rs. ${remainingToRelease.toLocaleString()} to the owner?`)) return;

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:3001/api/bookings/release-amount/${bookingId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ customAmount: remainingToRelease })
      });

      const data = await res.json();
      if (data.success) {
        window.location.reload(); 
      } else {
        alert(data.message);
      }
    } catch (err) {
      alert("Connection error");
    } finally {
      setLoading(false);
    }
  };

  if (isReleased) {
    return (
      <div className="flex items-center gap-2 px-6 py-3 bg-emerald-50 text-emerald-600 rounded-2xl border border-emerald-100">
        <CheckCircle2 size={16} />
        <span className="text-[10px] font-black uppercase tracking-widest">Fully Released</span>
      </div>
    );
  }

  return (
    <button
      onClick={handleFullRelease}
      disabled={loading}
      className="group relative flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-emerald-600 text-white rounded-2xl transition-all duration-300 shadow-lg shadow-blue-100 disabled:opacity-50"
    >
      {loading ? (
        <Loader2 size={16} className="animate-spin" />
      ) : (
        <Wallet size={16} className="group-hover:rotate-12 transition-transform" />
      )}
      <span className="text-[10px] font-black uppercase tracking-widest">
        Release Amount
      </span>
    </button>
  );
}