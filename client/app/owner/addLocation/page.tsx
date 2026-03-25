// page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import dynamic from 'next/dynamic';
import { Navigation } from 'lucide-react';

// This is the crucial part:
const MapComponent = dynamic(() => import('../(components)/MapComponent'), { 
    ssr: false,
    loading: () => <div className="h-full w-full bg-slate-100 animate-pulse flex items-center justify-center">Loading Map...</div>
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
        // CALL YOUR BACKEND INSTEAD OF OPENSTREETMAP
        const response = await fetch(
            `http://localhost:3001/api/proxy/geocode?lat=${lat}&lon=${lng}`
        );
        
        if (!response.ok) throw new Error('Proxy error');
        
        const data = await response.json();
        const address = data.address;
        
        if (address) {
            setFormData(prev => ({
                ...prev,
                province: address.state || address.region || '',
                city: address.city || address.town || address.village || address.suburb || '',
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
                alert("Location access denied");
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
            alert("Location Hub Saved!");
        } catch (err) {
            alert("Error saving location");
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-8 bg-white shadow-2xl rounded-3xl border border-slate-100 my-10 font-sans text-black">
            <h2 className="text-3xl font-black mb-2">Create Pickup Hub</h2>
            <p className="text-slate-500 mb-8">Set up a base for your fleet.</p>
            
            <form onSubmit={handleSubmit} className="space-y-6">
                <input 
                    placeholder="Hub Name" 
                    className="w-full p-4 border rounded-2xl bg-slate-50 outline-none focus:ring-2 focus:ring-blue-500"
                    onChange={e => setFormData({...formData, locationName: e.target.value})}
                    required
                />

                <div className="grid grid-cols-2 gap-4">
                    <input placeholder="Province" value={formData.province} className="p-4 border rounded-2xl bg-slate-50" readOnly />
                    <input placeholder="City" value={formData.city} className="p-4 border rounded-2xl bg-slate-50" readOnly />
                </div>

                <input placeholder="Full Address" value={formData.addressLine} className="w-full p-4 border rounded-2xl bg-slate-50" readOnly />

                <div className="relative">
                    <button
                        type="button" onClick={handleGetCurrentLocation}
                        className="absolute top-4 right-4 z-[500] flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-lg text-blue-600 font-bold text-sm hover:scale-105 transition"
                    >
                        <Navigation size={16} fill="currentColor" />
                        {loadingLocation ? "Scanning..." : "Locate Me"}
                    </button>

                    <div className="h-80 w-full rounded-3xl overflow-hidden border shadow-inner">
                        {/* Map only renders on client */}
                        <MapComponent position={position} setPosition={setPosition} setFormData={setFormData} />
                    </div>
                </div>

                <button type="submit" className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-lg hover:bg-black transition-all">
                    Save Pickup Location
                </button>
            </form>
        </div>
    );
};

export default AddLocationForm;