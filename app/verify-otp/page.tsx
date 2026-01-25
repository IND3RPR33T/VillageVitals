"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, CheckCircle, AlertCircle, Loader2, Mail } from "lucide-react"
import { Logo } from "@/components/logo"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"

export default function VerifyOTPPage() {
  const [otp, setOtp] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [resendCooldown, setResendCooldown] = useState(0)
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const email = searchParams.get('email') || ''
  const name = searchParams.get('name') || ''

  // Cooldown timer for resend OTP
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown(resendCooldown - 1)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [resendCooldown])

  // Auto-focus on OTP input
  useEffect(() => {
    const otpInput = document.getElementById('otp')
    if (otpInput) {
      otpInput.focus()
    }
  }, [])

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setSuccess("")

    if (!otp || otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP")
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email: email.toLowerCase(), 
          otp: otp,
          name: name
        }),
      })

      const data = await response.json()

      if (data.success) {
        setSuccess("Email verified successfully! Redirecting to login...")
        setTimeout(() => {
          router.push("/login?verified=true")
        }, 1500)
      } else {
        setError(data.error || "Verification failed")
      }
    } catch (error) {
      console.error('OTP verification error:', error)
      setError("Network error. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendOTP = async () => {
    setIsLoading(true)
    setError("")
    setSuccess("")

    try {
      // Call resend OTP endpoint (you'll need to create this)
      const response = await fetch('/api/auth/resend-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email.toLowerCase() }),
      })

      const data = await response.json()

      if (data.success) {
        setSuccess("New OTP sent to your email!")
        setResendCooldown(60) // 60 second cooldown
        setOtp("") // Clear current OTP
      } else {
        setError(data.error || "Failed to resend OTP")
      }
    } catch (error) {
      console.error('Resend OTP error:', error)
      setError("Network error. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  // Redirect if no email provided
  if (!email) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="space-y-2">
            <div className="flex justify-center">
              <Logo className="h-8 w-auto" />
            </div>
            <CardTitle className="text-center text-red-600">Invalid Access</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p>No email provided for verification.</p>
            <Link href="/login">
              <Button>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Login
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="space-y-2">
          <div className="flex justify-center">
            <Logo className="h-8 w-auto" />
          </div>
          <CardTitle className="text-center">Verify Your Email</CardTitle>
          <CardDescription className="text-center">
            We've sent a 6-digit verification code to
            <br />
            <span className="font-medium text-blue-600">{email}</span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert className="mb-4 border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-700">{error}</AlertDescription>
            </Alert>
          )}
          
          {success && (
            <Alert className="mb-4 border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-700">{success}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleVerifyOTP} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="otp">Verification Code</Label>
              <Input
                id="otp"
                type="text"
                placeholder="000000"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                maxLength={6}
                className="text-center text-2xl font-mono tracking-widest"
                disabled={isLoading}
              />
              <p className="text-sm text-gray-500 text-center">
                Enter the 6-digit code from your email
              </p>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || otp.length !== 6}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Verify Email
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 space-y-3">
            <div className="text-center">
              <p className="text-sm text-gray-600">Didn't receive the code?</p>
            </div>
            
            <Button
              variant="outline"
              className="w-full"
              onClick={handleResendOTP}
              disabled={isLoading || resendCooldown > 0}
            >
              {resendCooldown > 0 ? (
                <>
                  Resend in {resendCooldown}s
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-4 w-4" />
                  Resend Code
                </>
              )}
            </Button>
            
            <div className="text-center">
              <Link href="/login" className="text-sm text-blue-600 hover:underline">
                <ArrowLeft className="inline mr-1 h-3 w-3" />
                Back to Login
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}