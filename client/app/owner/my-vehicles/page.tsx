'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Edit3, Trash2, Plus, MapPin, CheckCircle, Clock, AlertCircle, Loader2 } from 'lucide-react';
import axios from 'axios';

export default function MyVehiclesPage() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVehicles();
  }, []);

const fetchVehicles = async () => {
  try {
    const token = localStorage.getItem('token'); 

    const res = await axios.get("http://localhost:3001/api/vehicles/owner-vehicles", {
      headers: {
        Authorization: `Bearer ${token}` 
      }
    });

    if (res.data.success) {
      setVehicles(res.data.vehicles);
    }
  } catch (err: any) {
    if (err.response?.status === 401) {
      console.error("User is not logged in or token expired"); 
    }
  } finally {
    setLoading(false);
  }
};

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this vehicle? This action cannot be undone.")) return;

    try {
      await axios.delete(`http:localhost3001/api/vehicles/${id}`);
      setVehicles(vehicles.filter((v: any) => v.id !== id));
    } catch (err) {
      alert("Failed to delete vehicle");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <span className="flex items-center text-xs font-medium text-green-700 bg-green-100 px-2.5 py-0.5 rounded-full"><CheckCircle size={12} className="mr-1"/> Approved</span>;
      case 'pending':
        return <span className="flex items-center text-xs font-medium text-amber-700 bg-amber-100 px-2.5 py-0.5 rounded-full"><Clock size={12} className="mr-1"/> Pending</span>;
      default:
        return <span className="flex items-center text-xs font-medium text-red-700 bg-red-100 px-2.5 py-0.5 rounded-full"><AlertCircle size={12} className="mr-1"/> {status}</span>;
    }
  };

  if (loading) return <div className="flex justify-center items-center min-h-screen"><Loader2 className="animate-spin text-blue-600" size={40} /></div>;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Vehicles</h1>
          <p className="text-gray-500">Manage your posted vehicles and track verification status.</p>
        </div>
        <Link href="/vehicles/new" className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
          <Plus size={18} className="mr-2" /> Post New Vehicle
        </Link>
      </div>

      {vehicles.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-xl border-2 border-dashed">
          <p className="text-gray-500">You haven't posted any vehicles yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vehicles.map((vehicle: any) => (
            <div key={vehicle.id} className="bg-white rounded-xl shadow-sm border overflow-hidden hover:shadow-md transition">
              {/* Image Header */}
              <div className="relative h-48 w-full bg-gray-200">
                <img 
                  src={vehicle.documentImage?.vehicleImages?.[0] || 'https://via.placeholder.com/400x300?text=No+Image'} 
                  className="w-full h-full object-cover"
                  alt={vehicle.vehicleType}
                />
                <div className="absolute top-3 right-3">
                  {getStatusBadge(vehicle.status)}
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-bold text-gray-900">{vehicle.vehicleType}</h3>
                  <span className="text-blue-600 font-semibold">Rs. {vehicle.pricePerDay}/day</span>
                </div>
                
                <p className="text-sm text-gray-600 flex items-center mb-4">
                  <MapPin size={14} className="mr-1" /> {vehicle.registrationNumber}
                </p>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex space-x-2">
                    <Link 
                      href={`/owner/my-vehicles/${vehicle.id}`}
                      className="p-2 text-gray-600 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition"
                      title="Edit Vehicle"
                    >
                      <Edit3 size={18} />
                    </Link>
                    <button 
                      onClick={() => handleDelete(vehicle.id)}
                      className="p-2 text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-lg transition"
                      title="Delete Vehicle"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                  <span className="text-xs text-gray-400">
                    Added: {new Date(vehicle.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}