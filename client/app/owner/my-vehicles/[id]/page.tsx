'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Camera, Save, ArrowLeft, Loader2, MapPin, CheckCircle, XCircle } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

interface SavedLocation {
  id: number;
  locationName: string;
}

export default function EditVehiclePage() {
  const { id } = useParams();
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    vehicleCondition: '',
    pricePerDay: '',
    locationId: '',
    availabilityStatus: 'available',
  });
  
  const [locations, setLocations] = useState<SavedLocation[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  useEffect(() => {
    const initializeData = async () => {
      try {
        const headers = getAuthHeader();
        
        const [vehicleRes, hubsRes] = await Promise.all([
          axios.get(`${API_URL}/api/vehicles/owner-vehicles/${id}`, { headers }),
          axios.get(`${API_URL}/api/locations/my-locations`, { headers })
        ]);

        if (hubsRes.data.success) {
          setLocations(hubsRes.data.data);
        }

        // Set Vehicle Data
        if (vehicleRes.data.success && vehicleRes.data.vehicle) {
          const v = vehicleRes.data.vehicle;
          setFormData({
            vehicleCondition: v.vehicleCondition || '',
            pricePerDay: v.pricePerDay || '',
            locationId: v.locationId?.toString() || '',
            availabilityStatus: v.availabilityStatus || 'available',
          });
          setExistingImages(v.documentImage?.vehicleImages || []);
        }
      } catch (err) {
        console.error("Initialization error:", err);
        toast.error("Failed to load vehicle data");
      } finally {
        setFetching(false);
      }
    };

    initializeData();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const data = new FormData();
    data.append('vehicleCondition', formData.vehicleCondition);
    data.append('pricePerDay', formData.pricePerDay);
    data.append('locationId', formData.locationId);
    data.append('availabilityStatus', formData.availabilityStatus);

    if (selectedFiles) {
      Array.from(selectedFiles).forEach((file) => data.append('vehicleImages', file));
    }

    try {
      await axios.put(`${API_URL}/api/vehicles/update/${id}`, data, {
        headers: { 
          ...getAuthHeader(),
          'Content-Type': 'multipart/form-data' 
        }
      });
      toast.success("Vehicle updated!");
      router.push('/owner/my-vehicles');
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div className="flex justify-center p-20"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="max-w-2xl mx-auto p-6 bg-slate-50 min-h-screen text-black">
      <button onClick={() => router.back()} className="flex items-center text-slate-600 mb-6 hover:text-black">
        <ArrowLeft size={18} className="mr-2" /> Back
      </button>

      <div className="bg-white rounded-3xl shadow-xl border p-8 space-y-6">
        <h1 className="text-2xl font-bold">Edit Vehicle</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            {/* Condition */}
            <div className="space-y-2">
              <label className="text-sm font-semibold">Condition</label>
              <input 
                value={formData.vehicleCondition}
                onChange={(e) => setFormData({...formData, vehicleCondition: e.target.value})}
                className="w-full border rounded-xl p-2.5 bg-slate-50 focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>

            {/* Price */}
            <div className="space-y-2">
              <label className="text-sm font-semibold">Price/Day (NPR)</label>
              <input 
                type="number"
                value={formData.pricePerDay}
                onChange={(e) => setFormData({...formData, pricePerDay: e.target.value})}
                className="w-full border rounded-xl p-2.5 bg-slate-50 focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Hub Selector */}
            <div className="space-y-2">
              <label className="text-sm font-semibold flex items-center gap-2">
                <MapPin size={16} /> Pickup Hub
              </label>
              <select 
                value={formData.locationId}
                onChange={(e) => setFormData({...formData, locationId: e.target.value})}
                className="w-full border rounded-xl p-2.5 bg-slate-50 outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Select a Hub</option>
                {locations.map(loc => (
                  <option key={loc.id} value={loc.id}>{loc.locationName}</option>
                ))}
              </select>
            </div>

            {/* Availability Status */}
            <div className="space-y-2">
              <label className="text-sm font-semibold flex items-center gap-2">
                Availability
              </label>
              <select 
                value={formData.availabilityStatus}
                onChange={(e) => setFormData({...formData, availabilityStatus: e.target.value})}
                className="w-full border rounded-xl p-2.5 bg-slate-50 outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="available">Available</option>
                <option value="unavailable">Unavailable</option>
              </select>
            </div>
          </div>

          {/* Image Section */}
          <div className="space-y-3">
            <label className="text-sm font-semibold">Vehicle Images</label>
            <div className="flex flex-wrap gap-2">
              {existingImages.map((img, idx) => (
                <img key={idx} src={img} className="w-16 h-16 object-cover rounded-lg border shadow-sm" alt="vehicle" />
              ))}
            </div>
            <div className="relative border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center hover:bg-slate-50 transition cursor-pointer">
              <input 
                type="file" multiple 
                onChange={(e) => setSelectedFiles(e.target.files)}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <Camera className="mx-auto text-slate-400 mb-1" />
              <p className="text-xs text-slate-500">Upload new images to replace existing ones</p>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold flex justify-center items-center hover:bg-indigo-700 transition disabled:bg-slate-300 shadow-lg shadow-indigo-100"
          >
            {loading ? <Loader2 className="animate-spin mr-2" /> : <Save className="mr-2" />}
            Save Changes
          </button>
        </form>
      </div>
    </div>
  );
}