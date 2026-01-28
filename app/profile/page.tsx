"use client"

import React, { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  User,
  Mail,
  Phone,
  Calendar,
  Shield,
  CheckCircle,
  AlertCircle,
  Loader2,
  Edit,
  Save,
  X,
  Camera
} from "lucide-react"
import { useRouter } from "next/navigation"
import ProfileCard from "@/components/ProfileCard"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
  isVerified: boolean;
  createdAt: string;
}

export default function ProfilePage() {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const router = useRouter()

  // Editable user data
  const [editData, setEditData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    role: "",
  })

  // Camera state
  const [capturedAvatar, setCapturedAvatar] = useState<string | null>(null)
  const [isCameraOpen, setIsCameraOpen] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    fetchUserProfile()
  }, [])

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
    } catch (err) {
      console.error("Error accessing camera:", err)
      setError("Could not access camera. Please check permissions.")
      setIsCameraOpen(false)
    }
  }

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream
      stream.getTracks().forEach(track => track.stop())
      videoRef.current.srcObject = null
    }
    setIsCameraOpen(false)
  }

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current
      const canvas = canvasRef.current
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.scale(-1, 1); // Mirror effect
        ctx.drawImage(video, -canvas.width, 0, canvas.width, canvas.height); // Draw mirrored
        const dataUrl = canvas.toDataURL('image/png')
        setCapturedAvatar(dataUrl)
        stopCamera()
      }
    }
  }

  useEffect(() => {
    if (isCameraOpen) {
      startCamera()
    } else {
      stopCamera()
    }
  }, [isCameraOpen])

  const fetchUserProfile = async () => {
    try {
      const response = await fetch("/api/auth/me", {
        method: "GET",
        credentials: "include",
      })

      if (response.status === 401) {
        // User not authenticated, redirect to login
        router.push("/login")
        return
      }

      const data = await response.json()

      if (response.ok) {
        setUser(data.user)
        setEditData({
          firstName: data.user.firstName,
          lastName: data.user.lastName,
          phone: data.user.phone,
          role: data.user.role,
        })
      } else {
        setError(data.error || "Failed to load profile")
      }
    } catch (error) {
      setError("Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    setError("")
    setSuccess("")

    try {
      const response = await fetch("/api/auth/update-profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(editData),
      })

      const data = await response.json()

      if (response.ok) {
        setUser({ ...user!, ...editData })
        setIsEditing(false)
        setSuccess("Profile updated successfully!")
      } else {
        setError(data.error || "Failed to update profile")
      }
    } catch (error) {
      setError("Network error. Please try again.")
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setIsEditing(false)
    setEditData({
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      phone: user?.phone || "",
      role: user?.role || "",
    })
    setError("")
    setSuccess("")
  }

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      })
      router.push("/login")
    } catch (error) {
      console.error("Logout error:", error)
      router.push("/login")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading profile...</span>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Profile Not Found</CardTitle>
            <CardDescription>Unable to load your profile. Please try logging in again.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push("/login")} className="w-full">
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold">Profile Settings</h1>
            <p className="text-muted-foreground">Manage your account information</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => router.push("/dashboard")}>
              Back to Dashboard
            </Button>
            <Button variant="destructive" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-6 border-green-200 bg-green-50 text-green-800">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        <div className="grid gap-6 md:grid-cols-2">
          {/* Profile Card */}
          <div className="flex flex-col gap-6">
            <ProfileCard
              name={`${user.firstName} ${user.lastName}`}
              title={user.role.charAt(0).toUpperCase() + user.role.slice(1).replace('-', ' ')}
              handle={user.email.split('@')[0]}
              status={user.isVerified ? "Verified" : "Pending"}
              contactText="Edit Profile"
              avatarUrl={capturedAvatar || ""}
              showUserInfo={true}
              enableTilt={true}
              enableMobileTilt={true}
              onContactClick={() => setIsEditing(true)}
              behindGlowEnabled={true}
              behindGlowColor="rgba(125, 190, 255, 0.67)"
              innerGradient="linear-gradient(145deg, #1a1a1a 0%, #2a2a2a 100%)"
              className="w-full h-[400px] md:h-[500px]"
            />

            <div className="flex justify-center -mt-4 z-10 relative">
              <Dialog open={isCameraOpen} onOpenChange={setIsCameraOpen}>
                <DialogTrigger asChild>
                  <Button variant="secondary" className="gap-2 shadow-lg">
                    <Camera className="h-4 w-4" />
                    Take Photo
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Take a Profile Photo</DialogTitle>
                    <DialogDescription>
                      Use your camera to capture a new profile picture.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="flex flex-col items-center gap-4 py-4">
                    <div className="relative rounded-lg overflow-hidden bg-muted aspect-video w-full">
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-full object-cover transform -scale-x-100"
                      />
                    </div>
                    <canvas ref={canvasRef} className="hidden" />
                    <div className="flex gap-2 w-full">
                      <Button variant="outline" className="flex-1" onClick={() => setIsCameraOpen(false)}>
                        Cancel
                      </Button>
                      <Button className="flex-1" onClick={capturePhoto}>
                        Capture
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Editing Form */}
            {isEditing && (
              <Card>
                <CardHeader>
                  <CardTitle>Edit Profile</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-firstName">First Name</Label>
                      <Input
                        id="edit-firstName"
                        value={editData.firstName}
                        onChange={(e) => setEditData({ ...editData, firstName: e.target.value })}
                        disabled={isSaving}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-lastName">Last Name</Label>
                      <Input
                        id="edit-lastName"
                        value={editData.lastName}
                        onChange={(e) => setEditData({ ...editData, lastName: e.target.value })}
                        disabled={isSaving}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-phone">Phone Number</Label>
                    <Input
                      id="edit-phone"
                      value={editData.phone}
                      onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                      disabled={isSaving}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-role">Role</Label>
                    <Select
                      value={editData.role}
                      onValueChange={(value) => setEditData({ ...editData, role: value })}
                      disabled={isSaving}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="community">Community Member</SelectItem>
                        <SelectItem value="health-worker">Health Worker</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button onClick={handleSave} disabled={isSaving} className="flex-1">
                      {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </Button>
                    <Button variant="outline" onClick={handleCancel} disabled={isSaving}>
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="flex flex-col gap-6">
            {/* Account Status */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Account Status</CardTitle>
                <CardDescription>Your account verification and activity status</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>Account Verified</span>
                  </div>
                  <Badge variant={user.isVerified ? "default" : "secondary"}>
                    {user.isVerified ? "Verified" : "Pending"}
                  </Badge>
                </div>

                <Separator />

                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Member Since</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(user.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <h4 className="font-medium">Role Permissions</h4>
                  <div className="text-sm text-muted-foreground">
                    {user.role === 'admin' && (
                      <ul className="list-disc list-inside space-y-1">
                        <li>Manage users and system settings</li>
                        <li>View all reports and analytics</li>
                        <li>Create and manage alerts</li>
                        <li>Access administrative features</li>
                      </ul>
                    )}
                    {user.role === 'health-worker' && (
                      <ul className="list-disc list-inside space-y-1">
                        <li>Create and manage health reports</li>
                        <li>Monitor community health data</li>
                        <li>Send health alerts</li>
                        <li>Access educational resources</li>
                      </ul>
                    )}
                    {user.role === 'community' && (
                      <ul className="list-disc list-inside space-y-1">
                        <li>Submit health reports</li>
                        <li>Report water quality issues</li>
                        <li>Receive health alerts</li>
                        <li>Access health information</li>
                      </ul>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Quick Actions</CardTitle>
                <CardDescription>Common tasks and navigation</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-4">
                  <Button
                    variant="outline"
                    onClick={() => router.push("/health-report")}
                    className="h-16 flex items-center justify-start gap-4 px-6"
                  >
                    <div className="text-2xl">📊</div>
                    <div className="text-left">
                      <div className="font-medium">Health Report</div>
                      <div className="text-xs text-muted-foreground">Submit a new report</div>
                    </div>
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => router.push("/water-quality")}
                    className="h-16 flex items-center justify-start gap-4 px-6"
                  >
                    <div className="text-2xl">💧</div>
                    <div className="text-left">
                      <div className="font-medium">Water Quality</div>
                      <div className="text-xs text-muted-foreground">Log testing data</div>
                    </div>
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => router.push("/alerts")}
                    className="h-16 flex items-center justify-start gap-4 px-6"
                  >
                    <div className="text-2xl">🚨</div>
                    <div className="text-left">
                      <div className="font-medium">View Alerts</div>
                      <div className="text-xs text-muted-foreground">Check recent notifications</div>
                    </div>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
