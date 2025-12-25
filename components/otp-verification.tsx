"use client"

import React, { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Mail, CheckCircle, AlertCircle, ArrowLeft, RefreshCw } from "lucide-react"

interface OTPVerificationProps {
  email: string;
  onVerificationSuccess: () => void;
  onBack: () => void;
}

export function OTPVerification({ email, onVerificationSuccess, onBack }: OTPVerificationProps) {
  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    // Focus on first input when component mounts
    setTimeout(() => {
      if (inputRefs.current[0]) {
        inputRefs.current[0].focus();
        setActiveIndex(0);
      }
    }, 100);
  }, []);

  const handleInputChange = (index: number, value: string) => {
    // Clear any existing errors
    setError("");
    
    // Only allow single digits
    if (!/^\d$/.test(value) && value !== "") return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus to next input when digit is entered
    if (value && index < 5) {
      const nextIndex = index + 1;
      setActiveIndex(nextIndex);
      setTimeout(() => {
        inputRefs.current[nextIndex]?.focus();
      }, 10);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    setError(""); // Clear errors on any key press
    
    if (e.key === "Backspace") {
      e.preventDefault();
      const newOtp = [...otp];
      
      if (otp[index]) {
        // Clear current input
        newOtp[index] = "";
        setOtp(newOtp);
      } else if (index > 0) {
        // Move to previous input and clear it
        newOtp[index - 1] = "";
        setOtp(newOtp);
        const prevIndex = index - 1;
        setActiveIndex(prevIndex);
        setTimeout(() => {
          inputRefs.current[prevIndex]?.focus();
        }, 10);
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      e.preventDefault();
      const prevIndex = index - 1;
      setActiveIndex(prevIndex);
      inputRefs.current[prevIndex]?.focus();
    } else if (e.key === "ArrowRight" && index < 5) {
      e.preventDefault();
      const nextIndex = index + 1;
      setActiveIndex(nextIndex);
      inputRefs.current[nextIndex]?.focus();
    } else if (e.key === "Enter") {
      e.preventDefault();
      handleVerifyOTP();
    } else if (/\d/.test(e.key)) {
      // Handle direct digit input
      e.preventDefault();
      const newOtp = [...otp];
      newOtp[index] = e.key;
      setOtp(newOtp);
      
      // Move to next input
      if (index < 5) {
        const nextIndex = index + 1;
        setActiveIndex(nextIndex);
        setTimeout(() => {
          inputRefs.current[nextIndex]?.focus();
        }, 10);
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text");
    const digits = pastedData.replace(/\D/g, "").slice(0, 6);
    
    if (digits.length === 0) {
      setError("Please paste a valid 6-digit OTP code");
      return;
    }
    
    const newOtp = ["", "", "", "", "", ""];
    for (let i = 0; i < Math.min(digits.length, 6); i++) {
      newOtp[i] = digits[i];
    }
    setOtp(newOtp);

    // Focus on the next empty input or verify if complete
    const nextEmptyIndex = newOtp.findIndex(digit => digit === "");
    if (nextEmptyIndex === -1) {
      setActiveIndex(5);
      inputRefs.current[5]?.focus();
      // Auto-verify if complete OTP is pasted
      setTimeout(() => {
        if (newOtp.every(digit => digit !== "")) {
          handleVerifyOTP();
        }
      }, 100);
    } else {
      setActiveIndex(nextEmptyIndex);
      inputRefs.current[nextEmptyIndex]?.focus();
    }
  };

  const handleVerifyOTP = async () => {
    const otpCode = otp.join("");
    if (otpCode.length !== 6) {
      setError("Please enter all 6 digits of the OTP code");
      return;
    }

    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          otpCode,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess("Account verified successfully! Redirecting...");
        setTimeout(() => {
          onVerificationSuccess();
        }, 1500);
      } else {
        setError(data.error || "Verification failed");
      }
    } catch (error) {
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/auth/resend-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(data.message || "OTP has been resent to your email");
      } else {
        setError(data.error || "Failed to resend OTP. Please try again.");
      }
    } catch (error) {
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto animate-slide-up">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
          <Mail className="w-8 h-8 text-primary" />
        </div>
        <CardTitle>Verify Your Email</CardTitle>
        <CardDescription>
          We've sent a 6-digit verification code to
          <br />
          <strong>{email}</strong>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="border-green-200 bg-green-50 text-green-800">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h3 className="text-lg font-semibold text-foreground">Enter Verification Code</h3>
            <p className="text-sm text-muted-foreground">
              We've sent a 6-digit code to <span className="font-medium text-primary">{email}</span>
            </p>
          </div>
          
          <div className="flex gap-2 justify-center items-center">
            {otp.map((digit, index) => (
              <div
                key={index}
                className={`relative transition-all duration-200 ${
                  activeIndex === index ? "scale-105" : ""
                }`}
              >
                <input
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleInputChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onFocus={() => setActiveIndex(index)}
                  onPaste={index === 0 ? handlePaste : undefined}
                  disabled={isLoading}
                  autoComplete="one-time-code"
                  className={`
                    w-16 h-16 text-center text-2xl font-bold rounded-xl border-2 
                    transition-all duration-200 outline-none
                    ${digit 
                      ? "border-green-500 bg-green-50 text-green-800" 
                      : activeIndex === index 
                        ? "border-primary bg-primary/5 shadow-lg shadow-primary/25" 
                        : "border-gray-200 bg-white hover:border-gray-300"
                    }
                    ${isLoading ? "opacity-50 cursor-not-allowed" : "cursor-text"}
                    focus:border-primary focus:bg-primary/5 focus:shadow-lg focus:shadow-primary/25
                  `}
                />
                {/* Active indicator */}
                {activeIndex === index && !isLoading && (
                  <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-primary rounded-full animate-pulse"></div>
                )}
              </div>
            ))}
          </div>

          {/* Progress indicator */}
          <div className="flex justify-center">
            <div className="flex gap-1">
              {otp.map((digit, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-all duration-200 ${
                    digit ? "bg-primary" : "bg-gray-200"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        <Button
          onClick={handleVerifyOTP}
          disabled={isLoading || otp.some(digit => !digit)}
          className="w-full"
        >
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isLoading ? "Verifying..." : "Verify Account"}
        </Button>

        <div className="flex flex-col gap-3">
          <div className="text-center text-sm text-muted-foreground">
            Didn't receive the code?{" "}
            <button
              onClick={handleResendOTP}
              disabled={isLoading}
              className="text-primary hover:underline font-medium inline-flex items-center gap-1 transition-colors"
            >
              <RefreshCw className={`w-3 h-3 ${isLoading ? "animate-spin" : ""}`} />
              Resend OTP
            </button>
          </div>

          <Button
            variant="outline"
            onClick={onBack}
            disabled={isLoading}
            className="w-full flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Registration
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
