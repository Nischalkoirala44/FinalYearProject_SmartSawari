"use client";

import { useForm } from "react-hook-form";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../context/AuthContext";
import toast from "react-hot-toast";
import Link from "next/link";
import { Eye, EyeOff, User, Mail, Phone, Lock, Car } from "lucide-react";

type SignupFormInputs = {
  name: string;
  email: string;
  mobile: string;
  password: string;
  role: "owner" | "renter";
};

export default function SignupPage() {
  const router = useRouter();
  const { register: registerUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<SignupFormInputs>();

  const selectedRole = watch("role");

  const onSubmit = async (data: SignupFormInputs) => {
    setIsLoading(true);
    try {
      const res = await registerUser(
        data.name,
        data.email,
        data.mobile,
        data.password,
        data.role
      );

      if (res.message === "User Registered Successfully") {
        toast.success("Welcome to Smart Sawari!");
        router.push("/login");
      } else {
        toast.error(res.message || "Registration failed");
      }
    } catch(err: any) {
      console.log(err);
      toast.error(err.message || "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-red-100 flex items-center justify-center p-4">
      <div className="w-full max-w-7xl grid lg:grid-cols-2 rounded-3xl overflow-hidden shadow-2xl">

        {/* LEFT SIDE - RED BACKGROUND */}
        <div className="hidden lg:flex flex-col justify-between p-12 bg-gradient-to-br from-red-600 via-red-500 to-red-700 relative overflow-hidden">
          <div className="absolute inset-0 bg-black opacity-10"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>

          <div className="relative z-10">
            <h1 className="text-6xl md:text-7xl font-black text-white leading-tight drop-shadow-2xl">
              Join the
              <span className="text-yellow-400"> Ride Revolution</span>
            </h1>
            <p className="text-2xl text-white/90 mt-6 font-medium drop-shadow-lg">
              Cars • Bikes • Anytime • Anywhere
            </p>
          </div>

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

          <div className="relative z-10 flex items-center gap-4">
            <Car className="w-12 h-12 text-yellow-400" />
            <span className="text-4xl font-bold text-white drop-shadow-2xl">Smart Sawari</span>
          </div>
        </div>

        {/* RIGHT SIDE - FORM */}
        <div className="bg-white p-8 sm:p-12 lg:p-16 flex flex-col justify-center">
          <div className="lg:hidden flex items-center justify-center mb-10">
            <Car className="w-12 h-12 text-red-600 mr-3" />
            <span className="text-4xl font-bold text-gray-900">Smart Sawari</span>
          </div>

          <h2 className="text-4xl md:text-5xl font-bold text-gray-900">Create Account</h2>
          <p className="mt-3 text-lg text-gray-600">Join the Smart Sawari family today</p>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-10 space-y-7">

            {/* Name, Email, Mobile, Password - Same as before */}
            <div className="relative">
              <User className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" />
              <input type="text" placeholder="Full Name" className="w-full pl-16 pr-6 py-6 rounded-2xl border-2 border-gray-200 focus:border-red-500 focus:ring-4 focus:ring-red-50 transition-all text-lg font-medium"
                {...register("name", { required: "Name is required", minLength: { value: 3, message: "Minimum 3 characters" } })} />
              {errors.name && <p className="mt-2 text-sm text-red-600 font-medium">{errors.name.message}</p>}
            </div>

            <div className="relative">
              <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" />
              <input type="email" placeholder="Email Address" className="w-full pl-16 pr-6 py-6 rounded-2xl border-2 border-gray-200 focus:border-red-500 focus:ring-4 focus:ring-red-50 transition-all text-lg font-medium"
                {...register("email", { required: "Email is required", pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: "Invalid email" } })} />
              {errors.email && <p className="mt-2 text-sm text-red-600 font-medium">{errors.email.message}</p>}
            </div>

            <div className="relative">
              <Phone className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" />
              <input type="text" placeholder="Mobile Number" className="w-full pl-16 pr-6 py-6 rounded-2xl border-2 border-gray-200 focus:border-red-500 focus:ring-4 focus:ring-red-50 transition-all text-lg font-medium"
                {...register("mobile", { required: "Mobile number is required", pattern: { value: /^[0-9]{10}$/, message: "Enter valid 10-digit number" } })} />
              {errors.mobile && <p className="mt-2 text-sm text-red-600 font-medium">{errors.mobile.message}</p>}
            </div>

            <div className="relative">
              <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" />
              <input type={showPassword ? "text" : "password"} placeholder="Create Password" className="w-full pl-16 pr-20 py-6 rounded-2xl border-2 border-gray-200 focus:border-red-500 focus:ring-4 focus:ring-red-50 transition-all text-lg font-medium"
                {...register("password", { required: "Password is required", minLength: { value: 6, message: "Minimum 6 characters" } })} />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-500 hover:text-red-600 transition">
                {showPassword ? <EyeOff className="w-6 h-6" /> : <Eye className="w-6 h-6" />}
              </button>
              {errors.password && <p className="mt-2 text-sm text-red-600 font-medium">{errors.password.message}</p>}
            </div>

            {/* COMPACT & BEAUTIFUL ROLE SELECTION */}
            <div className="mt-8">
              <p className="text-lg text-gray-700 font-medium text-center mb-6">
                I want to join as
              </p>
              <div className="grid grid-cols-2 gap-5 max-w-md mx-auto">
                {(["owner", "renter"] as const).map((role) => (
                  <label
                    key={role}
                    className={`relative flex flex-col items-center justify-center py-8 px-6 rounded-2xl border-4 cursor-pointer transition-all transform hover:scale-105 ${
                      selectedRole === role
                        ? "border-red-600 bg-red-50 shadow-xl ring-4 ring-red-100"
                        : "border-gray-200 bg-gray-50 hover:border-red-300"
                    }`}
                  >
                    <input type="radio" value={role} className="sr-only" {...register("role", { required: "Please select a role" })} />
                    {role === "owner" ? (
                      <User className={`w-6 h-8 ${selectedRole === role ? "text-red-600" : "text-gray-600"}`} />
                    ) : (
                      <Car className={`w-6 h-8 ${selectedRole === role ? "text-red-600" : "text-gray-600"}`} />
                    )}
                    <span className={`font-bold text-lg capitalize ${selectedRole === role ? "text-red-600" : "text-gray-800"}`}>
                      {role === "owner" ? "Vehicle Owner" : "Renter"}
                    </span>
                  </label>
                ))}
              </div>
              {errors.role && <p className="mt-4 text-sm text-red-600 text-center font-medium">{errors.role.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold text-xl py-6 rounded-2xl shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 disabled:opacity-70"
            >
              {isLoading ? "Creating Account..." : "Create Account Free"}
            </button>
          </form>

          <p className="mt-12 text-center text-gray-600 text-lg">
            Already have an account?{" "}
            <Link href="/login" className="text-red-600 font-bold hover:text-red-700 text-xl">
              Sign In Now
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}