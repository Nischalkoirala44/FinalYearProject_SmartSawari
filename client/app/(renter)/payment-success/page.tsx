"use client";
import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle2, Calendar, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function PaymentSuccess() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const bookingId = searchParams.get("id") || searchParams.get("ref");

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-[3rem] p-10 shadow-xl shadow-gray-200 text-center border border-gray-100">
        <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 size={40} />
        </div>
        
        <h1 className="text-3xl font-black uppercase tracking-tight text-gray-900">Payment Successful!</h1>
        <p className="text-gray-500 mt-2 font-medium">Your ride is now confirmed and ready for pick-up.</p>

        <div className="mt-8 p-6 bg-gray-50 rounded-2xl text-left space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400 font-bold uppercase text-[10px]">Booking Reference</span>
            <span className="font-mono font-bold text-blue-600">{bookingId}</span>
          </div>
          <div className="flex justify-between text-sm border-t border-gray-200 pt-3">
            <span className="text-gray-400 font-bold uppercase text-[10px]">Status</span>
            <span className="text-emerald-600 font-black uppercase text-[10px] bg-emerald-50 px-2 py-1 rounded">Confirmed</span>
          </div>
        </div>

        <div className="mt-8 space-y-3">
          <Link href="/renter/bookings">
            <button className="w-full py-4 bg-black text-white rounded-2xl font-black uppercase tracking-widest hover:bg-gray-800 transition-all flex items-center justify-center gap-2">
              View My Bookings <ArrowRight size={18} />
            </button>
          </Link>
          <Link href="/">
            <button className="w-full py-4 text-gray-400 font-bold uppercase text-xs hover:text-black transition-all">
              Back to Marketplace
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}