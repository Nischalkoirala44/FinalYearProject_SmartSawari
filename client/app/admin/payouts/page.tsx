"use client";

import { useEffect, useState } from "react";
import { Car, User, Calendar, ArrowRight, Loader2, Send, DollarSign, Info } from "lucide-react";
import ReleaseButton from "../(components)/ReleaseAmount";

export default function AdminPayoutDashboard() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [partialAmounts, setPartialAmounts] = useState<{ [key: string]: string }>({});
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  const fetchPending = async () => {
    try {
      const res = await fetch("http://localhost:3001/api/bookings/pending-payouts");
      const data = await res.json();
      if (data.success) {
        setBookings(data.bookings);

        const initialAmounts: any = {};
        data.bookings.forEach((b: any) => {
          const maxOwnerShare = b.totalAmount * 0.9;
          const remaining = maxOwnerShare - (b.amountAlreadyReleased || 0);
          initialAmounts[b.bookingId] = Math.max(0, remaining).toString();
        });
        setPartialAmounts(initialAmounts);
      }
    } catch (err) {
      console.error("Fetch failed");
    } finally {
      setLoading(false);
    }
  };

  const handlePartialRelease = async (bookingId: string) => {
    const amount = partialAmounts[bookingId];
    if (!amount || parseFloat(amount) <= 0) return alert("Please enter a valid amount");

    setIsProcessing(bookingId);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:3001/api/bookings/partial-release/${bookingId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ customAmount: parseFloat(amount) })
      });

      const data = await res.json();
      if (data.success) {
        alert(data.message);
        fetchPending();
      } else {
        alert(data.message);
      }
    } catch (err) {
      alert("Failed to process partial release");
    } finally {
      setIsProcessing(null);
    }
  };

  useEffect(() => { fetchPending(); }, []);

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <Loader2 className="animate-spin text-blue-600" size={40} />
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Loading Payout Queue...</p>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto p-10 animate-in fade-in duration-500">
      <div className="mb-10 flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tight">Payout <span className="text-blue-600">Queue</span></h1>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden shadow-xl">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="p-6 text-[10px] font-black uppercase text-slate-400">Vehicle & Owner</th>
              <th className="p-6 text-[10px] font-black uppercase text-slate-400">Renter & Trip</th>
              <th className="p-6 text-[10px] font-black uppercase text-slate-400 text-right">Accounting (90% Cap)</th>
              <th className="p-6 text-[10px] font-black uppercase text-slate-400 text-center">Release Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {bookings.map((b) => {
              const maxShare = b.totalAmount * 0.9;
              const paid = parseFloat(b.amountAlreadyReleased || 0);
              const remaining = maxShare - paid;

              return (
                <tr key={b.id} className="hover:bg-slate-50/50 transition-colors">
                  {/* Vehicle & Owner Info */}
                  <td className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600">
                        <Car size={20} />
                      </div>
                      <div>
                        <p className="font-black text-slate-900 uppercase leading-none mb-1">{b.vehicle?.registrationNumber}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Owner: {b.vehicle?.owner?.name}</p>
                      </div>
                    </div>
                  </td>

                  {/* Renter & Trip Dates */}
                  <td className="p-6">
                    <div className="flex items-center gap-2 text-slate-600 mb-1">
                      <User size={14} className="text-slate-400" />
                      <span className="text-xs font-bold">{b.renter?.name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase">
                      <Calendar size={12} />
                      <span>{b.startDate}</span>
                      <ArrowRight size={10} />
                      <span>{b.endDate}</span>
                    </div>
                  </td>

                  {/* Accounting Logic */}
                  <td className="p-6 text-right">
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Renter Paid: Rs. {b.totalAmount}</p>
                      <p className="text-lg font-black text-emerald-600">
                        Max Share: Rs. {maxShare.toLocaleString()}
                      </p>
                      <div className="flex flex-col items-end">
                        <span className="text-[9px] font-black text-blue-500 bg-blue-50 px-2 py-0.5 rounded uppercase tracking-tighter">
                          Already Released: Rs. {paid.toLocaleString()}
                        </span>
                        <span className={`text-[9px] font-black mt-1 px-2 py-0.5 rounded uppercase tracking-tighter ${remaining <= 0 ? 'bg-slate-100 text-slate-400' : 'bg-rose-50 text-rose-500'}`}>
                          Remaining: Rs. {Math.max(0, remaining).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="p-6">
                    <div className="flex flex-col items-center gap-3">
                      <ReleaseButton
                        bookingId={b.bookingId}
                        isReleased={b.amountReleased || (b.amountAlreadyReleased >= b.totalAmount * 0.9)}
                        totalAmount={b.totalAmount}
                        amountAlreadyReleased={b.amountAlreadyReleased}
                      />

                      {!b.amountReleased && remaining > 0 && (
                        <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200 focus-within:border-blue-400 transition-all">
                          <input
                            type="number"
                            max={remaining}
                            value={partialAmounts[b.bookingId] || ""}
                            onChange={(e) => setPartialAmounts({ ...partialAmounts, [b.bookingId]: e.target.value })}
                            placeholder="Amount"
                            className="w-24 bg-transparent text-[11px] font-black px-2 outline-none"
                          />
                          <button
                            onClick={() => handlePartialRelease(b.bookingId)}
                            disabled={isProcessing === b.bookingId}
                            className="bg-slate-900 text-white p-2 rounded-xl hover:bg-blue-600 transition-all disabled:opacity-50 shadow-lg shadow-slate-200"
                          >
                            {isProcessing === b.bookingId ? (
                              <Loader2 size={14} className="animate-spin" />
                            ) : (
                              <Send size={14} />
                            )}
                          </button>
                        </div>
                      )}

                      {remaining <= 0 && !b.amountReleased && (
                        <span className="text-[8px] font-black text-emerald-600 uppercase">Limit Reached</span>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {bookings.length === 0 && (
          <div className="p-20 text-center">
            <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <DollarSign className="text-slate-200" size={32} />
            </div>
            <p className="text-xs font-black uppercase tracking-widest text-slate-300">No pending payouts found</p>
          </div>
        )}
      </div>
    </div>
  );
}