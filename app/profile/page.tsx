"use client"

import React, { useState, useEffect } from "react"
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
  X
} from "lucide-react"
import { useRouter } from "next/navigation"
import { doc, updateDoc, serverTimestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { onAuthChange, getCurrentUserProfile, logOut, type UserProfile as FirebaseUserProfile } from "@/lib/firebase-auth"

export default function ProfilePage() {
  const [user, setUser] = useState<FirebaseUserProfile | null>(null)
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
    organization: "",
    district: "",
    state: "",
  })

  useEffect(() => {
    const unsubscribe = onAuthChange(async (firebaseUser) => {
      if (!firebaseUser) {
        router.push("/login")
        return
      }

      const profile = await getCurrentUserProfile()
      if (profile) {
        setUser(profile)
        setEditData({
          firstName: profile.firstName || profile.fullName?.split(' ')[0] || "",
          lastName: profile.lastName || profile.fullName?.split(' ').slice(1).join(' ') || "",
          phone: profile.phone || profile.phoneNumber || "",
          role: profile.role || "",
          organization: profile.organization || "",
          district: profile.district || "",
          state: profile.state || "",
        })
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [router])

  const handleSave = async () => {
    setIsSaving(true)
    setError("")
    setSuccess("")

    try {
      if (!user?.uid) throw new Error("User not authenticated")

      await updateDoc(doc(db, 'users', user.uid), {
        firstName: editData.firstName,
        lastName: editData.lastName,
        fullName: `${editData.firstName} ${editData.lastName}`,
        phone: editData.phone,
        role: editData.role,
        organization: editData.organization,
        district: editData.district,
        state: editData.state,
        isProfileComplete: true,
        updatedAt: serverTimestamp(),
      })

      setUser({ ...user, ...editData as any })
      setIsEditing(false)
      setSuccess("Profile updated successfully!")
    } catch (error: any) {
      console.error("Update error:", error)
      setError(error.message || "Failed to update profile")
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setIsEditing(false)
    if (user) {
      setEditData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        phone: user.phone || "",
        role: user.role || "",
        organization: user.organization || "",
        district: user.district || "",
        state: user.state || "",
      })
    }
    setError("")
    setSuccess("")
  }

  const handleLogout = async () => {
    try {
      await logOut()
      router.push("/login")
    } catch (error) {
      console.error("Logout error:", error)
      router.push("/login")
    }
  }

  const formatRole = (role: string) => {
    switch (role) {
      case 'asha_worker': return 'ASHA Worker'
      case 'health_official': return 'Health Official'
      case 'field_worker': return 'Field Worker'
      case 'admin': return 'Administrator'
      default: return role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
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

  const displayPhone = user.phone || user.phoneNumber || ""

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
          {/* Profile Information */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle className="text-xl">Personal Information</CardTitle>
                <CardDescription>Your account details and contact information</CardDescription>
              </div>
              {!isEditing && (
                <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              {isEditing ? (
                <>
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
                        <SelectItem value="asha_worker">ASHA Worker</SelectItem>
                        <SelectItem value="health_official">Health Official</SelectItem>
                        <SelectItem value="field_worker">Field Worker</SelectItem>
                        <SelectItem value="admin">Administrator</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-organization">Organization</Label>
                    <Input
                      id="edit-organization"
                      value={editData.organization}
                      onChange={(e) => setEditData({ ...editData, organization: e.target.value })}
                      disabled={isSaving}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-district">District</Label>
                      <Input
                        id="edit-district"
                        value={editData.district}
                        onChange={(e) => setEditData({ ...editData, district: e.target.value })}
                        disabled={isSaving}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-state">State</Label>
                      <Input
                        id="edit-state"
                        value={editData.state}
                        onChange={(e) => setEditData({ ...editData, state: e.target.value })}
                        disabled={isSaving}
                      />
                    </div>
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
                </>
              ) : (
                <>
                  <div className="flex items-center gap-3">
                    <User className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{user.firstName || user.fullName?.split(' ')[0]} {user.lastName || user.fullName?.split(' ').slice(1).join(' ')}</p>
                      <p className="text-sm text-muted-foreground">Full Name</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{user.email}</p>
                      <p className="text-sm text-muted-foreground">Email Address</p>
                    </div>
                  </div>

                  {displayPhone && (
                    <div className="flex items-center gap-3">
                      <Phone className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{displayPhone}</p>
                        <p className="text-sm text-muted-foreground">Phone Number</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-3">
                    <Shield className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{formatRole(user.role)}</p>
                      <p className="text-sm text-muted-foreground">Role</p>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

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

              {user.createdAt && (
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Member Since</p>
                    <p className="text-sm text-muted-foreground">
                      {user.createdAt.toDate ?
                        user.createdAt.toDate().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) :
                        new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
                      }
                    </p>
                  </div>
                </div>
              )}

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
                  {user.role === 'health_official' && (
                    <ul className="list-disc list-inside space-y-1">
                      <li>Create and manage health reports</li>
                      <li>Monitor community health data</li>
                      <li>Send health alerts</li>
                      <li>Access educational resources</li>
                    </ul>
                  )}
                  {(user.role === 'asha_worker' || user.role === 'field_worker') && (
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
        </div>

        {/* Quick Actions */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-xl">Quick Actions</CardTitle>
            <CardDescription>Common tasks and navigation</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button
                variant="outline"
                onClick={() => router.push("/health-report")}
                className="h-16 flex flex-col gap-2"
              >
                <div className="text-lg">📊</div>
                <span>Health Report</span>
              </Button>

              <Button
                variant="outline"
                onClick={() => router.push("/water-quality")}
                className="h-16 flex flex-col gap-2"
              >
                <div className="text-lg">💧</div>
                <span>Water Quality</span>
              </Button>

              <Button
                variant="outline"
                onClick={() => router.push("/alerts")}
                className="h-16 flex flex-col gap-2"
              >
                <div className="text-lg">🚨</div>
                <span>View Alerts</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
