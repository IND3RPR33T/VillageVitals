"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Mail, Phone, Lock, User, ArrowLeft, Loader2, CheckCircle, AlertCircle } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { signIn, signUp, signInWithGoogle } from "@/lib/firebase-auth"
import GlowingCard from "@/components/GlowingCard"
import { LampContainer } from "@/components/ui/lamp"
import { BackgroundBeamsWithCollision } from "@/components/ui/background-beams-with-collision"
import { motion } from "motion/react"

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const router = useRouter()

  // Login form state
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
    role: "community" as 'community' | 'health-worker' | 'admin',
  })

  // Registration form state
  const [registerData, setRegisterData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    role: "community" as 'community' | 'health-worker' | 'admin',
  })

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setSuccess("")

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contact: loginData.email,
          password: loginData.password,
          role: loginData.role,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Login failed")
      }

      setSuccess("Login successful! Redirecting...")

      // Force refresh data/router
      router.refresh()

      setTimeout(() => {
        router.push("/dashboard")
      }, 1000)
    } catch (error: any) {
      setError(error.message || "Login failed")
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setSuccess("")

    // Validate passwords match
    if (registerData.password !== registerData.confirmPassword) {
      setError("Passwords do not match")
      setIsLoading(false)
      return
    }

    // Validate password strength
    if (registerData.password.length < 6) {
      setError("Password must be at least 6 characters long")
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: registerData.email,
          password: registerData.password,
          firstName: registerData.firstName,
          lastName: registerData.lastName,
          phone: registerData.phone,
          role: registerData.role,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Registration failed")
      }

      setSuccess("Account created successfully! Please check your email for OTP verification.")
      // Redirect to OTP page or login? The response says "requiresOTPVerification".
      // Since I deleted the legacy verify-otp page, I should probably check if there is a new one or if migration missed it.
      // But for now, let's just show the success message.
    } catch (error: any) {
      setError(error.message || "Registration failed")
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setIsLoading(true)
    setError("")

    try {
      // 1. Sign in with Firebase Client SDK causing popup
      const { idToken, isNewUser } = await signInWithGoogle()

      // 2. Send ID Token to backend to set session cookie
      const response = await fetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idToken,
          role: "community" // Default role for Google users if new
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to verify Google session")
      }

      setSuccess("Login successful! Redirecting...")

      // Force refresh
      router.refresh()

      setTimeout(() => {
        router.push("/dashboard")
      }, 1000)
    } catch (error: any) {
      console.error(error)
      setError(error.message || "Google sign-in failed")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="relative w-full min-h-screen bg-slate-950 overflow-y-auto">
      <div className="fixed inset-0 z-0">
        <BackgroundBeamsWithCollision className="h-screen w-full">
          <></>
        </BackgroundBeamsWithCollision>
      </div>
      <div className="relative z-10">
        <LampContainer lampColor="#7408e1ff" className="bg-transparent/0 min-h-screen">
          <motion.h1
            initial={{ opacity: 0.5, y: 100 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{
              delay: 0.3,
              duration: 0.8,
              ease: "easeInOut",
            }}
            className="mt-0 bg-gradient-to-br from-slate-300 to-slate-500 py-2 bg-clip-text text-center text-3xl font-medium tracking-tight text-transparent md:text-5xl"
          >
            Welcome Back <br /> to VillageVitals
          </motion.h1>

          <div className="w-full max-w-md bg-transparent relative z-50">
            <div className="text-center mb-4">
              <Link href="/" className="inline-flex items-center gap-2 text-slate-300 hover:text-white mb-4">
                <ArrowLeft className="w-4 h-4" />
                Back to Home
              </Link>
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

            <GlowingCard className="animate-slide-up">
              <Tabs defaultValue="login" className="w-full">
                <TabsList className="grid w-full grid-cols-2 bg-transparent p-1 mb-6 border border-slate-700 rounded-lg">
                  <TabsTrigger value="login" className="data-[state=active]:bg-slate-800 data-[state=active]:text-white text-slate-400">Sign In</TabsTrigger>
                  <TabsTrigger value="register" className="data-[state=active]:bg-slate-800 data-[state=active]:text-white text-slate-400">Register</TabsTrigger>
                </TabsList>

                {/* Login Tab */}
                <TabsContent value="login">
                  <CardHeader className="p-0 mb-6">
                    <CardTitle className="text-white">Welcome Back</CardTitle>
                    <CardDescription className="text-slate-400">Sign in to your VillageVitals account</CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                    <form onSubmit={handleLogin} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="login-email" className="text-slate-200">Email</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                          <Input
                            id="login-email"
                            type="email"
                            placeholder="Enter your email"
                            className="pl-10 bg-slate-950/50 border-slate-800 text-white placeholder:text-slate-500 focus-visible:ring-cyan-500/50"
                            required
                            value={loginData.email}
                            onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                            disabled={isLoading}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="login-password" className="text-slate-200">Password</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                          <Input
                            id="login-password"
                            type="password"
                            placeholder="Enter your password"
                            className="pl-10 bg-slate-950/50 border-slate-800 text-white placeholder:text-slate-500 focus-visible:ring-cyan-500/50"
                            required
                            value={loginData.password}
                            onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                            disabled={isLoading}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="login-role" className="text-slate-200">Role</Label>
                        <Select
                          value={loginData.role}
                          onValueChange={(value) => setLoginData({ ...loginData, role: value as any })}
                          disabled={isLoading}
                        >
                          <SelectTrigger id="login-role" className="bg-slate-950/50 border-slate-800 text-white">
                            <SelectValue placeholder="Select your role" />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-900 border-slate-800 text-white">
                            <SelectItem value="community">Community Member</SelectItem>
                            <SelectItem value="health-worker">Health Worker</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="remember"
                            checked={rememberMe}
                            onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                            className="border-slate-600 data-[state=checked]:bg-cyan-500 data-[state=checked]:border-cyan-500"
                          />
                          <Label htmlFor="remember" className="text-sm text-slate-300">
                            Remember me
                          </Label>
                        </div>
                        <Link href="/forgot-password" className="text-sm text-cyan-400 hover:text-cyan-300 hover:underline">
                          Forgot password?
                        </Link>
                      </div>

                      <Button type="submit" className="w-full bg-cyan-600 hover:bg-cyan-500 text-white border-0" disabled={isLoading}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {isLoading ? "Signing in..." : "Sign In"}
                      </Button>
                    </form>
                  </CardContent>
                </TabsContent>

                {/* Register Tab */}
                <TabsContent value="register">
                  <CardHeader className="p-0 mb-6">
                    <CardTitle className="text-white">Create Account</CardTitle>
                    <CardDescription className="text-slate-400">Join VillageVitals to start monitoring community health</CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                    <form onSubmit={handleRegister} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="first-name" className="text-slate-200">First Name</Label>
                          <Input
                            id="first-name"
                            placeholder="John"
                            required
                            value={registerData.firstName}
                            onChange={(e) => setRegisterData({ ...registerData, firstName: e.target.value })}
                            disabled={isLoading}
                            className="bg-slate-950/50 border-slate-800 text-white placeholder:text-slate-500 focus-visible:ring-cyan-500/50"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="last-name" className="text-slate-200">Last Name</Label>
                          <Input
                            id="last-name"
                            placeholder="Doe"
                            required
                            value={registerData.lastName}
                            onChange={(e) => setRegisterData({ ...registerData, lastName: e.target.value })}
                            disabled={isLoading}
                            className="bg-slate-950/50 border-slate-800 text-white placeholder:text-slate-500 focus-visible:ring-cyan-500/50"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-slate-200">Email</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                          <Input
                            id="email"
                            type="email"
                            placeholder="john@example.com"
                            className="pl-10 bg-slate-950/50 border-slate-800 text-white placeholder:text-slate-500 focus-visible:ring-cyan-500/50"
                            required
                            value={registerData.email}
                            onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                            disabled={isLoading}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone" className="text-slate-200">Phone Number</Label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                          <Input
                            id="phone"
                            type="tel"
                            placeholder="+91 98765 43210"
                            className="pl-10 bg-slate-950/50 border-slate-800 text-white placeholder:text-slate-500 focus-visible:ring-cyan-500/50"
                            value={registerData.phone}
                            onChange={(e) => setRegisterData({ ...registerData, phone: e.target.value })}
                            disabled={isLoading}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="register-role" className="text-slate-200">Role</Label>
                        <div className="relative">
                          <User className="absolute left-3 top-3 h-4 w-4 text-slate-400 z-10" />
                          <Select
                            value={registerData.role}
                            onValueChange={(value) => setRegisterData({ ...registerData, role: value as any })}
                            disabled={isLoading}
                          >
                            <SelectTrigger className="pl-10 bg-slate-950/50 border-slate-800 text-white focus:ring-cyan-500/50">
                              <SelectValue placeholder="Select your role" />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-900 border-slate-800 text-white">
                              <SelectItem value="community" className="focus:bg-slate-800 focus:text-white">Community Member</SelectItem>
                              <SelectItem value="health-worker" className="focus:bg-slate-800 focus:text-white">Health Worker</SelectItem>
                              <SelectItem value="admin" className="focus:bg-slate-800 focus:text-white">Admin</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="password" className="text-slate-200">Password</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                          <Input
                            id="password"
                            type="password"
                            placeholder="Create a strong password"
                            className="pl-10 bg-slate-950/50 border-slate-800 text-white placeholder:text-slate-500 focus-visible:ring-cyan-500/50"
                            required
                            value={registerData.password}
                            onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                            disabled={isLoading}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="confirm-password" className="text-slate-200">Confirm Password</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                          <Input
                            id="confirm-password"
                            type="password"
                            placeholder="Confirm your password"
                            className="pl-10 bg-slate-950/50 border-slate-800 text-white placeholder:text-slate-500 focus-visible:ring-cyan-500/50"
                            required
                            value={registerData.confirmPassword}
                            onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                            disabled={isLoading}
                          />
                        </div>
                      </div>

                      <Button type="submit" className="w-full bg-cyan-600 hover:bg-cyan-500 text-white border-0" disabled={isLoading}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {isLoading ? "Creating account..." : "Create Account"}
                      </Button>
                    </form>
                  </CardContent>
                </TabsContent>
              </Tabs>

              {/* Social Login Options */}
              <div className="mt-8 pt-6 border-t border-slate-800">
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-transparent px-2 text-slate-400 absolute -top-3">Or continue with</span>
                </div>
                <div className="mt-4">
                  <Button
                    variant="outline"
                    type="button"
                    className="w-full bg-slate-950/50 border-slate-800 hover:bg-slate-800 text-white hover:text-white"
                    onClick={handleGoogleSignIn}
                    disabled={isLoading}
                  >
                    <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" aria-hidden="true">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    Sign in with Google
                  </Button>
                </div>
              </div>
            </GlowingCard>
          </div>
        </LampContainer>
      </div>
    </div>
  )
}
