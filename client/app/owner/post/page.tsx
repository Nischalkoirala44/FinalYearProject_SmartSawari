"use client";

import { useState, ChangeEvent, FormEvent, ReactNode, useEffect } from "react";
import { 
  User, FileText, Image as ImageIcon, UploadCloud, 
  CheckCircle2, X, MapPin, ShieldCheck, Zap 
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import toast from "react-hot-toast";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

const FILE_LIMITS = {
  selfie: { max: 1, label: "Operator Selfie" },
  license: { max: 2, label: "Driving License" },
  citizenship: { max: 2, label: "Citizenship ID" },
  bluebook: { max: 10, label: "Bluebook Pages" },
  vehicleImages: { max: 5, label: "Vehicle High-Res" },
};

type FileField = keyof typeof FILE_LIMITS;

interface SavedLocation {
  id: number;
  locationName: string;
  city: string;
}

interface VerificationFormState {
  registrationNumber: string;
  vehicleType: string;
  vehicleCondition: string;
  pricePerDay: string;
  locationId: string;
  selfie: File[];
  license: File[];
  citizenship: File[];
  bluebook: File[];
  vehicleImages: File[];
}

type PreviewState = Record<FileField, string[]>;

const generateInitialFiles = <T extends any>(defaultValue: T): Record<FileField, T> => {
  const obj = {} as Record<FileField, T>;
  (Object.keys(FILE_LIMITS) as FileField[]).forEach(key => obj[key] = defaultValue);
  return obj;
};

export default function VerificationFormContent() {
  const [formData, setFormData] = useState<VerificationFormState>({
    registrationNumber: "",
    vehicleType: "",
    vehicleCondition: "",
    pricePerDay: "",
    locationId: "",
    ...generateInitialFiles<File[]>([]) 
  });

  const [previews, setPreviews] = useState<PreviewState>(generateInitialFiles<string[]>([]));
  const [locations, setLocations] = useState<SavedLocation[]>([]);
  const [isLoadingLocations, setIsLoadingLocations] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [resetKey, setResetKey] = useState(0);

  useEffect(() => {
  const fetchMyHubs = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/locations/my-locations`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const result = await res.json();
      
      if (result.success && Array.isArray(result.data)) {
        setLocations(result.data);
      }
    } catch (err) {
      console.error("Location fetch error", err);
    } finally {
      setIsLoadingLocations(false);
    }
  };
  fetchMyHubs();
}, []);

  const handleFileChange = (field: FileField) => (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const newlySelectedFiles = Array.from(e.target.files);
    const existingFiles = formData[field] || [];
    
    if (existingFiles.length + newlySelectedFiles.length > FILE_LIMITS[field].max) {
      return toast.error(`Limit: ${FILE_LIMITS[field].max} files only`);
    }

    const updatedFiles = [...existingFiles, ...newlySelectedFiles];
    (previews[field] || []).forEach(url => URL.revokeObjectURL(url));

    setFormData(prev => ({ ...prev, [field]: updatedFiles }));
    setPreviews(prev => ({ ...prev, [field]: updatedFiles.map(file => URL.createObjectURL(file)) }));
  };

  const removeFile = (field: FileField, index: number) => {
    const updatedFiles = (formData[field] || []).filter((_, i) => i !== index);
    if (previews[field]?.[index]) URL.revokeObjectURL(previews[field][index]);

    setFormData(prev => ({ ...prev, [field]: updatedFiles }));
    setPreviews(prev => ({ 
      ...prev, 
      [field]: (prev[field] || []).filter((_, i) => i !== index) 
    }));
  };

  const uploadSection = (field: FileField, icon: ReactNode) => {
    const config = FILE_LIMITS[field];
    const currentPreviews = previews[field] || [];
    const isFull = currentPreviews.length >= config.max;

    return (
      <div className="space-y-4 flex flex-col group/section">
        <div className="flex justify-between items-end">
          <Label className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-500 group-hover/section:text-red-500 transition-colors">
            {config.label}
          </Label>
          <span className={`text-[8px] font-black px-2 py-0.5 rounded-full ${isFull ? 'bg-red-500/20 text-red-500' : 'bg-white/5 text-gray-400'}`}>
            {currentPreviews.length}/{config.max}
          </span>
        </div>
        
        <div className="relative">
          <input
            key={resetKey + field}
            type="file"
            multiple={config.max > 1}
            accept="image/*"
            disabled={isFull}
            onChange={handleFileChange(field)}
            className="absolute inset-0 w-full h-full opacity-0 z-10 cursor-pointer disabled:cursor-not-allowed"
          />
          <div className={`border-2 border-dashed rounded-[1.5rem] p-6 flex flex-col items-center justify-center transition-all duration-300 ${
            currentPreviews.length > 0 
              ? "border-red-600/30 bg-red-600/5 shadow-[0_0_20px_rgba(220,38,38,0.05)]" 
              : "border-white/5 bg-[#0b1a27] hover:border-white/20"
          } ${isFull ? "opacity-30" : ""}`}>
            <div className={`p-2 rounded-xl mb-2 ${currentPreviews.length > 0 ? "bg-red-600 text-white" : "bg-white/5 text-gray-500"}`}>
              {currentPreviews.length > 0 ? <CheckCircle2 size={16} /> : <UploadCloud size={16} />}
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">{isFull ? "Limit Reached" : "Upload Data"}</span>
          </div>
        </div>

        <div className="flex gap-2 flex-wrap min-h-[48px] pt-1">
          {currentPreviews.map((url, i) => (
            <div key={i} className="relative h-14 w-14 group/img">
              <img src={url} alt="p" className="h-full w-full rounded-xl object-cover border border-white/10" />
              <button 
                type="button" 
                onClick={() => removeFile(field, i)} 
                className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full p-1 shadow-lg transform scale-0 group-hover/img:scale-100 transition-transform"
              >
                <X size={10} />
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!formData.registrationNumber || !formData.locationId) return toast.error("Deployment Parameters Missing");
    setIsLoading(true);
    
    try {
      const body = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          value.forEach(file => body.append(key, file));
        } else {
          body.append(key, value as string);
        }
      });

      const res = await fetch(`${API_URL}/api/verifications/create`, { 
        method: "POST", 
        credentials: "include", 
        body 
      });

      if (res.ok) {
        toast.success("Verification sequence initiated!");
        setFormData({
          registrationNumber: "",
          vehicleType: "",
          vehicleCondition: "",
          pricePerDay: "",
          locationId: "",
          ...generateInitialFiles<File[]>([])
        });
        setPreviews(generateInitialFiles<string[]>([]));
        setResetKey(k => k + 1);
      }
    } catch { 
      toast.error("Transmission Error"); 
    } finally { 
      setIsLoading(false); 
    }
  };

  return (
    <div className="min-h-screen bg-[#0b1a27] px-4 py-12">
      <form 
        onSubmit={handleSubmit} 
        className="mx-auto max-w-5xl space-y-12 rounded-[3rem] bg-[#0d1f2f] p-8 md:p-14 shadow-2xl border border-white/5 relative overflow-hidden"
      >
        {/* Cinematic Header */}
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <ShieldCheck className="text-red-600" size={24} />
            <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter leading-none">
              Asset <span className="text-red-600">Verification</span>
            </h2>
          </div>
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.3em] ml-1">Submit legal documentation for fleet deployment</p>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          <div className="space-y-2">
            <Label className="text-[9px] font-black uppercase text-gray-500 tracking-widest ml-1">Registration Identifier</Label>
            <Input 
              placeholder="e.g. BA 1234" 
              value={formData.registrationNumber} 
              onChange={e => setFormData(p => ({ ...p, registrationNumber: e.target.value }))} 
              className="rounded-2xl h-14 bg-[#0b1a27] border-white/5 text-white focus:border-red-600/50 transition-all font-bold placeholder:text-gray-800" 
            />
          </div>
          
          <div className="space-y-2">
            <Label className="text-[9px] font-black uppercase text-gray-500 tracking-widest ml-1">Deployment Hub</Label>
            <Select 
              value={formData.locationId} 
              onValueChange={v => setFormData(p => ({ ...p, locationId: v }))}
            >
              <SelectTrigger className="rounded-2xl h-14 bg-[#0b1a27] border-white/5 text-white font-bold uppercase tracking-tight">
                <SelectValue placeholder={isLoadingLocations ? "Scanning Hubs..." : "Select Operations Hub"} />
              </SelectTrigger>
              <SelectContent className="bg-[#0d1f2f] border-white/10 text-white">
                {(locations || []).length > 0 ? (
                  locations.map(loc => (
                    <SelectItem key={loc.id} value={loc.id.toString()} className="focus:bg-red-600 focus:text-white transition-colors">
                      {loc.locationName}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="none" disabled className="text-gray-600">
                    No operational hubs found
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          <div className="space-y-2">
            <Label className="text-[9px] font-black uppercase text-gray-500 tracking-widest ml-1">Asset Category</Label>
            <Select value={formData.vehicleType} onValueChange={v => setFormData(p => ({ ...p, vehicleType: v }))}>
              <SelectTrigger className="rounded-2xl h-14 bg-[#0b1a27] border-white/5 text-white font-bold uppercase tracking-tight">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent className="bg-[#0d1f2f] border-white/10 text-white">
                <SelectItem value="Bike" className="focus:bg-red-600">Two-Wheeler (Bike)</SelectItem>
                <SelectItem value="Car" className="focus:bg-red-600">Four-Wheeler (Car)</SelectItem>
                <SelectItem value="Scooter" className="focus:bg-red-600">Scooter</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label className="text-[9px] font-black uppercase text-gray-500 tracking-widest ml-1">Current State</Label>
            <Input 
              placeholder="e.g. Factory Stock" 
              value={formData.vehicleCondition} 
              onChange={e => setFormData(p => ({ ...p, vehicleCondition: e.target.value }))} 
              className="rounded-2xl h-14 bg-[#0b1a27] border-white/5 text-white font-bold placeholder:text-gray-800" 
            />
          </div>

          <div className="space-y-2">
            <Label className="text-[9px] font-black uppercase text-gray-500 tracking-widest ml-1">Target Yield (NPR/Day)</Label>
            <Input 
              type="number" 
              value={formData.pricePerDay} 
              onChange={e => setFormData(p => ({ ...p, pricePerDay: e.target.value }))} 
              className="rounded-2xl h-14 bg-[#0b1a27] border-white/5 text-white font-black text-xl italic placeholder:text-gray-800" 
            />
          </div>
        </div>

        {/* Documentation Matrix */}
        <div className="pt-6 border-t border-white/5">
          <h3 className="text-[10px] font-black text-red-600 uppercase tracking-[0.4em] mb-8">Documentation Matrix</h3>
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            {uploadSection("selfie", <User size={18} />)}
            {uploadSection("license", <FileText size={18} />)}
            {uploadSection("citizenship", <FileText size={18} />)}
            {uploadSection("bluebook", <FileText size={18} />)}
          </div>
        </div>

        <div className="bg-[#0b1a27] p-8 rounded-[2.5rem] border border-white/5 relative group/hero">
          <div className="absolute top-0 right-10 w-20 h-20 bg-red-600/5 blur-3xl rounded-full group-hover/hero:bg-red-600/10 transition-colors" />
          {uploadSection("vehicleImages", <ImageIcon size={18} />)}
          <p className="text-[8px] text-gray-600 font-bold uppercase mt-4 tracking-tighter italic">
            Note: High-impact images increase rental conversion rates by up to 40%.
          </p>
        </div>

        <Button 
          type="submit" 
          disabled={isLoading} 
          className="w-full rounded-[1.5rem] bg-red-600 py-10 text-white font-black text-xs uppercase tracking-[0.4em] hover:bg-red-700 transition-all shadow-xl shadow-red-900/20 active:scale-[0.98] disabled:bg-gray-800 disabled:text-gray-600"
        >
          {isLoading ? (
            <div className="flex items-center gap-3">
              <Zap className="animate-pulse" size={18} />
              Encrypting & Uploading...
            </div>
          ) : (
            "Deploy Asset for Verification"
          )}
        </Button>
      </form>
    </div>
  );
}