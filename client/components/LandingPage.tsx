"use client";

import { Button } from "@/components/ui/button";
import { CreditCard, LayoutDashboard, Shield, Zap } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

// Ensure these paths match your project structure
import car from "../public/images/Ford.jpeg";
import bike from "../public/images/bike.jpeg";
import scooter from "../public/images/scooter.jpeg";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-[#0b1a27] overflow-x-hidden text-gray-300">
      
      {/* CINEMATIC HERO SECTION */}
      <section className="relative pt-24 md:pt-32 pb-16 md:pb-20 px-6 overflow-hidden">
        <div className="container mx-auto max-w-7xl relative z-10">
          <div className="grid lg:grid-cols-2 gap-10 md:gap-16 items-center">
            
            {/* Left: Text Content */}
            <div className="space-y-6 md:space-y-8 text-left animate-in fade-in slide-in-from-left-8 duration-700">
              
              <h1 className="text-5xl sm:text-6xl md:text-8xl font-black tracking-tighter text-white uppercase leading-[0.85]">
                PRECISION<br />
                <span className="text-red-600 italic">MOTION.</span>
              </h1>
              
              <p className="text-base md:text-lg text-gray-400 max-w-md font-medium tracking-tight leading-relaxed">
                Engineered for those who demand more than just transport. 
                Experience the <span className="text-white">pinnacle of automotive excellence</span>.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button asChild size="lg" className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white text-[10px] font-black uppercase tracking-[0.2em] px-10 py-6 md:py-7 rounded-xl shadow-[0_15px_30px_-10px_rgba(220,38,38,0.5)] transition-all hover:scale-105">
                  <Link href="/vehicles">Explore Fleet</Link>
                </Button>
                <Button asChild variant="outline" className="w-full sm:w-auto border-white/10 text-white hover:bg-white/5 text-[10px] font-black uppercase tracking-[0.2em] px-10 py-6 md:py-7 rounded-xl backdrop-blur-xl bg-white/5">
                  <Link href="/register">Partner Portal</Link>
                </Button>
              </div>
            </div>

            {/* Right: Hero Image Terminal */}
            <div className="relative group perspective-1000 hidden lg:block">
              <div className="absolute -inset-1 bg-gradient-to-r from-red-600 to-red-900 rounded-[2.5rem] blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
              <div className="relative aspect-video rounded-[2rem] overflow-hidden border border-white/10 bg-black shadow-2xl transition-transform duration-700 hover:rotate-1">
                <Image 
                  src={car} 
                  alt="Hero Performance" 
                  fill 
                  className="object-cover opacity-80 group-hover:scale-110 transition-transform duration-[2s]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#070b0e] via-transparent to-transparent" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section className="relative py-16 md:py-24 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-[#0e2233] z-0" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0b1a27] via-[#08121a] to-[#0b1a27] opacity-80 z-0" />
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%] z-0" />

        <div className="container mx-auto max-w-7xl relative z-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
            {[
              { title: "SECURE DRIVE", icon: Shield, desc: "Verified Assets", color: "text-red-600" },
              { title: "INSTANT ACCESS", icon: Zap, desc: "Rapid Deployment", color: "text-white" },
              { title: "E-Sewa Payment", icon: CreditCard, desc: "Secure E-Sewa", color: "text-red-600" },
              { title: "FLEET CONTROL", icon: LayoutDashboard, desc: "Owner Terminal", color: "text-white" }
            ].map((feature, i) => (
              <div 
                key={i} 
                className="group p-6 md:p-8 bg-white/[0.02] backdrop-blur-md border border-white/5 rounded-2xl flex flex-col items-center text-center transition-all duration-500 hover:border-red-600/30 hover:bg-white/[0.05]"
              >
                <div className="relative mb-4 md:mb-6">
                  <div className="absolute inset-0 bg-red-600/20 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <feature.icon className={`relative w-6 h-6 md:w-8 md:h-8 ${feature.color} transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3`} />
                </div>
                <h3 className="text-[10px] md:text-xs font-black text-white uppercase tracking-[0.4em] mb-2">{feature.title}</h3>
                <p className="text-[9px] md:text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em]">{feature.desc}</p>
                <div className="w-6 h-[2px] bg-gray-800 mt-4 md:mt-6 group-hover:bg-red-600 group-hover:w-12 transition-all duration-500" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* COMPACT ELITE FLEET */}
      <section className="py-16 md:py-24 px-6">
        <div className="container mx-auto max-w-7xl">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 mb-10 md:mb-12 border-l-2 border-red-600 pl-4 md:pl-6">
            <h2 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tighter">Elite <span className="text-red-600">Fleet</span></h2>
            <Link href="/vehicles" className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 hover:text-red-500 transition-colors">View All</Link>
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
            {[
              { name: "Motorbikes", img: bike, type: "bike", tag: "Agile" },
              { name: "Scooters", img: scooter, type: "scooter", tag: "Urban" },
              { name: "Premium Cars", img: car, type: "car", tag: "Luxury" }
            ].map((cat, i) => (
              <div key={i} className="group relative rounded-3xl overflow-hidden bg-[#0e161d] border border-white/5 aspect-[4/5] sm:aspect-[3/4]">
                <Image src={cat.img} alt={cat.name} fill className="object-cover opacity-40 group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#070b0e] to-transparent" />
                <div className="absolute bottom-0 p-6 md:p-8 w-full">
                  <p className="text-red-600 text-[9px] font-black uppercase tracking-widest mb-1">{cat.tag}</p>
                  <h3 className="text-lg md:text-xl font-black text-white uppercase tracking-tighter mb-4">{cat.name}</h3>
                  <Link href={`/vehicles`} className="text-[9px] font-black uppercase tracking-[0.3em] text-white py-2 px-4 bg-white/5 border border-white/10 rounded-lg group-hover:bg-red-600 transition-all">
                    Explore
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* REFINED COMPACT CTA */}
      <section className="py-12 md:py-20 px-4 md:px-6">
        <div className="container mx-auto max-w-5xl">
          <div className="relative overflow-hidden bg-[#BF092F] rounded-[2rem] md:rounded-[2.5rem] p-8 md:p-16 text-center shadow-2xl">
            <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white opacity-10 rounded-full blur-3xl" />
            
            <div className="relative z-10 space-y-4 md:space-y-6">
              {/* Scaled text for mobile */}
              <h2 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tighter leading-tight md:leading-none">
                READY TO ESCAPE<br className="hidden md:block"/> THE ORDINARY?
              </h2>
              <p className="text-[9px] md:text-xs font-black text-white/80 uppercase tracking-[0.2em] md:tracking-[0.4em] max-w-lg mx-auto leading-relaxed">
                Join the elite community of Smart Sawari drivers today.
              </p>
              
              {/* Full width buttons on mobile */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
                <Button asChild className="w-full sm:w-auto bg-white text-red-600 hover:bg-gray-100 font-black uppercase tracking-[0.2em] text-[10px] px-8 h-12 rounded-xl">
                  <Link href="/vehicles">Explore Fleet</Link>
                </Button>
                <Button asChild variant="outline" className="w-full sm:w-auto border-white/40 text-white hover:bg-white/10 font-black uppercase tracking-[0.2em] text-[10px] px-8 h-12 rounded-xl bg-transparent">
                  <Link href="/vehicles">Book Now</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}