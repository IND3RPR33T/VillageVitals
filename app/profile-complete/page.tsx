"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Phone, User, Building, MapPin, Loader2, CheckCircle, AlertCircle } from "lucide-react"
import { Logo } from "@/components/logo"
import { useRouter } from "next/navigation"
import { doc, updateDoc, serverTimestamp } from "firebase/firestore"
import { db, auth } from "@/lib/firebase"
import { onAuthChange, getCurrentUserProfile, type UserProfile } from "@/lib/firebase-auth"

export default function ProfileCompletePage() {
    const [isLoading, setIsLoading] = useState(false)
    const [checkingAuth, setCheckingAuth] = useState(true)
    const [error, setError] = useState("")
    const [success, setSuccess] = useState("")
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
    const router = useRouter()

    // Form state
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        phone: "",
        role: "" as 'asha_worker' | 'health_official' | 'field_worker' | 'admin' | '',
        organization: "",
        district: "",
        state: "",
    })

    useEffect(() => {
        const unsubscribe = onAuthChange(async (user) => {
            if (!user) {
                router.push("/login")
                return
            }

            // Get existing profile
            const profile = await getCurrentUserProfile()
            if (profile) {
                // Check if profile is complete (has role selected)
                if (profile.role && profile.firstName && profile.lastName) {
                    // Already complete, redirect to dashboard
                    router.push("/dashboard")
                    return
                }

                setUserProfile(profile)
                // Pre-fill form with existing data
                setFormData({
                    firstName: profile.firstName || user.displayName?.split(' ')[0] || "",
                    lastName: profile.lastName || user.displayName?.split(' ').slice(1).join(' ') || "",
                    phone: profile.phone || "",
                    role: profile.role as any || "",
                    organization: "",
                    district: "",
                    state: "",
                })
            } else {
                // New user, pre-fill from Google auth
                setFormData({
                    firstName: user.displayName?.split(' ')[0] || "",
                    lastName: user.displayName?.split(' ').slice(1).join(' ') || "",
                    phone: user.phoneNumber || "",
                    role: "",
                    organization: "",
                    district: "",
                    state: "",
                })
            }

            setCheckingAuth(false)
        })

        return () => unsubscribe()
    }, [router])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError("")
        setSuccess("")

        if (!formData.role) {
            setError("Please select a role")
            setIsLoading(false)
            return
        }

        if (!formData.firstName || !formData.lastName) {
            setError("Please enter your full name")
            setIsLoading(false)
            return
        }

        try {
            const user = auth.currentUser
            if (!user) {
                setError("User not authenticated")
                setIsLoading(false)
                return
            }

            // Update user profile in Firestore
            await updateDoc(doc(db, 'users', user.uid), {
                firstName: formData.firstName,
                lastName: formData.lastName,
                phone: formData.phone,
                role: formData.role,
                organization: formData.organization,
                district: formData.district,
                state: formData.state,
                isProfileComplete: true,
                updatedAt: serverTimestamp(),
            })

            setSuccess("Profile completed! Redirecting to dashboard...")
            setTimeout(() => {
                router.push("/dashboard")
            }, 1000)
        } catch (error: any) {
            console.error("Error updating profile:", error)
            setError("Failed to update profile. Please try again.")
        } finally {
            setIsLoading(false)
        }
    }

    if (checkingAuth) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Header */}
                <div className="text-center mb-8">
                    <Logo size="lg" />
                    <h1 className="text-2xl font-bold mt-4">Complete Your Profile</h1>
                    <p className="text-muted-foreground">Tell us a bit more about yourself to get started</p>
                </div>

                {/* Error/Success Messages */}
                {error && (
                    <Alert variant="destructive" className="mb-4">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                {success && (
                    <Alert className="mb-4 border-green-200 bg-green-50 text-green-800">
                        <CheckCircle className="h-4 w-4" />
                        <AlertDescription>{success}</AlertDescription>
                    </Alert>
                )}

                <Card>
                    <CardHeader>
                        <CardTitle>Profile Details</CardTitle>
                        <CardDescription>This information helps us personalize your experience</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="firstName">First Name *</Label>
                                    <Input
                                        id="firstName"
                                        placeholder="John"
                                        required
                                        value={formData.firstName}
                                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                        disabled={isLoading}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="lastName">Last Name *</Label>
                                    <Input
                                        id="lastName"
                                        placeholder="Doe"
                                        required
                                        value={formData.lastName}
                                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                        disabled={isLoading}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="phone">Phone Number</Label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="phone"
                                        type="tel"
                                        placeholder="+91 98765 43210"
                                        className="pl-10"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        disabled={isLoading}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="role">Role *</Label>
                                <div className="relative">
                                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground z-10" />
                                    <Select
                                        value={formData.role}
                                        onValueChange={(value) => setFormData({ ...formData, role: value as any })}
                                        disabled={isLoading}
                                    >
                                        <SelectTrigger className="pl-10">
                                            <SelectValue placeholder="Select your role" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="asha_worker">ASHA Worker</SelectItem>
                                            <SelectItem value="health_official">Health Official</SelectItem>
                                            <SelectItem value="field_worker">Field Worker</SelectItem>
                                            <SelectItem value="admin">Administrator</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="organization">Organization (Optional)</Label>
                                <div className="relative">
                                    <Building className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="organization"
                                        placeholder="e.g., PHC Riverside"
                                        className="pl-10"
                                        value={formData.organization}
                                        onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                                        disabled={isLoading}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="district">District</Label>
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="district"
                                            placeholder="District"
                                            className="pl-10"
                                            value={formData.district}
                                            onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                                            disabled={isLoading}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="state">State</Label>
                                    <Input
                                        id="state"
                                        placeholder="State"
                                        value={formData.state}
                                        onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                                        disabled={isLoading}
                                    />
                                </div>
                            </div>

                            <Button type="submit" className="w-full" disabled={isLoading}>
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {isLoading ? "Saving..." : "Complete Profile"}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
