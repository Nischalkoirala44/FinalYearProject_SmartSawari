"use client";

import { useEffect, useState, useMemo } from "react";
import {
  fetchAdminVerifications,
  approveVerification,
  rejectVerification,
} from "@/services/Admin";
import Link from "next/link";
import { 
  CheckCircle, 
  XCircle, 
  Car, 
  Clock, 
  Filter, 
  Search,
  ChevronRight,
  ListFilter
} from "lucide-react";

export default function AdminDashboardPage() {
  const [verifications, setVerifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all"); // 'all' | 'pending' | 'approved' | 'rejected'

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await fetchAdminVerifications();
      setVerifications(data.verifications || []);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const approve = async (id: number) => {
    if(!confirm("Approve this vehicle?")) return;
    await approveVerification(id);
    loadData();
  };

  const reject = async (id: number) => {
    const reason = prompt("Reason for rejection:");
    if(!reason) return;
    await rejectVerification(id, reason);
    loadData();
  };

  const filteredData = useMemo(() => {
    return verifications.filter((v) => {
      const matchesSearch = v.registrationNumber.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === "all" || v.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [searchTerm, filterStatus, verifications]);

  const stats = {
    total: verifications.length,
    pending: verifications.filter(v => v.status === "pending").length,
    approved: verifications.filter(v => v.status === "approved").length,
    rejected: verifications.filter(v => v.status === "rejected").length,
  };

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-8 animate-in fade-in duration-500">
      
      {/* 1. Header & Global Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Vehicle Management</h1>
          <p className="text-gray-500 mt-1">Real-time verification pipeline and asset control.</p>
        </div>
        
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
          <input 
            type="text" 
            placeholder="Search registration..." 
            className="pl-10 pr-4 py-3 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 outline-none w-full md:w-80 transition-all bg-white shadow-sm"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* 2. Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Pending" count={stats.pending} icon={Clock} color="amber" />
        <StatCard label="Approved" count={stats.approved} icon={CheckCircle} color="green" />
        <StatCard label="Rejected" count={stats.rejected} icon={XCircle} color="red" />
        <StatCard label="Total" count={stats.total} icon={Car} color="blue" />
      </div>

      {/* 3. Filter Controls */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-gray-100/80 rounded-2xl w-fit border border-gray-200">
        {['all', 'pending', 'approved', 'rejected'].map((s) => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
              filterStatus === s 
                ? "bg-white text-blue-600 shadow-sm ring-1 ring-gray-200" 
                : "text-gray-500 hover:text-gray-800"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* 4. Table Section */}
      <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-200 overflow-hidden">
        <div className="px-8 py-5 border-b border-gray-100 flex items-center justify-between bg-white">
          <div className="flex items-center gap-2">
            <ListFilter size={18} className="text-blue-600" />
            <h2 className="font-bold text-gray-900">Application Records</h2>
          </div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-tighter">
            Showing {filteredData.length} of {verifications.length} Results
          </p>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <TableLoader />
          ) : filteredData.length === 0 ? (
            <EmptyState message={searchTerm || filterStatus !== 'all' ? "No results match your filters" : "No records available"} />
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-gray-400 text-[10px] uppercase tracking-[0.15em] font-black bg-gray-50/50">
                  <th className="px-8 py-4">Vehicle Details</th>
                  <th className="px-8 py-4">Verification Status</th>
                  <th className="px-8 py-4">Date Added</th>
                  <th className="px-8 py-4 text-right">Review</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredData.map((v) => (
                  <tr key={v.id} className="hover:bg-blue-50/30 transition-colors group">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                          <Car size={22} />
                        </div>
                        <div>
                          <p className="font-black text-gray-900 leading-none mb-1 uppercase">{v.registrationNumber}</p>
                          <p className="text-xs font-medium text-gray-400 capitalize">{v.vehicleType} • ID: {v.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <Badge status={v.status} />
                    </td>
                    <td className="px-8 py-5 text-sm font-bold text-gray-500">
                      {v.created_at ? new Date(v.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "2-digit" }) : "N/A"}
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex items-center justify-end gap-3">
                        {v.status === "pending" && (
                          <div className="flex items-center gap-1 bg-gray-50 p-1 rounded-xl border border-gray-100">
                            <button onClick={() => approve(v.id)} className="p-2 text-emerald-600 hover:bg-white hover:shadow-sm rounded-lg transition-all" title="Quick Approve">
                              <CheckCircle size={18} />
                            </button>
                            <button onClick={() => reject(v.id)} className="p-2 text-rose-600 hover:bg-white hover:shadow-sm rounded-lg transition-all" title="Quick Reject">
                              <XCircle size={18} />
                            </button>
                          </div>
                        )}
                        <Link 
                          href={`/admin/dashboard/${v.id}`}
                          className="flex items-center gap-2 px-5 py-2 text-xs font-black uppercase bg-gray-900 text-white hover:bg-blue-600 rounded-xl transition-all tracking-widest shadow-lg shadow-gray-200"
                        >
                          View Full Details
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}


function StatCard({ label, count, icon: Icon, color }: any) {
  const colorMap: any = {
    amber: { light: "bg-amber-50", text: "text-amber-600", border: "border-amber-100", progress: "bg-amber-500" },
    green: { light: "bg-emerald-50", text: "text-emerald-600", border: "border-emerald-100", progress: "bg-emerald-500" },
    blue: { light: "bg-blue-50", text: "text-blue-600", border: "border-blue-100", progress: "bg-blue-500" },
    red: { light: "bg-rose-50", text: "text-rose-600", border: "border-rose-100", progress: "bg-rose-500" },
  };
  const theme = colorMap[color];

  return (
    <div className={`bg-white p-6 rounded-3xl border ${theme.border} shadow-sm relative overflow-hidden group`}>
      <div className="flex items-center justify-between relative z-10">
        <div className={`p-3 rounded-2xl ${theme.light} ${theme.text}`}>
          <Icon size={24} />
        </div>
        <h3 className="text-3xl font-black text-gray-900 tracking-tighter">{count}</h3>
      </div>
      <p className="text-xs font-black uppercase tracking-[0.1em] text-gray-400 mt-4 relative z-10">{label}</p>
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gray-50">
        <div className={`h-full ${theme.progress} transition-all duration-1000`} style={{ width: '40%' }} />
      </div>
    </div>
  );
}

function Badge({ status }: { status: string }) {
  const styles: any = {
    approved: "bg-emerald-50 text-emerald-700 border-emerald-100",
    rejected: "bg-rose-50 text-rose-700 border-rose-100",
    pending: "bg-amber-50 text-amber-700 border-amber-100",
  };
  return (
    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${styles[status]}`}>
      {status}
    </span>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="text-center py-24">
      <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100">
        <Car size={32} className="text-gray-300" />
      </div>
      <h3 className="text-gray-900 font-bold">No Records Found</h3>
      <p className="text-gray-400 text-sm max-w-xs mx-auto mt-1">{message}</p>
    </div>
  );
}

function TableLoader() {
  return (
    <div className="flex flex-col items-center justify-center py-24 space-y-4">
      <div className="w-10 h-10 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" />
      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Fetching Data...</p>
    </div>
  );
}