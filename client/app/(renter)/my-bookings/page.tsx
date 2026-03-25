"use client";

import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import Image from "next/image";
import dynamic from "next/dynamic";
import {
  MapPin,
  Navigation,
  X,
  Printer,
  ArrowLeft,
  Loader2,
} from "lucide-react";

const BookingMap = dynamic(() => import("../(components)/BookingMap"), {
  ssr: false,
  loading: () => (
    <div className="h-[450px] w-full rounded-3xl bg-gray-100 flex items-center justify-center">
      <Loader2 className="animate-spin text-blue-600" size={32} />
    </div>
  ),
});

interface Location {
  locationName: string;
  city: string;
  addressLine: string;
  province: string;
  latitude: number;
  longitude: number;
}

interface Vehicle {
  registrationNumber: string;
  vehicleType: string;
  vehicleCondition: string;
  location: Location | null;
  documentImage: {
    vehicleImages: string[];
    selfie?: string[];
  };
}

interface Booking {
  id: number;
  bookingId: string;
  startDate: string;
  endDate: string;
  totalAmount: string;
  paymentStatus: string;
  bookingStatus: "confirmed" | "pending" | "cancelled";
  transactionId: string;
  vehicle: Vehicle;
}

const MyBookings: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showMap, setShowMap] = useState<boolean>(false);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get<{
          success: boolean;
          bookings: Booking[];
        }>("http://localhost:3001/api/bookings/user-bookings", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.data.success) setBookings(response.data.bookings);
      } catch (err) {
        console.error("Error fetching bookings:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  const handleCloseModal = useCallback(() => {
    setShowMap(false);
    setTimeout(() => {
      setSelectedBooking(null);
    }, 10);
  }, []);

  const handleBackToDetails = () => {
    setShowMap(false);
  };

  if (loading)
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="animate-spin text-black" size={40} />
      </div>
    );

  return (
    <div className="max-w-6xl mx-auto p-6 min-h-screen bg-gray-50">
      <h2 className="text-3xl font-black mb-10 text-gray-900 uppercase tracking-tighter italic">
        Your Garage
      </h2>

      {bookings.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed">
          <p className="text-gray-400 font-bold uppercase tracking-widest">
            No bookings found
          </p>
        </div>
      ) : (
        <div className="grid gap-6">
          {bookings.map((booking) => (
            <div
              key={booking.id}
              className="bg-white border rounded-2xl p-4 shadow-sm flex flex-col md:flex-row gap-6 items-center hover:shadow-md transition-shadow"
            >
              <div className="relative w-full md:w-48 h-32 rounded-xl overflow-hidden flex-shrink-0">
                <Image
                  src={
                    booking.vehicle?.documentImage?.vehicleImages?.[0] ||
                    "/placeholder.png"
                  }
                  alt="Vehicle"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex-1 text-center md:text-left">
                <div className="flex items-center gap-2 justify-center md:justify-start">
                  <h3 className="text-xl font-bold">
                    {booking.vehicle.vehicleType}
                  </h3>
                  <span className="text-[10px] px-2 py-0.5 bg-gray-100 rounded-full font-bold text-gray-500 border italic">
                    {booking.vehicle.registrationNumber}
                  </span>
                </div>
                <p className="text-gray-500 text-sm mt-1">
                  {booking.startDate}{" "}
                  <span className="text-blue-500 font-black">→</span>{" "}
                  {booking.endDate}
                </p>
              </div>
              <div className="flex flex-col items-center md:items-end gap-3">
                <p className="text-xl font-black text-slate-900">
                  Rs. {booking.totalAmount}
                </p>
                <button
                  onClick={() => {
                    setSelectedBooking(booking);
                    setShowMap(false);
                  }}
                  className="bg-black text-white px-8 py-2.5 rounded-full text-xs font-black uppercase tracking-widest hover:bg-zinc-800 transition-all active:scale-95"
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* --- MODAL OVERLAY --- */}
      {selectedBooking && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-2xl rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-8">
              {!showMap ? (
                <>
                  <div className="flex justify-between items-start mb-8">
                    <div>
                      <h2 className="text-4xl font-black text-gray-900 tracking-tighter uppercase italic">
                        {selectedBooking.vehicle.vehicleType}
                      </h2>
                      <p className="text-blue-600 font-mono text-xs font-bold tracking-tighter">
                        REF: {selectedBooking.bookingId}
                      </p>
                    </div>
                    <button
                      onClick={handleCloseModal}
                      className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                      <X size={24} />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-8 py-8 border-y border-gray-100">
                    <div>
                      <p className="text-gray-400 text-[10px] uppercase font-black tracking-widest mb-1">
                        Pick-up Hub
                      </p>
                      <p className="font-bold text-slate-900 text-lg">
                        {selectedBooking.vehicle.location?.locationName ||
                          "Main Hub"}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-[10px] uppercase font-black tracking-widest mb-1">
                        Location Details
                      </p>
                      <p className="font-bold text-slate-800">
                        {selectedBooking.vehicle.location?.city},{" "}
                        {selectedBooking.vehicle.location?.province}
                      </p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-gray-400 text-[10px] uppercase font-black tracking-widest mb-1">
                        Full Address
                      </p>
                      <p className="font-medium text-slate-600">
                        {selectedBooking.vehicle.location?.addressLine ||
                          "Refer to map for exact pin"}
                      </p>
                    </div>
                  </div>

                  <div className="mt-8 flex flex-col gap-4">
                    <button
                      onClick={() => setShowMap(true)}
                      className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all active:scale-[0.98]"
                    >
                      <Navigation size={20} fill="currentColor" /> View Live
                      Pickup Route
                    </button>
                    <div className="flex gap-4">
                      <button
                        onClick={() => window.print()}
                        className="flex-1 border-2 border-gray-100 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors text-sm"
                      >
                        <Printer size={18} /> Print Receipt
                      </button>
                      <button
                        onClick={handleCloseModal}
                        className="flex-1 bg-zinc-100 text-zinc-900 py-4 rounded-2xl font-bold hover:bg-zinc-200 transition-colors text-sm"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="animate-in slide-in-from-right duration-500">
                  <div className="flex justify-between items-center mb-6">
                    <button
                      onClick={handleBackToDetails}
                      className="flex items-center gap-2 text-blue-600 font-black text-xs uppercase tracking-widest hover:translate-x-[-4px] transition-transform"
                    >
                      <ArrowLeft size={16} strokeWidth={3} /> Back to Details
                    </button>
                    <button
                      onClick={handleCloseModal}
                      className="text-gray-400 hover:text-black"
                    >
                      <X size={20} />
                    </button>
                  </div>

                  <div className="mb-6">
                    <h3 className="text-2xl font-black text-gray-900 tracking-tighter uppercase italic flex items-center gap-2">
                      <MapPin
                        className="text-red-500"
                        fill="currentColor"
                        size={24}
                      />{" "}
                      Navigation
                    </h3>
                    <p className="text-gray-500 text-sm font-medium">
                      Route to {selectedBooking.vehicle.location?.locationName}
                    </p>
                  </div>

                  {selectedBooking.vehicle.location?.latitude &&
                  selectedBooking.vehicle.location?.longitude ? (
                    <BookingMap
                      destLat={Number(
                        selectedBooking.vehicle.location.latitude,
                      )}
                      destLng={Number(
                        selectedBooking.vehicle.location.longitude,
                      )}
                      hubName={selectedBooking.vehicle.location.locationName}
                    />
                  ) : (
                    <div className="p-20 text-center bg-gray-50 rounded-[2rem] border-2 border-dashed border-gray-200">
                      <p className="text-gray-400 font-bold uppercase text-xs tracking-tighter">
                        GPS Coordinates not linked to this hub.
                      </p>
                    </div>
                  )}

                  <p className="mt-6 text-[10px] text-gray-400 text-center leading-relaxed">
                    Please ensure your device GPS is turned on for accurate
                    routing. <br />
                    Arrival time is an estimate based on current traffic.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyBookings;
