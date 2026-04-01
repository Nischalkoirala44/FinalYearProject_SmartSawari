"use client";

import React from 'react';
import { Target, Users, ShieldCheck, Zap, Heart } from 'lucide-react';
import Link from 'next/link';
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Car from "../../../public/images/scooter.jpeg";

export default function AboutUs() {
    const values = [
        {
            icon: <Target className="text-red-500" size={28} />,
            title: "Our Mission",
            desc: "To democratize vehicle ownership in Nepal by creating a sustainable, technology-driven rental ecosystem."
        },
        {
            icon: <ShieldCheck className="text-emerald-500" size={28} />,
            title: "Trust First",
            desc: "Every vehicle and user undergoes a strict verification process to ensure safety and reliability."
        },
        {
            icon: <Zap className="text-blue-500" size={28} />,
            title: "Innovation",
            desc: "Leveraging modern web stacks to provide a seamless booking experience from Kathmandu to Pokhara."
        }
    ];

    return (
        <div className="bg-[#0b1a27] min-h-screen flex flex-col selection:bg-red-600/30">
            <Navbar />

            <main className="flex-1">
                {/* HERO SECTION */}
                <section className="relative py-24 px-6 overflow-hidden">
                    <div className="max-w-5xl mx-auto text-center relative z-10">
                        <h1 className="text-5xl md:text-7xl font-black uppercase italic tracking-tighter mb-6 text-white">
                            Redefining <span className="text-red-600">Mobility</span>
                        </h1>
                        <p className="text-gray-500 text-[10px] md:text-xs font-black uppercase tracking-[0.4em] max-w-2xl mx-auto leading-loose">
                            Smart Sawari is Nepal's high-performance peer-to-peer vehicle sharing platform.
                        </p>
                    </div>
                </section>

                {/* STORY SECTION */}
                <section className="py-20 px-6">
                    <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <div className="relative aspect-square md:aspect-video lg:aspect-square bg-[#0d1f2f] rounded-[3rem] border border-white/5 overflow-hidden shadow-2xl group">
                            {/* The Actual Image */}
                            <img
                                src={Car.src}
                                alt="Smart Sawari Fleet"
                                className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-110 group-hover:opacity-80 transition-all duration-700"
                            />

                            {/* Cinematic Gradient Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-[#0b1a27] via-[#0b1a27]/20 to-transparent"></div>

                            {/* Subtle Border Glow on Hover */}
                            <div className="absolute inset-0 rounded-[3rem] border border-white/0 group-hover:border-white/10 transition-colors duration-500"></div>
                        </div>

                        <div>
                            <h2 className="text-sm font-black text-red-600 uppercase tracking-[0.3em] mb-6">The Smart Sawari Story</h2>
                            <h3 className="text-3xl md:text-4xl font-black text-white uppercase italic tracking-tighter mb-8 leading-tight">
                                Born from a need for <span className="text-gray-500">better transportation</span> solutions.
                            </h3>
                            <p className="text-gray-400 text-sm font-medium leading-relaxed mb-6 uppercase tracking-wide">
                                In many parts of Nepal, vehicle ownership is expensive, while thousands of cars and bikes sit idle in garages. Smart Sawari was built to bridge this gap.
                            </p>
                            <p className="text-gray-400 text-sm font-medium leading-relaxed uppercase tracking-wide">
                                We empower local owners to turn their assets into income, while providing travelers and locals with affordable, verified transportation at their fingertips.
                            </p>
                        </div>
                    </div>
                </section>

                {/* CORE VALUES */}
                <section className="py-20 px-6 bg-[#0d1f2f]/30">
                    <div className="max-w-7xl mx-auto">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {values.map((val, i) => (
                                <div key={i} className="group bg-[#0d1f2f] border border-white/5 p-12 rounded-[3rem] transition-all hover:border-white/10">
                                    <div className="mb-8 p-4 bg-white/5 w-fit rounded-2xl group-hover:bg-white/10 transition-colors">
                                        {val.icon}
                                    </div>
                                    <h4 className="text-xl font-black text-white uppercase italic mb-4 tracking-tight">{val.title}</h4>
                                    <p className="text-gray-500 text-xs font-bold uppercase leading-loose tracking-widest">{val.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* TEAM / PROJECT INFO */}
                <section className="py-24 px-6 text-center">
                    <div className="max-w-3xl mx-auto">
                        <Heart className="text-red-600 mx-auto mb-8 animate-pulse" size={40} />
                        <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter mb-4">A Vision for Nepal</h2>
                        <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.3em] leading-relaxed">
                            Crafted as a final year project to solve real-world logistical challenges in the Himalayan nation.
                        </p>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}