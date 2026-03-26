'use client';

import React, { useState } from 'react';
import axios from 'axios';
import dynamic from 'next/dynamic';
import { Navigation, MapPin, Building2, Globe } from 'lucide-react';

const MapComponent = dynamic(() => import('../(components)/MapComponent'), { 
    ssr: false,
    loading: () => <div className="h-full w-full bg-slate-100 animate-pulse flex items-center justify-center text-slate-400 font-bold uppercase tracking-widest text-xs">Initializing Map...</div>
});

interface LocationFormData {
    locationName: string;
    province: string;
    city: string;
    addressLine: string;
    latitude: number | '';
    longitude: number | '';
}

const AddLocationForm: React.FC = () => {
    const [position, setPosition] = useState<[number, number] | null>(null);
    const [loadingLocation, setLoadingLocation] = useState(false);
    const [formData, setFormData] = useState<LocationFormData>({
        locationName: '', province: '', city: '', addressLine: '', latitude: '', longitude: ''
    });

    const fetchAddressFromCoords = async (lat: number, lng: number) => {
        try {
            const response = await fetch(
                `http://localhost:3001/api/proxy/geocode?lat=${lat}&lon=${lng}`
            );
            
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
            console.error("Geocoding error via proxy:", error);
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
            },
            () => {
                alert("Location access denied. Please enable GPS.");
                setLoadingLocation(false);
            }
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            await axios.post('http://localhost:3001/api/locations/add', formData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert("Location Hub Saved Successfully!");
        } catch (err) {
            console.error(err);
            alert("Error saving location. Check console for details.");
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className="max-w-2xl mx-auto p-8 bg-white shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] rounded-[2.5rem] border border-slate-100 my-10 font-sans text-slate-900">
            <header className="mb-10">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-3 bg-blue-600 rounded-2xl text-white">
                        <MapPin size={24} />
                    </div>
                    <h2 className="text-3xl font-black tracking-tighter uppercase italic">Create Pickup <span className="text-blue-600">Hub</span></h2>
                </div>
                <p className="text-slate-500 font-medium">Define the exact coordinates and details for your Smart Sawari base.</p>
            </header>
            
            <form onSubmit={handleSubmit} className="space-y-5">
                {/* HUB NAME */}
                <div className="group">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4 mb-1.5 block">Hub Identity</label>
                    <div className="relative">
                        <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition" size={18} />
                        <input 
                            name="locationName"
                            placeholder="e.g., Kathmandu Main Hub" 
                            className="w-full pl-12 pr-4 py-4 border-2 border-slate-100 rounded-2xl bg-slate-50 outline-none focus:border-blue-600/20 focus:ring-4 focus:ring-blue-600/5 transition-all font-bold"
                            value={formData.locationName}
                            onChange={handleChange}
                            required
                        />
                    </div>
                </div>

                {/* PROVINCE & CITY (Now Editable) */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="group">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4 mb-1.5 block">Province</label>
                        <input 
                            name="province"
                            placeholder="Bagmati" 
                            value={formData.province} 
                            onChange={handleChange}
                            className="w-full p-4 border-2 border-slate-100 rounded-2xl bg-slate-50 outline-none focus:border-blue-600/20 focus:ring-4 focus:ring-blue-600/5 transition-all font-bold" 
                        />
                    </div>
                    <div className="group">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4 mb-1.5 block">City</label>
                        <input 
                            name="city"
                            placeholder="Kathmandu" 
                            value={formData.city} 
                            onChange={handleChange}
                            className="w-full p-4 border-2 border-slate-100 rounded-2xl bg-slate-50 outline-none focus:border-blue-600/20 focus:ring-4 focus:ring-blue-600/5 transition-all font-bold" 
                        />
                    </div>
                </div>

                {/* FULL ADDRESS */}
                <div className="group">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4 mb-1.5 block">Specific Street Address</label>
                    <div className="relative">
                        <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition" size={18} />
                        <input 
                            name="addressLine"
                            placeholder="Pokhara, Street 4, Bike Rental Area" 
                            value={formData.addressLine} 
                            onChange={handleChange}
                            className="w-full pl-12 pr-4 py-4 border-2 border-slate-100 rounded-2xl bg-slate-50 outline-none focus:border-blue-600/20 focus:ring-4 focus:ring-blue-600/5 transition-all font-bold" 
                        />
                    </div>
                </div>

                {/* MAP BOX */}
                <div className="relative pt-4">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4 mb-1.5 block">Geospatial Marker</label>
                    <button
                        type="button" 
                        onClick={handleGetCurrentLocation}
                        disabled={loadingLocation}
                        className="absolute top-14 right-4 z-[500] flex items-center gap-2 bg-white px-5 py-2.5 rounded-2xl shadow-xl text-blue-600 font-black text-xs uppercase tracking-tight hover:bg-blue-50 transition-all border border-blue-100 active:scale-95 disabled:opacity-50"
                    >
                        <Navigation size={14} fill="currentColor" className={loadingLocation ? "animate-ping" : ""} />
                        {loadingLocation ? "Locating..." : "Pin My Spot"}
                    </button>

                    <div className="h-80 w-full rounded-[2rem] overflow-hidden border-4 border-slate-50 shadow-2xl relative">
                        <MapComponent position={position} setPosition={setPosition} setFormData={setFormData} />
                    </div>
                </div>

                {/* SUBMIT */}
                <button type="submit" className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-lg hover:bg-black transition-all shadow-xl shadow-slate-200 uppercase tracking-tighter italic">
                    Establish Pickup Location
                </button>
            </form>
        </div>
    );
};

export default AddLocationForm;