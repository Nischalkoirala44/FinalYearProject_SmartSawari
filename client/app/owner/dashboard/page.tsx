"use client";

import { useEffect, useState } from "react";
import { Wallet, History, Clock, TrendingUp, ArrowUpRight, Loader2, AlertCircle } from "lucide-react";

interface EarningStats {
  availableBalance: number;
  totalLifetime: number;
  pendingAmount: number;
}

export default function OwnerEarnings() {
  const [stats, setStats] = useState<EarningStats>({
    availableBalance: 0,
    totalLifetime: 0,
    pendingAmount: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [method, setMethod] = useState("esewa");
  const [details, setDetails] = useState("");

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:3001/api/bookings/stats", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });

      const result = await res.json();

      if (result.success && result.data) {
        setStats({
          availableBalance: Number(result.data.alreadyReleased) || 0,
          totalLifetime: Number(result.data.totalLifetime) || 0,
          pendingAmount: Number(result.data.pendingRelease) || 0
        });
      } else {
        setError(result.message || "Failed to load earnings");
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Connection to server failed");
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async () => {
    if (!withdrawAmount || Number(withdrawAmount) <= 0) return alert("Enter a valid amount");
    if (!details) return alert("Enter payment details");

    const token = localStorage.getItem("token");
    const res = await fetch("http://localhost:3001/api/withdrawals/request", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ amount: withdrawAmount, method, paymentDetails: details })
    });

    const data = await res.json();
    if (data.success) {
      alert("Withdrawal Request Sent!");
      setIsModalOpen(false);
      setWithdrawAmount("");
      setDetails("");
      fetchStats(); 
    } else {
      alert(data.message || "Withdrawal failed");
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <Loader2 className="animate-spin text-emerald-600" size={40} />
      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Syncing Secure Wallet...</p>
    </div>
  );

  if (error) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <AlertCircle className="text-rose-500" size={40} />
      <p className="text-sm font-bold text-slate-600 uppercase tracking-widest">{error}</p>
      <button
        onClick={fetchStats}
        className="mt-2 px-6 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest"
      >
        Retry
      </button>
    </div>
  );

  return (
    <>
      <div className="max-w-6xl mx-auto p-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="mb-10">
          <h1 className="text-4xl font-[900] text-slate-900 tracking-tight">
            Financial <span className="text-emerald-600">Overview</span>
          </h1>
          <p className="text-slate-400 font-medium">Track your revenue and manage your withdrawals.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* AVAILABLE BALANCE CARD */}
          <div className="lg:col-span-2 relative overflow-hidden bg-slate-900 rounded-[3rem] p-10 text-white shadow-2xl shadow-emerald-100/20 border border-white/5">
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-emerald-500/20 rounded-2xl text-emerald-400">
                  <Wallet size={24} />
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Available to Withdraw</span>
              </div>

              <div className="flex items-baseline gap-2 mb-10">
                <span className="text-sm font-bold text-emerald-500">Rs.</span>
                <h2 className="text-6xl font-[900] tracking-tighter">
                  {stats?.pendingAmount?.toLocaleString() ?? "0"}
                </h2>
              </div>

              <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2 px-8 py-4 bg-white text-slate-900 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-emerald-400 hover:text-white transition-all transform active:scale-95 shadow-xl shadow-white/5"
              >
                Withdraw Funds <ArrowUpRight size={16} />
              </button>
            </div>

            <div className="absolute top-[-10%] right-[-5%] w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-[-10%] left-[-5%] w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"></div>
          </div>

          {/* SIDE STATS */}
          <div className="space-y-6">
            <div className="bg-white border border-slate-100 p-8 rounded-[2.5rem] shadow-sm hover:border-amber-200 transition-colors group">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-amber-50 rounded-lg group-hover:bg-amber-100 transition-colors">
                  <Clock className="text-amber-500" size={18} />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">In Review (Pending)</span>
              </div>
              <p className="text-2xl font-black text-slate-900">
                Rs. {stats?.pendingAmount?.toLocaleString() ?? "0"}
              </p>
              <p className="text-[9px] font-bold text-slate-400 mt-2 leading-relaxed uppercase tracking-tighter">
                Held for 24h after trip release for security verification.
              </p>
            </div>

            <div className="bg-emerald-50 border border-emerald-100 p-8 rounded-[2.5rem] hover:bg-emerald-100/50 transition-colors group">
              <div className="flex items-center gap-3 mb-4 text-emerald-600">
                <div className="p-2 bg-white rounded-lg group-hover:bg-emerald-200 transition-colors">
                  <TrendingUp size={18} />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600/60">Lifetime Earnings</span>
              </div>
              <p className="text-2xl font-black text-emerald-900">
                Rs. {stats?.totalLifetime?.toLocaleString() ?? "0"}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-12 p-10 bg-slate-50/50 border border-dashed border-slate-200 rounded-[3rem] text-center">
          <History className="mx-auto text-slate-300 mb-4" size={32} />
          <p className="text-xs font-black uppercase tracking-widest text-slate-400">No recent transactions to display</p>
        </div>
      </div>

      {/* WITHDRAWAL MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[2.5rem] p-10 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="text-2xl font-black mb-6 uppercase tracking-tight">
              Withdraw <span className="text-emerald-600">Funds</span>
            </h3>

            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 block mb-2">Amount (Rs.)</label>
                <input
                  type="number"
                  className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-emerald-500 transition-all font-bold"
                  placeholder="0.00"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 block mb-2">Transfer Method</label>
                <select
                  className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold cursor-pointer"
                  value={method}
                  onChange={(e) => setMethod(e.target.value)}
                >
                  <option value="esewa">eSewa</option>
                  <option value="khalti">Khalti</option>
                  <option value="bank">Bank Transfer</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 block mb-2">Account ID / Phone</label>
                <input
                  type="text"
                  className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-emerald-500 font-bold"
                  placeholder="98XXXXXXXX"
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                />
              </div>
            </div>

            <div className="flex gap-4 mt-8">
              <button
                onClick={() => setIsModalOpen(false)}
                className="flex-1 py-4 text-[10px] font-black uppercase text-slate-400 hover:text-slate-600"
              >
                Cancel
              </button>
              <button
                onClick={handleWithdraw}
                className="flex-1 py-4 bg-emerald-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200"
              >
                Submit Request
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}