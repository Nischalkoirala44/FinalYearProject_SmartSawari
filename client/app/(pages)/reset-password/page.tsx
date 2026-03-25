"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { resetPassword } from "../../../services/Auth";
import { Mail, Lock, KeyRound, Eye, EyeOff, Car, ArrowRight } from "lucide-react";

export default function ResetPassword() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleOtpChange = (value: string, index: number) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;

    const newOtp = pasted.padEnd(6, "").slice(0, 6).split("");
    setOtp(newOtp);

    const nextIdx = Math.min(pasted.length, 5);
    otpRefs.current[nextIdx]?.focus();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const otpString = otp.join("");
    if (otpString.length !== 6) {
      setMessage("Please enter a valid 6-digit OTP");
      setLoading(false);
      return;
    }

    try {
      const res = await resetPassword({ email, otp: otpString, password });
      setMessage(res.message || "Password reset successfully!");
      setSuccess(true);

      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (error: any) {
      setMessage(error.response?.data?.message || "Invalid OTP or expired");
      setSuccess(false);
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

          <h2 className="text-4xl md:text-5xl font-bold text-gray-900">Reset Password</h2>
          <p className="mt-3 text-lg text-gray-600">Enter the OTP and your new password</p>

          <form onSubmit={handleSubmit} className="mt-10 space-y-7">
            {/* Email */}
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

            {/* OTP */}
            <div>
              <label className="block text-lg font-medium text-gray-700 mb-4 text-center">
                Enter 6-digit OTP
              </label>
              <div className="flex justify-center gap-4" onPaste={handleOtpPaste}>
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => {otpRefs.current[index] = el; }}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(e.target.value, index)}
                    onKeyDown={(e) => handleOtpKeyDown(e, index)}
                    className="w-16 h-16 text-3xl font-bold text-center rounded-2xl border-5 border-gray-200 focus:border-red-500 focus:ring-4 focus:ring-red-50 transition-all"
                  />
                ))}
              </div>
            </div>

            {/* New Password */}
            <div className="relative">
              <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" />
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={6}
                placeholder="Enter new password"
                className="w-full pl-16 pr-20 py-6 rounded-2xl border-2 border-gray-200 focus:border-red-500 focus:ring-4 focus:ring-red-50 transition-all text-lg font-medium"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-500 hover:text-red-600 transition"
              >
                {showPassword ? <EyeOff className="w-6 h-6" /> : <Eye className="w-6 h-6" />}
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold text-xl py-6 rounded-2xl shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 disabled:opacity-70 flex items-center justify-center gap-3"
            >
              {loading ? (
                <>
                  <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Resetting...
                </>
              ) : (
                <>
                  <KeyRound className="w-6 h-6" />
                  Reset Password
                  <ArrowRight className="w-6 h-6" />
                </>
              )}
            </button>
          </form>

          {message && (
            <p className={`mt-8 text-center text-lg font-medium ${success ? "text-green-600" : "text-red-600"}`}>
              {message}
            </p>
          )}

          <p className="mt-12 text-center text-gray-600 text-lg">
            <a href="/login" className="text-red-600 font-bold hover:text-red-700 text-xl">
              ←  Back to Login
            </a>
          </p>
        </div>
      </div>
  );
}