"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { forgotPassword } from "../../../services/Auth";
import { Mail, Car, ArrowRight } from "lucide-react";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await forgotPassword(email);

      setMessage(res.message || "OTP sent successfully!");

      if (
        res.message?.toLowerCase().includes("otp") ||
        res.message?.toLowerCase().includes("sent")
      ) {
        setTimeout(() => {
          router.push("/reset-password");
        }, 1200);
      }
    } catch (error: any) {
      setMessage(error.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-red-100 flex items-center justify-center p-4">

        {/* FORM */}
        <div className="bg-white p-8 sm:p-12 lg:p-16 flex flex-col justify-center">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center mb-10">
            <Car className="w-12 h-12 text-red-600 mr-3" />
            <span className="text-4xl font-bold text-gray-900">Smart Sawari</span>
          </div>

          <h2 className="text-4xl md:text-5xl font-bold text-gray-900">Forgot Password?</h2>
          <p className="mt-3 text-lg text-gray-600">Enter your email and we’ll send you an OTP to reset it</p>

          <form onSubmit={handleSubmit} className="mt-10 space-y-7">
            <div className="relative">
              <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full pl-16 pr-6 py-6 rounded-2xl border-2 border-gray-200 focus:border-red-500 focus:ring-4 focus:ring-red-50 transition-all text-lg font-medium"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold text-xl py-6 rounded-2xl shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 disabled:opacity-70 flex items-center justify-center gap-3"
            >
              {loading ? (
                <>
                  <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Sending OTP...
                </>
              ) : (
                <>
                  Send OTP
                  <ArrowRight className="w-6 h-6" />
                </>
              )}
            </button>
          </form>

          {message && (
            <p className={`mt-8 text-center text-lg font-medium ${message.toLowerCase().includes("sent") || message.toLowerCase().includes("success") ? "text-green-600" : "text-red-600"}`}>
              {message}
            </p>
          )}

          <p className="mt-12 text-center text-gray-600 text-lg">
            Remembered your password?{" "}
            <a href="/login" className="text-red-600 font-bold hover:text-red-700 text-xl">
              Back to Login
            </a>
          </p>
        </div>
      </div>
  );
}