"use client";

import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../../../context/AuthContext";
import { Mail, Lock, Eye, EyeOff, Car } from "lucide-react";
import toast from "react-hot-toast";

type LoginFormInputs = {
  email: string;
  password: string;
  rememberMe?: boolean;
};

export default function LoginPage() {
  const { user, login, loading: authLoading } = useAuth();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormInputs>();


  const onSubmit = async (data: LoginFormInputs) => {
    setIsLoading(true);
    try {
      const res = await login(
        data.email,
        data.password,
        data.rememberMe || false
      );

      if (!res?.user) {
        toast.error(res?.message || "Invalid credentials");
        return;
      }

      toast.success("Welcome back!");

      // PROFILE IMAGE CHECK
      if (
        (res.user.role === "owner" || res.user.role === "renter") &&
        !res.user.profileImage
      ) {
        router.push("/profile-setup");
        return;
      }


      switch (res.user.role) {
        case "renter":
          router.push("/");
          break;
        case "owner":
          router.push("/owner/dashboard");
          break;
        case "admin":
          router.push("/admin/dashboard");
          break;
        default:
          router.push("/");
      }
    } catch (err: any) {
      // show server error message if available
      toast.error(err?.message || "Something went wrong. Try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      switch (user.role) {
        case "renter":
          router.replace("/");
          break;
        case "owner":
          router.replace("/owner/dashboard");
          break;
        case "admin":
          router.replace("/admin/dashboard");
          break;
        default:
          router.replace("/");
      }
    }
  }, [user, router]);

    if (authLoading || user) {
    return (
      <div className="min-h-screen bg-red-100 flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }


  return (
    <>
      <div className="min-h-screen bg-red-100 flex items-center justify-center p-4">
        <div className="w-full max-w-7xl grid lg:grid-cols-2 rounded-3xl overflow-hidden shadow-2xl">

          {/* LEFT SIDE - RED BACKGROUND */}
          <div className="hidden lg:flex flex-col justify-between p-12 bg-gradient-to-br from-red-600 via-red-500 to-red-700 relative overflow-hidden">
            {/* Subtle overlay pattern */}
            <div className="absolute inset-0 bg-black opacity-10"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>

            {/* Top Text - Now readable on red */}
            <div className="relative z-10">
              <h1 className="text-6xl md:text-7xl font-black text-white leading-tight drop-shadow-2xl">
                Rent Your<br />
                <span className="text-yellow-400">Dream Ride</span>
              </h1>
              <p className="text-2xl text-white/90 mt-6 font-medium drop-shadow-lg">
                Cars • Bikes • Anytime • Anywhere
              </p>
            </div>

            {/* Bike & Car - Glow + Perfect Size */}
            <div className="relative z-10 flex items-end justify-center gap-6 mt-10">
              <div className="relative group">
                <div className="absolute -inset-4 bg-white/20 rounded-full blur-3xl group-hover:blur-xl transition"></div>
                <img
                  src="/images/fz.png"
                  alt="FZ Bike"
                  className="relative w-80 h-auto object-contain drop-shadow-2xl hover:scale-110 transition-all duration-700"
                />
              </div>
              <div className="relative group -mt-12">
                <div className="absolute -inset-4 bg-white/20 rounded-full blur-3xl group-hover:blur-xl transition"></div>
                <img
                  src="/images/mustang.png"
                  alt="Mustang"
                  className="relative w-120 h-auto object-contain drop-shadow-2xl hover:scale-110 transition-all duration-700"
                />
              </div>
            </div>

            {/* Bottom Logo */}
            <div className="relative z-10 flex items-center gap-4">
              <Car className="w-12 h-12 text-yellow-400" />
              <span className="text-4xl font-bold text-white drop-shadow-2xl">Smart Sawari</span>
            </div>
          </div>

          {/* RIGHT SIDE - Clean White Form */}
          <div className="bg-white p-8 sm:p-12 lg:p-16 flex flex-col justify-center">
            {/* Mobile Logo */}
            <div className="lg:hidden flex items-center justify-center mb-10">
              <Car className="w-12 h-12 text-red-600 mr-3" />
              <span className="text-4xl font-bold text-gray-900">Smart Sawari</span>
            </div>

            <h2 className="text-4xl md:text-5xl font-bold text-gray-900">Welcome Back</h2>
            <p className="mt-3 text-lg text-gray-600">Sign in to continue your journey</p>

            <form onSubmit={handleSubmit(onSubmit)} className="mt-10 space-y-7">

              {/* Email */}
              <div className="relative">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" />
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full pl-16 pr-6 py-6 rounded-2xl border-2 border-gray-200 focus:border-red-500 focus:ring-4 focus:ring-red-50 transition-all text-lg font-medium"
                  {...register("email", {
                    required: "Email is required",
                    pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: "Invalid email" },
                  })}
                />
                {errors.email && <p className="mt-2 text-sm text-red-600 font-medium">{errors.email.message}</p>}
              </div>

              {/* Password */}
              <div className="relative">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  className="w-full pl-16 pr-20 py-6 rounded-2xl border-2 border-gray-200 focus:border-red-500 focus:ring-4 focus:ring-red-50 transition-all text-lg font-medium"
                  {...register("password", {
                    required: "Password is required",
                    minLength: { value: 6, message: "Minimum 6 characters" },
                  })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-500 hover:text-red-600 transition"
                >
                  {showPassword ? <EyeOff className="w-6 h-6" /> : <Eye className="w-6 h-6" />}
                </button>
                {errors.password && <p className="mt-2 text-sm text-red-600 font-medium">{errors.password.message}</p>}
              </div>

              {/* Remember & Forgot */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" className="w-5 h-5 text-red-600 rounded border-gray-300 focus:ring-red-500" {...register("rememberMe")} />
                  <span className="text-gray-700 font-medium">Remember me</span>
                </label>
                <Link href="/forgot-password" className="text-red-600 hover:text-red-700 font-semibold">
                  Forgot password?
                </Link>
              </div>

              {/* Epic Red Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold text-xl py-6 rounded-2xl shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 disabled:opacity-70"
              >
                {isLoading ? "Signing you in..." : "Sign In Now"}
              </button>
            </form>

            <p className="mt-12 text-center text-gray-600 text-lg">
              Don't have an account?{" "}
              <Link href="/register" className="text-red-600 font-bold hover:text-red-700 text-xl">
                Create one free
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}