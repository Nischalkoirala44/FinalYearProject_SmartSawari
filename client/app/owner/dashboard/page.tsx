"use client";

import { useEffect, useState } from "react";
import { 
  Wallet, History, Clock, TrendingUp, ArrowUpRight, 
  Loader2, AlertCircle, Landmark, CreditCard, X 
} from "lucide-react";

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
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 bg-[#0b1a27]">
      <div className="w-12 h-12 rounded-full border-2 border-red-900/20 border-t-red-600 animate-spin mb-4" />
      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">Syncing Secure Wallet...</p>
    </div>
  );

  if (error) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 bg-[#0b1a27]">
      <AlertCircle className="text-red-500" size={40} />
      <p className="text-xs font-black text-gray-400 uppercase tracking-widest">{error}</p>
      <button
        onClick={fetchStats}
        className="mt-2 px-8 py-3 bg-red-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-700 transition-all"
      >
        Retry Connection
      </button>
    </div>
  );

  return (
    <div className="flex-1 bg-[#0b1a27] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* HEADER */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter uppercase italic leading-none">
            Financial <span className="text-red-600">Vault</span>
          </h1>
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.3em] mt-3">
            Precision Revenue Tracking & Disbursement
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* MAIN BALANCE CARD */}
          <div className="lg:col-span-2 relative overflow-hidden bg-[#0d1f2f] rounded-[3rem] p-10 text-white border border-white/5 shadow-2xl shadow-black/50">
            <div className="relative z-10 flex flex-col h-full">
              <div className="flex items-center gap-3 mb-10">
                <div className="p-4 bg-red-600/10 border border-red-600/20 rounded-2xl text-red-500">
                  <Wallet size={28} />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 block">Current Liquidity</span>
                  <span className="text-xs font-bold text-gray-300">Ready for Withdrawal</span>
                </div>
              </div>

              <div className="flex items-baseline gap-3 mb-12">
                <span className="text-xl font-black text-red-600 italic uppercase">Rs.</span>
                <h2 className="text-7xl md:text-8xl font-black tracking-tighter italic">
                  {stats?.pendingAmount?.toLocaleString() ?? "0"}
                </h2>
              </div>

              <div className="mt-auto">
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="group flex items-center gap-4 px-10 py-5 bg-red-600 text-white rounded-[1.5rem] font-black text-xs uppercase tracking-widest hover:bg-red-700 transition-all transform active:scale-95 shadow-xl shadow-red-900/20"
                >
                  Initiate Disbursement 
                  <ArrowUpRight size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </button>
              </div>
            </div>

            {/* DESIGN ELEMENTS */}
            <div className="absolute top-[-20%] right-[-10%] w-96 h-96 bg-red-600/5 rounded-full blur-[120px]" />
            <div className="absolute bottom-[-10%] left-[-5%] w-64 h-64 bg-blue-600/5 rounded-full blur-[100px]" />
          </div>

          {/* SIDE STATS PANE */}
          <div className="flex flex-col gap-6">
            
            {/* PENDING CARD */}
            <div className="bg-[#0d1f2f] border border-white/5 p-8 rounded-[2.5rem] hover:border-amber-500/30 transition-all group">
              <div className="flex items-center gap-3 mb-5">
                <div className="p-3 bg-amber-500/10 rounded-xl group-hover:bg-amber-500/20 transition-colors">
                  <Clock className="text-amber-500" size={20} />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">In Review Pipeline</span>
              </div>
              <p className="text-3xl font-black text-white italic">
                Rs. {stats?.pendingAmount?.toLocaleString() ?? "0"}
              </p>
              <div className="h-px w-full bg-gradient-to-r from-white/10 to-transparent my-4" />
              <p className="text-[9px] font-bold text-gray-500 leading-relaxed uppercase tracking-tight">
                Held for 24h verification cycle following trip completion.
              </p>
            </div>

            {/* LIFETIME CARD */}
            <div className="bg-[#0d1f2f] border border-white/5 p-8 rounded-[2.5rem] hover:border-red-500/30 transition-all group">
              <div className="flex items-center gap-3 mb-5">
                <div className="p-3 bg-red-600/10 rounded-xl group-hover:bg-red-600/20 transition-colors">
                  <TrendingUp className="text-red-500" size={20} />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Total Asset Yield</span>
              </div>
              <p className="text-3xl font-black text-white italic">
                Rs. {stats?.totalLifetime?.toLocaleString() ?? "0"}
              </p>
              <div className="h-px w-full bg-gradient-to-r from-white/10 to-transparent my-4" />
              <p className="text-[9px] font-bold text-gray-500 uppercase tracking-tight">
                Combined historical earnings across all fleet units.
              </p>
            </div>

          </div>
        </div>

        {/* RECENT LOGS SECTION */}
        <div className="mt-12 p-12 bg-[#0d1f2f]/30 border border-dashed border-white/10 rounded-[3rem] text-center">
          <div className="inline-flex p-4 bg-white/5 rounded-full mb-4">
            <History className="text-gray-700" size={32} />
          </div>
          <h3 className="text-sm font-black text-gray-400 uppercase tracking-[0.4em]">Fleet Transaction Logs</h3>
          <p className="text-[10px] text-gray-600 font-bold uppercase mt-2">No disbursement history detected in current cycle</p>
        </div>
      </div>

      {/* WITHDRAWAL MODAL - BLUR OVERLAY */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[100] p-4">
          <div className="bg-[#0d1f2f] border border-white/10 rounded-[3rem] p-10 w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-300 relative overflow-hidden">
            
            {/* Modal Glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/10 blur-3xl rounded-full" />

            <div className="flex justify-between items-start mb-8 relative z-10">
              <div>
                <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter">
                  Request <span className="text-red-600">Disbursement</span>
                </h3>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">Wallet to Bank/E-Wallet Sync</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="space-y-6 relative z-10">
              <div className="bg-[#0b1a27] p-6 rounded-3xl border border-white/5">
                <label className="text-[9px] font-black uppercase text-red-600 tracking-widest block mb-3">Amount to Release (Rs.)</label>
                <div className="flex items-center gap-3">
                   <span className="text-xl font-black text-gray-600 italic">NPR</span>
                   <input
                    type="number"
                    className="w-full bg-transparent text-3xl font-black text-white outline-none placeholder:text-gray-800 italic"
                    placeholder="0.00"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#0b1a27] p-5 rounded-3xl border border-white/5">
                  <label className="text-[9px] font-black uppercase text-gray-500 tracking-widest block mb-3">Gateway</label>
                  <select
                    className="w-full bg-transparent text-sm font-black text-white outline-none cursor-pointer uppercase tracking-tighter"
                    value={method}
                    onChange={(e) => setMethod(e.target.value)}
                  >
                    <option className="bg-[#0d1f2f]" value="esewa">eSewa Digital</option>
                    <option className="bg-[#0d1f2f]" value="khalti">Khalti Pay</option>
                    <option className="bg-[#0d1f2f]" value="bank">Direct Bank</option>
                  </select>
                </div>

                <div className="bg-[#0b1a27] p-5 rounded-3xl border border-white/5">
                  <label className="text-[9px] font-black uppercase text-gray-500 tracking-widest block mb-3">Target Account</label>
                  <input
                    type="text"
                    className="w-full bg-transparent text-sm font-black text-white outline-none placeholder:text-gray-800"
                    placeholder="ID / Number"
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 mt-10 relative z-10">
              <button
                onClick={handleWithdraw}
                className="w-full py-5 bg-red-600 text-white rounded-2xl text-xs font-black uppercase tracking-[0.2em] hover:bg-red-700 transition-all shadow-xl shadow-red-900/20 active:scale-[0.98]"
              >
                Confirm Transfer
              </button>
              <p className="text-[8px] text-gray-600 font-bold text-center uppercase tracking-widest">
                By confirming, you agree to the automated disbursement processing terms.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}