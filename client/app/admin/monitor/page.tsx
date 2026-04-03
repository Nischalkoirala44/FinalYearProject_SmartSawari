"use client";
import { useEffect, useState } from "react";
import { AdminStats } from "../(components)/AdminStats";
import { AdminMonitorTable } from "../(components)/AdminMonitorTable";
import { AdminUserTable } from "../(components)/AdminUserTable";
import { AdminCharts } from "../(components)/AdminCharts";
import { Loader2, AlertCircle } from "lucide-react";

export default function AdminDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [users, setUsers] = useState([]);

useEffect(() => {
  const fetchUsers = async () => {
    const token = localStorage.getItem("token");
    const res = await fetch("http://localhost:3001/api/admin/users", {
       headers: { Authorization: `Bearer ${token}` }
    });
    const result = await res.json();
    if(result.success) setUsers(result.users);
  };
  fetchUsers();
}, []);


  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const token = localStorage.getItem("token");
        
        const response = await fetch("http://localhost:3001/api/admin/stats", {
          headers: { 
            Authorization: `Bearer ${token}` 
          }
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || "Failed to fetch stats");
        }

        setData(result);
      } catch (err: any) {
        console.error("Dashboard Load Error:", err); 
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchAdminData();
  }, []);

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-white">
      <Loader2 className="animate-spin text-red-600 mb-4" size={40} />
      <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
        Initializing Command Center
      </span>
    </div>
  );

  if (error) return (
    <div className="h-screen flex flex-col items-center justify-center bg-slate-50 p-6 text-center">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 max-w-md">
        <AlertCircle className="text-red-600 mb-4 mx-auto" size={48} />
        <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-2">
          System Link Failure
        </h2>
        <p className="text-slate-500 text-sm mb-6">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="bg-red-600 text-white px-6 py-2 rounded-lg font-bold text-xs uppercase tracking-widest hover:bg-red-700 transition-colors"
        >
          Retry Connection
        </button>
      </div>
    </div>
  );

  if (!data || !data.summary) return null;

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-12">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <header className="mb-10">
          <div className="flex items-center gap-4 mb-2">
            <div className="h-8 w-1.5 bg-red-600 rounded-full" />
            <h1 className="text-2xl font-black uppercase tracking-[0.3em] text-slate-900">
              Admin Dashboard
            </h1>
          </div>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest ml-[1.4rem]">
            Smart Sawari Management Interface
          </p>
        </header>

        {/* Statistical Overview */}
        <AdminStats stats={{
          revenue: data?.summary?.totalRevenue || 0,
          activeBookings: data?.bookingCounts?.find((b: any) => b.bookingStatus === 'confirmed')?.count || 0,
          totalVehicles: data?.summary?.totalVehicles || 0,
          totalUsers: data?.summary?.totalUsers || 0
        }} />

        {/* Revenue Chart */}
        <div className="mt-10">
          {data && data.analytics && (
            <AdminCharts data={data.analytics} />
          )}
        </div>


          <div className="mt-10">
<AdminUserTable users={users} />
          </div>
        

        {/* Transmission Logs Table */}
        <div className="mt-10">
          <AdminMonitorTable data={data?.transactions?.map((t: any) => ({
            bookingId: t.bookingId,
            userName: t.renter?.name || "Unknown User",
            amount: t.totalAmount,
            status: t.bookingStatus,
            esewaRef: t.transactionId,
            createdAt: t.createdAt
          })) || []} />
        </div>
      </div>
    </div>
  );
}