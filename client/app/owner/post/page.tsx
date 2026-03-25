"use client";

import { useState, ChangeEvent, FormEvent, ReactNode, useEffect } from "react";
import { 
  User, FileText, Image as ImageIcon, UploadCloud, CheckCircle2, X, MapPin 
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
  selfie: { max: 1, label: "Selfie" },
  license: { max: 2, label: "Driving License" },
  citizenship: { max: 2, label: "Citizenship" },
  bluebook: { max: 10, label: "Bluebook Pages" },
  vehicleImages: { max: 5, label: "Vehicle Images" },
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
      } else {
        setLocations([]);
      }
    } catch (err) {
      console.error("Location fetch error", err);
      setLocations([]);
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
      return toast.error(`Max ${FILE_LIMITS[field].max} allowed for ${FILE_LIMITS[field].label}`);
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
      <div className="space-y-3 flex flex-col">
        <div className="flex justify-between items-center">
          <Label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
            {icon} {config.label}
          </Label>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isFull ? 'bg-red-100 text-red-600' : 'bg-indigo-50 text-indigo-600'}`}>
            {currentPreviews.length} / {config.max}
          </span>
        </div>
        <div className="relative group">
          <input
            key={resetKey + field}
            type="file"
            multiple={config.max > 1}
            accept="image/*"
            disabled={isFull}
            onChange={handleFileChange(field)}
            className="absolute inset-0 w-full h-full opacity-0 z-10 cursor-pointer disabled:cursor-not-allowed"
          />
          <div className={`border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center transition-all ${
            currentPreviews.length > 0 ? "border-indigo-400 bg-indigo-50/30" : "border-slate-200 bg-slate-50"
          } ${isFull ? "opacity-50" : ""}`}>
            <UploadCloud size={24} className={currentPreviews.length > 0 ? "text-indigo-500" : "text-slate-400"} />
            <span className="text-xs mt-2 text-slate-500 font-medium">{isFull ? "Full" : "Add"}</span>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap min-h-[48px]">
          {currentPreviews.map((url, i) => (
            <div key={i} className="relative h-12 w-12 group/img">
              <img src={url} alt="p" className="h-full w-full rounded-lg object-cover ring-2 ring-white" />
              <button type="button" onClick={() => removeFile(field, i)} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover/img:opacity-100 transition-opacity">
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
    if (!formData.registrationNumber || !formData.locationId) return toast.error("Missing Hub or Reg Number");
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
        toast.success("Success!");
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
      toast.error("Error submitting verification"); 
    } finally { 
      setIsLoading(false); 
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-4xl space-y-8 rounded-3xl bg-white p-8 shadow-2xl border border-slate-100 text-black">
      <div className="border-b pb-6">
        <h2 className="text-2xl font-bold">Vehicle Verification</h2>
        <p className="text-sm text-slate-500">All fields are required for approval.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Label className="text-sm font-semibold">Registration Number</Label>
          <Input placeholder="BA 1234" value={formData.registrationNumber} onChange={e => setFormData(p => ({ ...p, registrationNumber: e.target.value }))} className="rounded-xl" />
        </div>
        <div className="space-y-2">
  <Label className="text-sm font-semibold flex items-center gap-2">
    <MapPin size={16} /> Pickup Hub
  </Label>
  <Select 
    value={formData.locationId} 
    onValueChange={v => setFormData(p => ({ ...p, locationId: v }))}
  >
    <SelectTrigger className="rounded-xl bg-slate-50">
      <SelectValue placeholder={isLoadingLocations ? "Loading..." : "Select Hub"} />
    </SelectTrigger>
    
    {/* By default, SelectContent should be wrapped in a Portal. 
        Adding position="popper" helps Radix calculate focus correctly. */}
    <SelectContent position="popper" sideOffset={5} className="bg-white">
      {(locations || []).length > 0 ? (
        locations.map(loc => (
          <SelectItem key={loc.id} value={loc.id.toString()}>
            {loc.locationName}
          </SelectItem>
        ))
      ) : (
        <SelectItem value="none" disabled>
          {isLoadingLocations ? "Fetching hubs..." : "No hubs found"}
        </SelectItem>
      )}
    </SelectContent>
  </Select>
</div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="space-y-2">
          <Label className="text-sm font-semibold">Type</Label>
          <Select value={formData.vehicleType} onValueChange={v => setFormData(p => ({ ...p, vehicleType: v }))}>
            <SelectTrigger className="rounded-xl"><SelectValue placeholder="Type" /></SelectTrigger>
            <SelectContent className="bg-white">
              <SelectItem value="Bike">Bike</SelectItem>
              <SelectItem value="Car">Car</SelectItem>
              <SelectItem value="Scooter">Scooter</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label className="text-sm font-semibold">Condition</Label>
          <Input placeholder="Excellent" value={formData.vehicleCondition} onChange={e => setFormData(p => ({ ...p, vehicleCondition: e.target.value }))} className="rounded-xl" />
        </div>
        <div className="space-y-2">
          <Label className="text-sm font-semibold">Price/Day</Label>
          <Input type="number" value={formData.pricePerDay} onChange={e => setFormData(p => ({ ...p, pricePerDay: e.target.value }))} className="rounded-xl" />
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {uploadSection("selfie", <User size={18} />)}
        {uploadSection("license", <FileText size={18} />)}
        {uploadSection("citizenship", <FileText size={18} />)}
        {uploadSection("bluebook", <FileText size={18} />)}
      </div>

      <div className="bg-slate-50 p-6 rounded-2xl border">
        {uploadSection("vehicleImages", <ImageIcon size={18} />)}
      </div>

      <Button type="submit" disabled={isLoading} className="w-full rounded-2xl bg-indigo-600 py-7 text-white font-bold text-lg hover:bg-indigo-700 transition-colors">
        {isLoading ? "Uploading..." : "Submit Verification"}
      </Button>
    </form>
  );
}