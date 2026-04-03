"use client";

import { useEffect, useState } from "react";
import { Check, X } from "lucide-react";

export default function AdminWithdrawals() {
  const [requests, setRequests] = useState([]);

  const fetchRequests = async () => {
    const token = localStorage.getItem("token");
    const res = await fetch("http://localhost:3001/api/withdrawals/admin/requests", {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    if (data.success) setRequests(data.requests);
  };

  const handleAction = async (id: number, status: string) => {
    const token = localStorage.getItem("token");
    const res = await fetch(`http://localhost:3001/api/withdrawals/admin/requests/${id}`, {
      method: "PATCH",
      headers: { 
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}` 
      },
      body: JSON.stringify({ status })
    });
    if (res.ok) fetchRequests();
  };

  useEffect(() => { fetchRequests(); }, []);

  return (
    <div className="p-10 max-w-7xl mx-auto">
      <h1 className="text-3xl font-black mb-10">Withdrawal <span className="text-emerald-600">Requests</span></h1>
      
      <div className="bg-white rounded-[2rem] border border-slate-100 overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="p-6 text-[10px] font-black uppercase text-slate-400">Owner</th>
              <th className="p-6 text-[10px] font-black uppercase text-slate-400">Amount</th>
              <th className="p-6 text-[10px] font-black uppercase text-slate-400">Method</th>
              <th className="p-6 text-[10px] font-black uppercase text-slate-400">Details</th>
              <th className="p-6 text-[10px] font-black uppercase text-slate-400 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((req: any) => (
              <tr key={req.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                <td className="p-6">
                  <p className="font-bold text-slate-900">{req.user?.name}</p>
                  <p className="text-[10px] text-slate-400">{req.user?.email}</p>
                </td>
                <td className="p-6 font-black text-emerald-600">Rs. {req.amount}</td>
                <td className="p-6">
                  <span className="px-3 py-1 bg-slate-100 rounded-full text-[10px] font-black uppercase text-slate-600">
                    {req.method}
                  </span>
                </td>
                <td className="p-6 font-mono text-xs text-slate-600">{req.paymentDetails}</td>
                <td className="p-6 text-right space-x-2">
                  <button 
                    onClick={() => handleAction(req.id, "approved")}
                    className="p-3 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-100"
                  >
                    <Check size={16} />
                  </button>
                  <button 
                    onClick={() => handleAction(req.id, "rejected")}
                    className="p-3 bg-rose-100 text-rose-600 rounded-xl hover:bg-rose-200 transition-all"
                  >
                    <X size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {requests.length === 0 && (
          <div className="p-20 text-center text-slate-300 font-bold uppercase tracking-widest text-xs">
            No pending requests
          </div>
        )}
      </div>
    </div>
  );
}