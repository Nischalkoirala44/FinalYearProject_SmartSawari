"use client";

import { useEffect, useState } from "react";
import { Car, User, Calendar, ArrowRight, Loader2, Send, DollarSign, CheckCircle2, XCircle, Banknote } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function AdminPayoutDashboard() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [partialAmounts, setPartialAmounts] = useState<{ [key: string]: string }>({});
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    status: "confirm" | "success" | "error";
    releaseType: "partial" | "full" | null;
    message: string;
    bookingId: string | null;
    amount: string | null;
  }>({
    isOpen: false,
    status: "confirm",
    releaseType: null,
    message: "",
    bookingId: null,
    amount: null,
  });

  const fetchPending = async () => {
    try {
      const res = await fetch(`${API_URL}/api/bookings/pending-payouts`);
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

  const initiatePartialRelease = (bookingId: string) => {
    const amount = partialAmounts[bookingId];
    if (!amount || parseFloat(amount) <= 0) {
      setModalConfig({ isOpen: true, status: "error", releaseType: "partial", message: "Please enter a valid transfer amount greater than 0.", bookingId: null, amount: null });
      return;
    }
    setModalConfig({ isOpen: true, status: "confirm", releaseType: "partial", message: "", bookingId, amount });
  };

  const initiateFullRelease = (bookingId: string, remainingAmount: number) => {
    if (remainingAmount <= 0) return;
    setModalConfig({ isOpen: true, status: "confirm", releaseType: "full", message: "", bookingId, amount: remainingAmount.toString() });
  };

  const executeRelease = async () => {
    const { bookingId, amount, releaseType } = modalConfig;
    if (!bookingId || !amount) return;

    setIsProcessing(bookingId);
    try {
      const token = localStorage.getItem("token");
      const endpoint = releaseType === "partial" 
        ? `/api/bookings/partial-release/${bookingId}` 
        : `/api/bookings/release-amount/${bookingId}`;

      const res = await fetch(`${API_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: releaseType === "partial" ? JSON.stringify({ customAmount: parseFloat(amount) }) : undefined
      });

      const data = await res.json();
      if (data.success) {
        setModalConfig({ isOpen: true, status: "success", releaseType, message: data.message, bookingId: null, amount: null });
        fetchPending();
        if (releaseType === "partial") {
          setPartialAmounts((prev) => ({ ...prev, [bookingId]: "" }));
        }
      } else {
        setModalConfig({ isOpen: true, status: "error", releaseType, message: data.message || "Failed to process release.", bookingId: null, amount: null });
      }
    } catch (err) {
      setModalConfig({ isOpen: true, status: "error", releaseType, message: "A network error occurred. Please try again.", bookingId: null, amount: null });
    } finally {
      setIsProcessing(null);
    }
  };

  const closeModal = () => {
    if (isProcessing) return;
    setModalConfig({ ...modalConfig, isOpen: false });
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
              const isFullyReleased = b.amountReleased || remaining <= 0;

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
                        <span className={`text-[9px] font-black mt-1 px-2 py-0.5 rounded uppercase tracking-tighter ${isFullyReleased ? 'bg-slate-100 text-slate-400' : 'bg-rose-50 text-rose-500'}`}>
                          Remaining: Rs. {Math.max(0, remaining).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="p-6">
                    <div className="flex flex-col items-center gap-3">
                      {isFullyReleased ? (
                        <div className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-4 py-2 rounded-xl uppercase tracking-widest border border-emerald-100">
                           Fully Released
                        </div>
                      ) : (
                        <>
                          <button
                            onClick={() => initiateFullRelease(b.bookingId, remaining)}
                            disabled={isProcessing === b.bookingId}
                            className="w-full max-w-[160px] bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold py-2.5 px-4 rounded-xl transition-all shadow-md shadow-blue-200 flex justify-center items-center gap-2 disabled:opacity-50"
                          >
                            <Banknote size={14} /> Full Release
                          </button>

                          <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-xl border border-slate-200 focus-within:border-blue-400 transition-all max-w-[160px] w-full">
                            <input
                              type="number"
                              max={remaining}
                              value={partialAmounts[b.bookingId] || ""}
                              onChange={(e) => setPartialAmounts({ ...partialAmounts, [b.bookingId]: e.target.value })}
                              placeholder="Amount"
                              className="w-full bg-transparent text-[11px] font-black px-2 outline-none"
                            />
                            <button
                              onClick={() => initiatePartialRelease(b.bookingId)}
                              disabled={isProcessing === b.bookingId}
                              className="bg-slate-900 text-white p-2 rounded-lg hover:bg-blue-600 transition-all disabled:opacity-50 shadow-md"
                            >
                              {isProcessing === b.bookingId ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                            </button>
                          </div>
                        </>
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

      {/* ACTION MODAL */}
      {modalConfig.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={closeModal} />

          <div className="relative bg-white rounded-[2rem] p-8 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200">
            {/* Confirm State */}
            {modalConfig.status === "confirm" && (
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Banknote size={32} />
                </div>
                <h3 className="text-2xl font-black text-gray-900">
                  Confirm {modalConfig.releaseType === "full" ? "Full" : "Partial"} Transfer?
                </h3>
                <p className="text-gray-500 font-medium text-sm">
                  You are about to release <span className="font-bold text-gray-900">Rs. {modalConfig.amount}</span> to the vehicle owner.
                </p>
                <div className="flex gap-3 pt-6">
                  <button onClick={closeModal} disabled={!!isProcessing} className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-2xl font-bold">Cancel</button>
                  <button onClick={executeRelease} disabled={!!isProcessing} className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold flex justify-center items-center gap-2">
                    {isProcessing ? <Loader2 size={18} className="animate-spin" /> : "Release Funds"}
                  </button>
                </div>
              </div>
            )}

            {/* Success State */}
            {modalConfig.status === "success" && (
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 size={32} />
                </div>
                <h3 className="text-2xl font-black text-gray-900">Transfer Successful</h3>
                <p className="text-gray-500 font-medium text-sm">{modalConfig.message}</p>
                <button onClick={closeModal} className="w-full py-3 mt-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold">Done</button>
              </div>
            )}

            {/* Error State */}
            {modalConfig.status === "error" && (
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <XCircle size={32} />
                </div>
                <h3 className="text-2xl font-black text-gray-900">Action Failed</h3>
                <p className="text-gray-500 font-medium text-sm">{modalConfig.message}</p>
                <button onClick={closeModal} className="w-full py-3 mt-4 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-2xl font-bold">Close</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}