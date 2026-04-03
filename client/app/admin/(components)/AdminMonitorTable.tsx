import React from "react";

export const AdminMonitorTable = ({ data = [] }: { data: any[] }) => {
  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
      {/* Header Section */}
      <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
        <div>
          <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-800">
            Transmission Logs
          </h3>
          <p className="text-[10px] text-slate-500 uppercase mt-1">
            Real-time Booking & Financial Audit
          </p>
        </div>
      </div>
      
      {/* Table Section */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
              <th className="px-6 py-4">Ref ID</th>
              <th className="px-6 py-4">Client</th>
              <th className="px-6 py-4">Gateway (eSewa)</th>
              <th className="px-6 py-4">Amount</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Timestamp</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-[12px]">
            {data && data.length > 0 ? (
              data.map((log: any) => (
                <tr key={log.bookingId} className="hover:bg-slate-50/80 transition-colors group">
                  <td className="px-6 py-4 font-mono font-bold text-red-600">
                    #{log.bookingId}
                  </td>
                  <td className="px-6 py-4 text-slate-700 font-semibold">
                    {log.userName}
                  </td>
                  <td className="px-6 py-4 font-mono text-slate-400 text-[11px]">
                    {log.esewaRef ? (
                      <span className="text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                        {log.esewaRef}
                      </span>
                    ) : (
                      <span className="opacity-40 italic">Waiting...</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-slate-900 font-bold">
                    Rs. {Number(log.amount).toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider
                      ${log.status === 'completed' ? 'bg-green-100 text-green-700' : 
                        log.status === 'confirmed' ? 'bg-blue-100 text-blue-700' : 
                        'bg-amber-100 text-amber-700'}`}>
                      {log.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-400 text-[11px] text-right font-medium">
                    {log.createdAt ? new Date(log.createdAt).toLocaleString() : "N/A"}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-6 py-16 text-center text-slate-400 uppercase text-[11px] tracking-widest font-bold">
                  No Transmission Data Found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};