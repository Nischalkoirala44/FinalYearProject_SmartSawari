'use client';

import React, { useState } from 'react';
import axios from 'axios';
import dynamic from 'next/dynamic';
import { Navigation, MapPin, Building2, Globe, Info, Radar } from 'lucide-react';
import toast from 'react-hot-toast';

const MapComponent = dynamic(() => import('../(components)/MapComponent'), { 
    ssr: false,
    loading: () => (
        <div className="h-full w-full bg-[#0b1a27] animate-pulse flex flex-col items-center justify-center">
            <div className="w-8 h-8 border-2 border-red-600/20 border-t-red-600 rounded-full animate-spin mb-3" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-600">Initializing Grid...</span>
        </div>
    )
});

interface LocationFormData {
    locationName: string;
    province: string;
    city: string;
    addressLine: string;
    latitude: number | '';
    longitude: number | '';
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const AddLocationForm: React.FC = () => {
    const [position, setPosition] = useState<[number, number] | null>(null);
    const [loadingLocation, setLoadingLocation] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState<LocationFormData>({
        locationName: '', province: '', city: '', addressLine: '', latitude: '', longitude: ''
    });

    const fetchAddressFromCoords = async (lat: number, lng: number) => {
        try {
            const response = await fetch(`${API_URL}/api/locations/proxy/geocode?lat=${lat}&lon=${lng}`);
            if (!response.ok) throw new Error('Proxy error');
            const data = await response.json();
            const address = data.address;
            
            if (address) {
                setFormData(prev => ({
                    ...prev,
                    province: address.state || address.region || prev.province,
                    city: address.city || address.town || address.village || address.suburb || prev.city,
                    addressLine: data.display_name.split(',').slice(0, 3).join(',')
                }));
            }
        } catch (error) {
            console.error("Geocoding sequence failed:", error);
            toast.error("Reverse geocoding failed");
        }
    };

    const handleGetCurrentLocation = () => {
        if (typeof window === 'undefined' || !navigator.geolocation) return;
        setLoadingLocation(true);
        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                const { latitude, longitude } = pos.coords;
                setPosition([latitude, longitude]);
                setFormData(prev => ({ ...prev, latitude, longitude }));
                await fetchAddressFromCoords(latitude, longitude);
                setLoadingLocation(false);
                toast.success("Coordinates Acquired");
            },
            () => {
                toast.error("GPS Access Denied");
                setLoadingLocation(false);
            }
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_URL}/api/locations/add`, formData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success("Hub established successfully");
            
        } catch (err) {
            console.error(err);
            toast.error("Failed to establish hub");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className="min-h-screen bg-[#0b1a27] p-4 md:p-8 flex items-center justify-center">
            <div className="max-w-3xl w-full bg-[#0d1f2f] rounded-[3rem] border border-white/5 p-8 md:p-14 shadow-2xl relative overflow-hidden">
                {/* Background Radar Effect */}
                <div className="absolute -top-20 -right-20 w-64 h-64 bg-red-600/5 blur-[100px] rounded-full" />
                
                <header className="relative z-10 mb-12">
                    <div className="flex items-center gap-4 mb-3">
                        <div className="p-3 bg-red-600/10 rounded-2xl text-red-600 ring-1 ring-red-600/20">
                            <Radar size={24} className={loadingLocation ? "animate-pulse" : ""} />
                        </div>
                        <h2 className="text-4xl font-black italic uppercase tracking-tighter text-white leading-none">
                            Establish <span className="text-red-600">Hub</span>
                        </h2>
                    </div>
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] ml-1">Assign deployment coordinates for pickup operations</p>
                </header>
                
                <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
                    {/* HUB NAME */}
                    <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase tracking-widest text-gray-500 ml-1">Hub Designation</label>
                        <div className="relative group">
                            <Building2 className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-700 group-focus-within:text-red-600 transition-colors" size={18} />
                            <input 
                                name="locationName"
                                placeholder="e.g. Kathmandu Central Depot" 
                                className="w-full pl-14 pr-6 h-16 bg-[#0b1a27] border border-white/5 rounded-2xl text-white font-bold outline-none focus:border-red-600/40 transition-all placeholder:text-gray-800 italic"
                                value={formData.locationName}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    {/* PROVINCE & CITY */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[9px] font-black uppercase tracking-widest text-gray-500 ml-1">Province/State</label>
                            <input 
                                name="province"
                                placeholder="Bagmati" 
                                value={formData.province} 
                                onChange={handleChange}
                                className="w-full px-6 h-16 bg-[#0b1a27] border border-white/5 rounded-2xl text-white font-bold outline-none focus:border-red-600/40 transition-all placeholder:text-gray-800 uppercase tracking-tight" 
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[9px] font-black uppercase tracking-widest text-gray-500 ml-1">Primary City</label>
                            <input 
                                name="city"
                                placeholder="Kathmandu" 
                                value={formData.city} 
                                onChange={handleChange}
                                className="w-full px-6 h-16 bg-[#0b1a27] border border-white/5 rounded-2xl text-white font-bold outline-none focus:border-red-600/40 transition-all placeholder:text-gray-800 uppercase tracking-tight" 
                            />
                        </div>
                    </div>

                    {/* FULL ADDRESS */}
                    <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase tracking-widest text-gray-500 ml-1">Visual Address Marker</label>
                        <div className="relative group">
                            <Globe className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-700 group-focus-within:text-red-600 transition-colors" size={18} />
                            <input 
                                name="addressLine"
                                placeholder="Street 4, Near North Station" 
                                value={formData.addressLine} 
                                onChange={handleChange}
                                className="w-full pl-14 pr-6 h-16 bg-[#0b1a27] border border-white/5 rounded-2xl text-white font-bold outline-none focus:border-red-600/40 transition-all placeholder:text-gray-800 italic" 
                            />
                        </div>
                    </div>

                    {/* MAP SECTION */}
                    <div className="relative pt-4">
                        <div className="flex justify-between items-end mb-4 px-1">
                            <label className="text-[9px] font-black uppercase tracking-widest text-red-600">Geospatial Telemetry</label>
                            <div className="flex gap-4">
                                <span className="text-[8px] font-bold text-gray-600 uppercase tracking-tighter italic">Lat: {formData.latitude || '0.000'}</span>
                                <span className="text-[8px] font-bold text-gray-600 uppercase tracking-tighter italic">Lon: {formData.longitude || '0.000'}</span>
                            </div>
                        </div>

                        <div className="relative group">
                            <button
                                type="button" 
                                onClick={handleGetCurrentLocation}
                                disabled={loadingLocation}
                                className="absolute top-6 right-6 z-[1000] flex items-center gap-2 bg-red-600 text-white px-6 py-3 rounded-xl shadow-2xl font-black text-[10px] uppercase tracking-widest hover:bg-red-700 transition-all active:scale-95 disabled:opacity-50"
                            >
                                <Navigation size={14} fill="currentColor" className={loadingLocation ? "animate-ping" : ""} />
                                {loadingLocation ? "Scanning..." : "Acquire GPS"}
                            </button>

                            <div className="h-96 w-full relative z-[1] rounded-[2rem] overflow-hidden border-2 border-white/5 shadow-inner relative group-hover:border-red-600/20 transition-all duration-500">
                                <MapComponent position={position} setPosition={setPosition} setFormData={setFormData} />
                            </div>
                        </div>
                    </div>

                    {/* SUBMIT */}
                    <button 
                        type="submit" 
                        disabled={isSubmitting}
                        className="w-full group bg-red-600 text-white py-6 rounded-[1.5rem] font-black text-xs uppercase tracking-[0.4em] hover:bg-red-700 transition-all shadow-xl shadow-red-900/20 active:scale-[0.98] disabled:bg-gray-800 disabled:text-gray-600"
                    >
                        {isSubmitting ? "Syncing Hub..." : "Initialize Hub Deployment"}
                    </button>
                </form>

                {/* Tactical Footer */}
                <div className="mt-10 flex items-start gap-4 p-6 bg-[#0b1a27]/50 rounded-[2rem] border border-white/5">
                    <Info className="text-red-600 shrink-0" size={18} />
                    <p className="text-[9px] text-gray-500 font-bold uppercase leading-relaxed tracking-tight italic">
                        Hub initialization requires precise geospatial coordinates. Ensure the red marker aligns exactly with your vehicle storage or pickup point to avoid rental navigation errors.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AddLocationForm;