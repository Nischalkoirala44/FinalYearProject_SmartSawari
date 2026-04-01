"use client";

import { Search, Key, CreditCard, ShieldCheck, Upload, CheckCircle2, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function HowItWorks() {
  const renterSteps = [
    {
      icon: <Search className="text-red-500" size={32} />,
      title: "Find Your Ride",
      desc: "Browse through our verified fleet of cars and bikes across Nepal."
    },
    {
      icon: <CreditCard className="text-red-500" size={32} />,
      title: "Secure Booking",
      desc: "Book instantly and pay via eSewa."
    },
    {
      icon: <Key className="text-red-500" size={32} />,
      title: "Start Journey",
      desc: "Meet the owner, verify the vehicle, and enjoy your smart ride."
    }
  ];

  const ownerSteps = [
    {
      icon: <Upload className="text-emerald-500" size={32} />,
      title: "List Asset",
      desc: "Upload photos and legal documents to register your vehicle."
    },
    {
      icon: <ShieldCheck className="text-emerald-500" size={32} />,
      title: "Verification",
      desc: "Our admins review your details to ensure platform safety."
    },
    {
      icon: <TrendingUp className="text-emerald-500" size={32} />,
      title: "Earn Money",
      desc: "Track rentals through your dashboard and get paid directly."
    }
  ];

  return (
    <div className="bg-[#0b1a27] min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1">
        {/* HEADER */}
        <section className="py-20 px-6 text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-black text-white uppercase italic tracking-tighter mb-4">
              How <span className="text-red-600">Smart Sawari</span> Works
            </h1>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.4em]">
              Nepal's Peer-to-Peer Rental Guide
            </p>
          </div>
        </section>

        {/* RENTER GUIDE */}
        <section className="px-6 mb-24">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-4 mb-12">
               <h2 className="text-xl font-black text-white uppercase italic">Renter <span className="text-red-600">Process</span></h2>
               <div className="h-px flex-1 bg-white/5"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {renterSteps.map((step, i) => (
                <div key={i} className="bg-[#0d1f2f] border border-white/5 p-10 rounded-[2.5rem] hover:border-white/10 transition-all">
                  <div className="mb-6">{step.icon}</div>
                  <h3 className="text-lg font-black text-white uppercase italic mb-2">{step.title}</h3>
                  <p className="text-gray-400 text-xs font-bold uppercase tracking-wider leading-relaxed">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* OWNER GUIDE */}
        <section className="px-6 mb-24">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-4 mb-12">
               <h2 className="text-xl font-black text-white uppercase italic">Owner <span className="text-emerald-500">Process</span></h2>
               <div className="h-px flex-1 bg-white/5"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {ownerSteps.map((step, i) => (
                <div key={i} className="bg-[#0d1f2f] border border-white/5 p-10 rounded-[2.5rem] hover:border-white/10 transition-all">
                  <div className="mb-6">{step.icon}</div>
                  <h3 className="text-lg font-black text-white uppercase italic mb-2">{step.title}</h3>
                  <p className="text-gray-400 text-xs font-bold uppercase tracking-wider leading-relaxed">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="px-6 pb-20">
          <div className="max-w-5xl mx-auto bg-red-600 rounded-[3rem] p-12 text-center shadow-2xl">
            <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter mb-8">Ready to join the ecosystem?</h2>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/register" className="bg-white text-red-600 px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-gray-100 transition-all">
                Create Account
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}