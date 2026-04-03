"use client";
import { useState } from "react";
import { UserCircle, Search, Wallet, Smartphone, ShieldCheck } from "lucide-react";

export const AdminUserTable = ({ users }: { users: any[] }) => {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const filteredUsers = users?.filter(user => {
    const matchesRole = filter === "all" || user.role === filter;
    const matchesSearch = user.name.toLowerCase().includes(search.toLowerCase()) || 
                          user.email.toLowerCase().includes(search.toLowerCase());
    return matchesRole && matchesSearch;
  }) || [];

  return (
    <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm mt-8">
      {/* Table Header Controls */}
      <div className="p-8 border-b border-slate-100 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <h2 className="text-xl font-black uppercase tracking-tighter text-slate-900">User Management</h2>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">Platform Access & Financial Audit</p>
        </div>

        <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
          {/* Enhanced Search */}
          <div className="relative flex-1 lg:flex-none">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input 
              type="text"
              placeholder="Search by name or email..."
              className="pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs w-full lg:w-64 focus:bg-white focus:ring-2 focus:ring-red-500/10 transition-all outline-none"
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Tabbed Filter */}
          <div className="flex bg-slate-100 p-1.5 rounded-2xl">
            {['all', 'owner', 'renter'].map((r) => (
              <button
                key={r}
                onClick={() => setFilter(r)}
                className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  filter === r ? "bg-white text-red-600 shadow-sm" : "text-slate-500 hover:text-slate-800"
                }`}
              >
                {r}s
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Responsive Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="bg-slate-50/50">
              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">User Profile</th>
              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Security Role</th>
              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Payout Details</th>
              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Financials</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredUsers.map((user) => (
              <tr key={user.id} className="hover:bg-slate-50/40 transition-colors group">
                {/* Identity Column */}
                <td className="px-8 py-6">
                  <div className="flex items-center gap-4">
                    <div className="h-11 w-11 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 group-hover:border-red-200 group-hover:bg-red-50 transition-all overflow-hidden">
                      {user.profileImage ? (
                        <img src={user.profileImage} alt="profile" className="h-full w-full object-cover" />
                      ) : (
                        <UserCircle size={24} />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-900 leading-tight">{user.name}</p>
                      <p className="text-[11px] text-slate-500 font-medium">{user.email}</p>
                    </div>
                  </div>
                </td>

                {/* Role Badge */}
                <td className="px-8 py-6">
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${
                      user.role === 'owner' ? "bg-blue-50 text-blue-600 border-blue-100" :
                      user.role === 'admin' ? "bg-purple-50 text-purple-600 border-purple-100" :
                      "bg-orange-50 text-orange-600 border-orange-100"
                    }`}>
                      {user.role}
                    </span>
                    {user.role === 'owner' && <ShieldCheck size={14} className="text-blue-400" />}
                  </div>
                </td>

                {/* Contact & Payout */}
                <td className="px-8 py-6">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-slate-600">
                      <Smartphone size={12} />
                      <span className="text-xs font-bold">{user.mobile || 'No Mobile'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-400">
                      <Wallet size={12} className="text-green-500" />
                      <span className="text-[10px] font-bold uppercase tracking-tight">
                        eSewa: {user.esewaMobile || 'Not Linked'}
                      </span>
                    </div>
                  </div>
                </td>

                {/* Financial Audit - Showing totalEarned and earningsBalance */}
                <td className="px-8 py-6 text-right">
                  {user.role === 'owner' ? (
                    <div className="flex flex-col items-end">
                      <p className="text-sm font-black text-slate-900">Rs. {user.totalEarned}</p>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
                        <p className="text-[10px] font-bold text-red-600 uppercase tracking-tighter">
                          Payable: Rs. {user.earningsBalance}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <span className="text-[10px] font-black text-slate-300 uppercase italic">N/A (Renter)</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};