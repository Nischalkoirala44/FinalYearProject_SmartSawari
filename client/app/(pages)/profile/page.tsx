"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Camera, Upload, X, Eye, EyeOff, Wallet, 
  User, ShieldCheck, Mail, Smartphone, ArrowRight 
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { uploadProfilePicture, updateProfile, updatePassword } from "../../../services/User";
import LayoutWrapper from "@/components/LayoutWrapper";

export default function ProfilePage() {
  const { user, token, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [isImageRemoved, setIsImageRemoved] = useState(false); 
  
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [userData, setUserData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    mobile: user?.mobile || "",
    esewaMobile: user?.esewaMobile || "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    setUserData({
      name: user?.name || "",
      email: user?.email || "",
      mobile: user?.mobile || "",
      esewaMobile: user?.esewaMobile || "",
    });
  }, [user]);

  /* ================= HANDLERS ================= */

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    if (preview && preview.startsWith("blob:")) URL.revokeObjectURL(preview);
    setFile(selectedFile);
    setIsImageRemoved(false);
    setPreview(URL.createObjectURL(selectedFile));
  };

  const handleRemoveImage = () => {
    if (preview && preview.startsWith("blob:")) URL.revokeObjectURL(preview);
    setFile(null);
    setPreview("");
    setIsImageRemoved(true);
  };

  const getDisplayImage = () => {
    if (file && preview) return preview;
    if (isImageRemoved) return `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || "User")}&background=0e1f2e&color=fff&size=128`;
    if (user?.profileImage) return user.profileImage.replace(/"/g, "");
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || "User")}&background=0e1f2e&color=fff&size=128`;
  };

  /* ================= API CALLS ================= */

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const profileRes = await updateProfile(userData, file, token!);
      if (file) {
        const uploadRes = await uploadProfilePicture(file, token!);
        updateUser({ ...profileRes, profileImage: uploadRes.profileImageUrl });
      } else {
        updateUser(profileRes);
      }
      alert("Profile updated successfully!");
      setIsImageRemoved(false);
    } catch (err: any) {
      alert(err.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert("New passwords do not match!");
      return;
    }
    setLoading(true);
    try {
      await updatePassword(passwordData, token!);
      alert("Password updated successfully!");
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err: any) {
      alert(err.message || "Failed to update password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <LayoutWrapper>
      <div className="min-h-screen bg-[#0a1620] text-gray-100 pb-20">
        <main className="max-w-6xl mx-auto px-6 pt-12">
          
          {/* Header Section */}
          <div className="mb-12 border-b border-gray-800 pb-10">
            <div className="flex items-center gap-3 mb-4">
            </div>
            <h1 className="text-6xl font-black tracking-tighter uppercase text-white leading-none">
              Account <span className="text-red-600">Profile</span>
            </h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-12 items-start">
            
            {/* Sidebar: Avatar Card */}
            <aside className="space-y-6 lg:sticky lg:top-10">
              <div className="bg-[#0e1f2e] rounded-3xl border border-gray-800 p-10 flex flex-col items-center text-center shadow-2xl relative overflow-hidden">
                {/* Visual Glow */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/5 blur-[60px] rounded-full -mr-10 -mt-10" />
                
                <div className="relative group mb-8">
                  <div className="absolute -inset-2 bg-gradient-to-tr from-red-600 to-transparent rounded-full opacity-30 blur-md transition-opacity group-hover:opacity-60" />
                  <img
                    src={getDisplayImage()}
                    alt="Profile"
                    className="relative w-44 h-44 rounded-full object-cover border-4 border-[#0a1620] shadow-2xl bg-gray-900"
                  />
                  {(file || (user?.profileImage && !isImageRemoved)) && (
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute top-2 right-2 w-10 h-10 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center shadow-xl border-4 border-[#0e1f2e] transition-all active:scale-90 z-10"
                    >
                      <X size={16} strokeWidth={3} />
                    </button>
                  )}
                </div>
                
                <Label htmlFor="profile-image" className="w-full cursor-pointer group">
                  <div className="flex items-center justify-center gap-3 w-full py-5 bg-gray-900 border border-gray-800 group-hover:border-red-600 text-[10px] font-black uppercase tracking-widest text-gray-400 group-hover:text-white rounded-2xl transition-all shadow-inner">
                    <Upload size={14} className="text-red-600" />
                    <span>Change Photo</span>
                  </div>
                  <Input id="profile-image" type="file" accept="image/*" onChange={handleImageChange} className="sr-only" />
                </Label>
              </div>

              <div className="bg-[#0e1f2e]/40 rounded-3xl border border-gray-800 p-8">
                 <div className="flex items-center gap-3 text-red-600 mb-4">
                    <ShieldCheck size={20} />
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Security Status</span>
                 </div>
                 <p className="text-xs font-bold text-gray-500 leading-relaxed uppercase tracking-tighter opacity-60">
                    Your account is encrypted and synced with the Smart Sawari ecosystem.
                 </p>
              </div>
            </aside>

            {/* Main Content Area */}
            <div className="space-y-10">
              
              {/* Personal Info Form */}
              <section className="bg-[#0e1f2e] rounded-3xl border border-gray-800 p-10 shadow-2xl relative">
                <div className="flex items-center gap-4 mb-10 border-b border-gray-800 pb-6">
                  <User size={24} className="text-red-600" />
                  <h3 className="text-2xl font-black uppercase tracking-tighter text-white">
                    General <span className="text-red-600">Information</span>
                  </h3>
                </div>

                <form onSubmit={handleProfileUpdate} className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 ml-1">Legal Name</Label>
                      <Input
                        value={userData.name}
                        onChange={(e) => setUserData({ ...userData, name: e.target.value })}
                        className="bg-gray-900 border-gray-800 rounded-2xl h-16 px-6 text-sm font-bold focus:border-red-600 transition-all text-white"
                        required
                      />
                    </div>
                    <div className="space-y-4">
                      <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 ml-1">Phone Contact</Label>
                      <Input
                        value={userData.mobile}
                        onChange={(e) => setUserData({ ...userData, mobile: e.target.value })}
                        className="bg-gray-900 border-gray-800 rounded-2xl h-16 px-6 text-sm font-bold focus:border-red-600 transition-all text-white"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 ml-1">Email Address</Label>
                    <Input
                      type="email"
                      value={userData.email}
                      onChange={(e) => setUserData({ ...userData, email: e.target.value })}
                      className="bg-gray-900 border-gray-800 rounded-2xl h-16 px-6 text-sm font-bold focus:border-red-600 transition-all text-white"
                      required
                    />
                  </div>

                  {user?.role === "owner" && (
                    <div className="mt-12 p-8 bg-gray-900/60 rounded-[2.5rem] border border-gray-800 border-l-4 border-l-red-600">
                      <div className="flex items-center justify-between mb-6">
                        <Label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-red-500">
                          <Wallet size={16} /> eSewa Payout Wallet
                        </Label>
                        <span className="bg-red-600/10 text-red-500 text-[8px] font-black px-2 py-1 rounded uppercase tracking-widest">Linked</span>
                      </div>
                      <Input
                        placeholder="98XXXXXXXX"
                        value={userData.esewaMobile}
                        onChange={(e) => setUserData({ ...userData, esewaMobile: e.target.value })}
                        className="bg-[#0a1620] border-gray-800 rounded-2xl h-16 px-6 text-base font-black tracking-[0.2em] focus:border-red-600 transition-all text-white"
                      />
                      <p className="mt-4 text-[10px] text-gray-600 font-bold uppercase tracking-tight">Income will be transferred to this ID within 24 hours of booking completion.</p>
                    </div>
                  )}

                  <Button type="submit" disabled={loading} className="bg-red-600 hover:bg-red-700 text-white rounded-2xl px-12 h-16 font-black uppercase tracking-widest shadow-2xl shadow-red-900/40 transition-all hover:scale-[1.02] active:scale-95 text-xs">
                    {loading ? "Syncing..." : "Update Profile"}
                  </Button>
                </form>
              </section>

              {/* Password Section */}
              <section className="bg-[#0e1f2e] rounded-3xl border border-gray-800 p-10 shadow-2xl relative">
                <div className="flex items-center gap-4 mb-10 border-b border-gray-800 pb-6">
                  <ShieldCheck size={24} className="text-red-600" />
                  <h3 className="text-2xl font-black uppercase tracking-tighter text-white">
                    Access <span className="text-red-600">Security</span>
                  </h3>
                </div>

                <form onSubmit={handlePasswordChange} className="space-y-5">
                  {[
                    { id: "current", val: "currentPassword", show: showCurrentPassword, setShow: setShowCurrentPassword, placeholder: "Current Security Key" },
                    { id: "new", val: "newPassword", show: showNewPassword, setShow: setShowNewPassword, placeholder: "New Password" },
                    { id: "confirm", val: "confirmPassword", show: showConfirmPassword, setShow: setShowConfirmPassword, placeholder: "Verify New Password" }
                  ].map((input) => (
                    <div key={input.id} className="relative group">
                      <Input
                        type={input.show ? "text" : "password"}
                        value={passwordData[input.val as keyof typeof passwordData]}
                        onChange={(e) => setPasswordData({ ...passwordData, [input.val]: e.target.value })}
                        placeholder={input.placeholder}
                        className="bg-gray-900 border-gray-800 rounded-2xl pr-14 h-16 px-6 text-sm font-bold focus:border-red-600 transition-all text-white placeholder:text-gray-700"
                        required
                      />
                      <button 
                        type="button" 
                        onClick={() => input.setShow(!input.show)} 
                        className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-700 hover:text-red-600 transition-colors"
                      >
                        {input.show ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  ))}
                  <div className="pt-4">
                    <Button type="submit" disabled={loading} className="w-full sm:w-auto bg-transparent border-2 border-gray-800 hover:border-red-600 text-gray-400 hover:text-white rounded-2xl font-black uppercase tracking-widest h-16 px-12 transition-all text-xs">
                      Update Security
                    </Button>
                  </div>
                </form>
              </section>

            </div>
          </div>
        </main>
      </div>
    </LayoutWrapper>
  );
}