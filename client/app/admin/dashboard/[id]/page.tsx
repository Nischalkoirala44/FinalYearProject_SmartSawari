"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  fetchVerificationById,
  approveVerification,
  rejectVerification,
} from "../../../../services/Admin";
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Maximize2,
  Download,
  Loader2,
  ExternalLink,
  Car,
  FileText,
  Clock,
  ShieldCheck,
  AlertCircle,
  Calendar,
  Banknote,
  Hash,
  ChevronRight
} from "lucide-react";

export default function AdminVerificationDetails() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id ? (Array.isArray(params.id) ? params.id[0] : params.id) : null;

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "";

  const fetchData = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      const res = await fetchVerificationById(id);
      if (res.success) setData(res.verification);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const getUrl = (img: string) => {
    const sanitized = img.replace(/"/g, "").trim();
    return sanitized.startsWith("http") ? sanitized : `${baseUrl}/${sanitized}`;
  };

  const handleApprove = async (id: number) => {
    if (!confirm("Confirm approval for this vehicle?")) return;
    setActionLoading(true);
    try {
      await approveVerification(id);
      fetchData();
    } catch (e) {
      alert("Approve failed");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (id: number) => {
    const reason = prompt("Enter reason for rejection:");
    if (!reason) return;
    setActionLoading(true);
    try {
      await rejectVerification(id, reason);
      fetchData();
    } catch (e) {
      alert("Reject failed");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
        <p className="text-gray-400 font-medium">Synchronizing records...</p>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="max-w-5xl mx-auto pb-20 space-y-8 animate-in fade-in duration-700">
      
      {/* 1. BREADCRUMBS & TOP NAV */}
      <div className="flex items-center justify-between">
        <nav className="flex items-center gap-2 text-sm font-medium text-gray-500">
          <button onClick={() => router.back()} className="hover:text-blue-600 transition-colors">Admin</button>
          <ChevronRight size={14} />
          <button onClick={() => router.back()} className="hover:text-blue-600 transition-colors">Verifications</button>
          <ChevronRight size={14} />
          <span className="text-gray-900 font-bold">Request #{data.id}</span>
        </nav>
        
        <div className="flex items-center gap-4">
            <span className="text-xs text-gray-400 flex items-center">
              <Calendar size={14} className="mr-1" /> {data.created_at ? new Date(data.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "2-digit" }) : "N/A"}
            </span>
            <StatusBadge status={data.status} />
        </div>
      </div>

      {/* 2. MAIN ACTION HEADER */}
      <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-xl shadow-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-2 h-full bg-blue-600" />
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
            <Car size={32} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">{data.registrationNumber}</h1>
            <p className="text-gray-500 font-medium capitalize">{data.vehicleType} • {data.vehicleCondition || "Standard"}</p>
          </div>
        </div>

        {data.status === "pending" && (
          <div className="flex items-center gap-3">
            <button
              disabled={actionLoading}
              onClick={() => handleReject(data.id)}
              className="px-6 py-3 text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-2xl transition-all font-bold text-sm disabled:opacity-50"
            >
              Reject
            </button>
            <button
              disabled={actionLoading}
              onClick={() => handleApprove(data.id)}
              className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl transition-all font-bold text-sm shadow-lg shadow-blue-200 disabled:opacity-50 flex items-center gap-2"
            >
              {actionLoading ? <Loader2 size={18} className="animate-spin" /> : <ShieldCheck size={18} />}
              Approve Asset
            </button>
          </div>
        )}
      </div>

      {/* 3. VEHICLE PROFILE SUMMARY (STACKED TOP) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <DetailTile label="Registration" value={data.registrationNumber} icon={Hash} />
        <DetailTile label="Pricing" value={`$${data.pricePerDay} / day`} icon={Banknote} />
        <DetailTile label="Type" value={data.vehicleType} icon={Car} />
        <DetailTile label="Condition" value={data.vehicleCondition || "Good"} icon={ShieldCheck} />
      </div>

      {data.rejectionReason && (
        <div className="bg-rose-50 border-l-4 border-rose-500 p-4 rounded-r-xl">
          <div className="flex items-center gap-2 text-rose-800 font-bold text-xs uppercase mb-1">
            <AlertCircle size={14} /> Rejection Reason
          </div>
          <p className="text-rose-700 text-sm leading-relaxed">{data.rejectionReason}</p>
        </div>
      )}

      {/* 4. DOCUMENT EVIDENCE (BELOW) */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-black text-gray-900 uppercase tracking-widest flex items-center gap-2">
            <FileText className="text-blue-600" size={20} />
            Document Evidence
          </h2>
          <span className="text-xs font-bold text-gray-400 bg-gray-100 px-3 py-1 rounded-full uppercase">
            {Object.keys(data.documentImage || {}).length} Categories
          </span>
        </div>

        <div className="space-y-10">
          {data.documentImage && Object.entries(data.documentImage).map(([category, images]: any) => (
            <div key={category} className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
              <h4 className="text-sm font-black text-gray-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
                {category} <div className="h-px flex-1 bg-gray-50" />
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {images.map((img: string, i: number) => {
                  const url = getUrl(img);
                  return (
                    <div key={i} className="group relative rounded-2xl overflow-hidden bg-gray-50 border border-gray-200 aspect-[4/3]">
                      <img
                        src={url}
                        alt={category}
                        className="object-cover w-full h-full"
                      />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-3 backdrop-blur-[2px]">
                         <button 
                          onClick={() => setSelectedImage(url)}
                          className="p-3 bg-white rounded-full text-blue-600 transform scale-90 group-hover:scale-100 transition-all shadow-xl"
                        >
                          <Maximize2 size={20} />
                        </button>
                        <a 
                          href={url} 
                          download 
                          className="p-3 bg-white/20 hover:bg-white text-white hover:text-gray-900 rounded-full backdrop-blur-md transition-all scale-90 group-hover:scale-100"
                        >
                          <Download size={20} />
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* IMAGE MODAL */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-gray-900/95 z-[100] flex items-center justify-center p-6 backdrop-blur-md cursor-zoom-out animate-in fade-in duration-300"
          onClick={() => setSelectedImage(null)}
        >
          <img src={selectedImage} alt="Preview" className="max-h-full max-w-full rounded-xl shadow-2xl ring-1 ring-white/20" />
          <button className="absolute top-10 right-10 text-white font-bold text-xs uppercase bg-white/10 px-6 py-3 rounded-full hover:bg-white/20">
            Close Viewer
          </button>
        </div>
      )}
    </div>
  );
}

// Sub-components
function DetailTile({ label, value, icon: Icon }: any) {
  return (
    <div className="bg-white border border-gray-100 p-5 rounded-3xl shadow-sm">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 bg-blue-50 rounded-xl text-blue-600">
          <Icon size={16} />
        </div>
        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{label}</span>
      </div>
      <p className="text-lg font-bold text-gray-900 truncate">{value}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: any = {
    pending: "bg-amber-100 text-amber-700",
    approved: "bg-emerald-100 text-emerald-700",
    rejected: "bg-rose-100 text-rose-700",
  };
  return (
    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${styles[status]}`}>
      {status}
    </span>
  );
}