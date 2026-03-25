"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Dialog, DialogTitle, DialogContent } from "@/components/ui/dialog";
import ProfileSetup from "@/components/ProfileSetup";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function RenterLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!loading && user?.role === "renter" && !user.profileImage) {
      setOpen(true);
    }
  }, [user?.role, user?.profileImage, loading]);

  return (
    <ProtectedRoute allowedRoles={["renter"]}>
      <div className="min-h-screen flex flex-col bg-[#0e1f2e]">
        <Navbar />
        {/* Removed mx-auto and px constraints so the marketplace can be edge-to-edge */}
        <main className="flex-1 flex flex-col w-full overflow-hidden">
            {children}
        </main>
        <Footer />

        <Dialog 
          open={open} 
          onOpenChange={(val) => {
            if (user?.profileImage) setOpen(val);
          }}
        >
          <DialogContent className="max-w-2xl p-0 border-none bg-transparent shadow-none outline-none">
            <DialogTitle className="sr-only">Complete Your Profile</DialogTitle>
            <div className="bg-white rounded-[2.5rem] p-10 shadow-2xl">
               <ProfileSetup onCloseAction={() => setOpen(false)} />
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </ProtectedRoute>
  );
}