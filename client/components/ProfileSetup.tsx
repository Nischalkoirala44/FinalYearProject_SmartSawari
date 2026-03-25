"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Camera, Upload, X, Wallet } from "lucide-react"
import { updateProfile } from "@/services/User"
import toast from "react-hot-toast"
import { useAuth } from "@/context/AuthContext"

export default function ProfileSetup({ onCloseAction }: { onCloseAction?: () => void }) {
  const router = useRouter()
  const { token, user, updateUser } = useAuth()

  const [loading, setLoading] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [esewaMobile, setEsewaMobile] = useState("")

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return
    setFile(selectedFile)
    setPreview(URL.createObjectURL(selectedFile))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token || !user) return toast.error("Not authenticated")

    try {
      setLoading(true)
      const updatedData = await updateProfile(
        { name: user.name, email: user.email, mobile: user.mobile, esewaMobile },
        file,
        token
      )
      
      updateUser(updatedData)
      toast.success("Profile updated successfully")
      onCloseAction ? onCloseAction() : router.push("/")
    } catch (err: any) {
      toast.error(err.message || "Update failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="border-2 w-full max-w-lg mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Complete Your Profile</CardTitle>
        <CardDescription>Finalize your account details</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              {preview ? (
                <img src={preview} className="w-32 h-32 rounded-full object-cover border-4 border-blue-600" />
              ) : (
                <div className="w-32 h-32 rounded-full bg-muted border-4 border-dashed flex items-center justify-center">
                  <Camera className="w-12 h-12 text-muted-foreground" />
                </div>
              )}
            </div>
            <Label htmlFor="profile-image" className="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2">
              <Upload className="w-4 h-4" /> Upload Photo
              <Input id="profile-image" type="file" accept="image/*" onChange={handleImageChange} className="sr-only" />
            </Label>
          </div>

          {user?.role === "owner" && (
            <div className="space-y-2 border-t pt-4">
              <Label className="flex items-center gap-2"><Wallet className="w-4 h-4" /> eSewa Number (For Payouts)</Label>
              <Input 
                placeholder="98XXXXXXXX" 
                value={esewaMobile} 
                onChange={(e) => setEsewaMobile(e.target.value)} 
                required 
              />
              <p className="text-xs text-gray-500">Owners need this to receive rental payments.</p>
            </div>
          )}

          <Button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white" disabled={loading}>
            {loading ? "Processing..." : "Finish Setup"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}