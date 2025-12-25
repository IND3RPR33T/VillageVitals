"use client"

import React, { useState, useEffect } from "react"
import { AuthGuard } from "@/components/auth-guard"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { format } from "date-fns"
import { CalendarIcon, Droplets, AlertTriangle, CheckCircle, TrendingUp, Eye, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Area, AreaChart } from "recharts"

// Mock data for water quality trends
const waterQualityTrends = [
  { month: "Jan", turbidity: 8.2, nitrate: 12, risk: 15 },
  { month: "Feb", turbidity: 9.1, nitrate: 20, risk: 18 },
  { month: "Mar", turbidity: 7.8, nitrate: 10, risk: 12 },
  { month: "Apr", turbidity: 6.5, nitrate: 15, risk: 8 },
  { month: "May", turbidity: 8.9, nitrate: 25, risk: 16 },
  { month: "Jun", turbidity: 5.2, nitrate: 8, risk: 6 },
]

const recentTests = [
  {
    id: 1,
    location: "Main Well - Kamakhya Village",
    turbidity: 8.5,
    nitrate: 12,
    risk: "low",
    date: "2024-01-15",
    tester: "Water Inspector Ram",
  },
  {
    id: 2,
    location: "River Source - Majuli Village",
    turbidity: 15.2,
    nitrate: 28,
    risk: "moderate",
    date: "2024-01-14",
    tester: "Health Worker Priya",
  },
  {
    id: 3,
    location: "Community Pump - Dibrugarh",
    turbidity: 22.8,
    nitrate: 40,
    risk: "high",
    date: "2024-01-13",
    tester: "Dr. Sharma",
  },
]

const getRiskColor = (risk: string) => {
  switch (risk) {
    case "low":
      return "text-green-600 bg-green-100"
    case "moderate":
      return "text-yellow-600 bg-yellow-100"
    case "high":
      return "text-red-600 bg-red-100"
    default:
      return "text-gray-600 bg-gray-100"
  }
}

// API function to call your local ML model
const predictWaterQualityRisk = async (parameters: {
  coliform: number
  turbidity: number
  bod: number
  cod: number
  nitrate: number
  ammonia: number
}) => {
  try {
    const response = await fetch('/api/predict-water-risk', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(parameters),
    })
    
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
    }
    
    const result = await response.json()
    
    // Validate the response format
    if (result.status === 'error') {
      throw new Error(result.error || 'Model prediction failed')
    }
    
    return result
  } catch (error) {
    console.error('Error calling local ML model:', error)
    throw error
  }
}

export default function WaterQualityPage() {
  const [date, setDate] = useState<Date>()
  const [isDateOpen, setIsDateOpen] = useState(false)
  const [coliform, setColiform] = useState("")
  const [turbidity, setTurbidity] = useState("")
  const [bod, setBod] = useState("")
  const [cod, setCod] = useState("")
  const [nitrate, setNitrate] = useState("")
  const [ammonia, setAmmonia] = useState("")
  const [sourceType, setSourceType] = useState("")
  const [gpsCoordinates, setGpsCoordinates] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [currentRisk, setCurrentRisk] = useState<{
    level: string
    percentage: number
    color: string
    confidence?: number
  } | null>(null)
  const [isLoadingPrediction, setIsLoadingPrediction] = useState(false)
  const [predictionError, setPredictionError] = useState<string | null>(null)

  const hasValues = coliform && turbidity && bod && cod && nitrate && ammonia

  // Function to get risk prediction from your model
  const getRiskPrediction = async () => {
    if (!hasValues) return

    setIsLoadingPrediction(true)
    setPredictionError(null)

    try {
      const parameters = {
        coliform: Number(coliform),
        turbidity: Number(turbidity),
        bod: Number(bod),
        cod: Number(cod),
        nitrate: Number(nitrate),
        ammonia: Number(ammonia),
      }

      const prediction = await predictWaterQualityRisk(parameters)
      
      // Assuming your model returns something like:
      // { risk_level: "high", probability: 0.85, confidence: 0.92 }
      // Adjust this based on your actual model output format
      
      let riskLevel: string
      let percentage: number
      let color: string

      if (prediction.risk_level === "high" || prediction.probability > 0.7) {
        riskLevel = "high"
        percentage = Math.round(prediction.probability * 100)
        color = "red"
      } else if (prediction.risk_level === "moderate" || prediction.probability > 0.4) {
        riskLevel = "moderate"
        percentage = Math.round(prediction.probability * 100)
        color = "yellow"
      } else {
        riskLevel = "low"
        percentage = Math.round(prediction.probability * 100)
        color = "green"
      }

      setCurrentRisk({
        level: riskLevel,
        percentage: percentage,
        color: color,
        confidence: prediction.confidence ? Math.round(prediction.confidence * 100) : undefined
      })
      
    } catch (error) {
      console.error('Prediction error:', error)
      setPredictionError('Failed to get risk prediction. Using fallback assessment.')
      
      // Fallback to original logic if API fails
      const fallbackRisk = getFallbackRiskLevel({
        coliform: Number(coliform),
        turbidity: Number(turbidity),
        bod: Number(bod),
        cod: Number(cod),
        nitrate: Number(nitrate),
        ammonia: Number(ammonia),
      })
      setCurrentRisk(fallbackRisk)
    } finally {
      setIsLoadingPrediction(false)
    }
  }

  // Fallback risk assessment (your original logic)
  const getFallbackRiskLevel = (values: {
    coliform: number
    turbidity: number
    bod: number
    cod: number
    nitrate: number
    ammonia: number
  }) => {
    let score = 0

    if (values.coliform > 1000) score += 3
    else if (values.coliform > 100) score += 2
    else if (values.coliform > 0) score += 1

    if (values.turbidity > 10) score += 2
    if (values.bod > 5) score += 2
    if (values.cod > 10) score += 2
    if (values.nitrate > 50) score += 2
    if (values.ammonia > 1) score += 2

    if (score <= 3) return { level: "low", percentage: 30, color: "green" }
    if (score <= 6) return { level: "moderate", percentage: 65, color: "yellow" }
    return { level: "high", percentage: 90, color: "red" }
  }

  // Trigger prediction when all values are entered
  useEffect(() => {
    if (hasValues) {
      const timeoutId = setTimeout(() => {
        getRiskPrediction()
      }, 500) // Debounce for 500ms

      return () => clearTimeout(timeoutId)
    } else {
      setCurrentRisk(null)
      setPredictionError(null)
    }
  }, [coliform, turbidity, bod, cod, nitrate, ammonia])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!sourceType) {
      window.alert("Please select a water source type before submitting.")
      return
    }
    setIsSubmitting(true)

    // Here you can also send the risk prediction along with the form data
    const submissionData = {
      date: date?.toISOString(),
      location: (document.getElementById('location') as HTMLInputElement)?.value,
      sourceType,
      gpsCoordinates,
      measurements: {
        coliform: Number(coliform),
        turbidity: Number(turbidity),
        bod: Number(bod),
        cod: Number(cod),
        nitrate: Number(nitrate),
        ammonia: Number(ammonia),
      },
      riskAssessment: currentRisk,
      notes: (document.getElementById('notes') as HTMLTextAreaElement)?.value,
    }

    // Submit to your backend
    try {
      // await submitWaterQualityTest(submissionData)
      await new Promise((resolve) => setTimeout(resolve, 2000)) // Mock delay
      setIsSubmitting(false)
      setIsSubmitted(true)
    } catch (error) {
      console.error('Submission error:', error)
      setIsSubmitting(false)
      window.alert("Failed to submit test results. Please try again.")
    }
  }

  if (isSubmitted) {
    return (
      <AuthGuard>
        <DashboardLayout>
          <div className="max-w-2xl mx-auto">
            <Card className="text-center animate-slide-up">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Droplets className="w-8 h-8 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Water Quality Test Submitted</h2>
                <p className="text-muted-foreground mb-6">
                  Your water quality test results have been recorded and analyzed by our ML model. Alerts will be sent if
                  immediate action is required.
                </p>
                <div className="flex gap-4 justify-center">
                  <Button onClick={() => setIsSubmitted(false)}>Submit Another Test</Button>
                  <Button variant="outline" asChild>
                    <a href="/dashboard">Return to Dashboard</a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </DashboardLayout>
      </AuthGuard>
    )
  }

  return (
    <AuthGuard>
      <DashboardLayout>
        <div className="space-y-8">
          <div className="animate-fade-in">
            <h1 className="text-3xl font-bold text-balance">Water Quality Monitoring</h1>
            <p className="text-muted-foreground mt-2">
              Monitor and report water quality metrics with AI-powered risk assessment
            </p>
          </div>

          <Tabs defaultValue="submit" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="submit">Submit Test</TabsTrigger>
              <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
              <TabsTrigger value="history">Test History</TabsTrigger>
            </TabsList>

            {/* Submit Test */}
            <TabsContent value="submit" className="space-y-8">
              <form onSubmit={handleSubmit} className="max-w-4xl space-y-8">
                <Card className="animate-slide-up">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Droplets className="h-5 w-5" />
                      Water Source Information
                    </CardTitle>
                    <CardDescription>Provide details about the water source being tested</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="test-date">Test Date</Label>
                        <Popover open={isDateOpen} onOpenChange={setIsDateOpen}>
                          <PopoverTrigger asChild>
                            <Button
                              id="test-date"
                              type="button"
                              variant="outline"
                              className={cn(
                                "w-full justify-start text-left font-normal",
                                !date && "text-muted-foreground",
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {date ? format(date, "PPP") : "Select test date"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={date}
                              onSelect={(d) => {
                                setDate(d)
                                if (d) setIsDateOpen(false)
                              }}
                              onDayClick={(d) => {
                                setDate(d)
                                if (d) setIsDateOpen(false)
                              }}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <div className="mt-2">
                          <Label htmlFor="test-date-native" className="text-xs text-muted-foreground">
                            Or use native picker
                          </Label>
                          <Input
                            id="test-date-native"
                            type="date"
                            value={date ? format(date, "yyyy-MM-dd") : ""}
                            onChange={(e) => {
                              const v = e.target.value
                              if (!v) {
                                setDate(undefined)
                                return
                              }
                              const parts = v.split("-")
                              const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]))
                              setDate(d)
                            }}
                          />
                        </div>
                        <input type="hidden" name="testDate" value={date ? date.toISOString() : ""} />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="location">Location/Village</Label>
                        <Input id="location" placeholder="Enter location or village name" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="source-type">Source Type</Label>
                        <Select value={sourceType} onValueChange={setSourceType}>
                          <SelectTrigger id="source-type" className="w-full">
                            <SelectValue placeholder="Select water source type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="well">Well</SelectItem>
                            <SelectItem value="river">River</SelectItem>
                            <SelectItem value="tap">Tap</SelectItem>
                            <SelectItem value="borehole">Borehole</SelectItem>
                            <SelectItem value="rainwater">Rainwater</SelectItem>
                            <SelectItem value="pond">Pond</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <input type="hidden" name="sourceType" value={sourceType} required aria-required="true" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="gps">GPS Coordinates (Optional)</Label>
                        <Input
                          id="gps"
                          name="gps"
                          placeholder="e.g., 26.1445, 91.7362"
                          value={gpsCoordinates}
                          onChange={(e) => setGpsCoordinates(e.target.value)}
                          pattern={"^-?\\d{1,2}(\\.\\d+)?,\\s*-?\\d{1,3}(\\.\\d+)?$"}
                          title="Enter coordinates as Latitude, Longitude"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Water Quality Metrics */}
                <Card className="animate-slide-up">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Quality Measurements
                    </CardTitle>
                    <CardDescription>Enter the measured water quality parameters for AI risk assessment</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="coliform">Coliform Bacteria (CFU/mL)</Label>
                        <Input
                          id="coliform"
                          type="number"
                          value={coliform}
                          onChange={(e) => setColiform(e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="turbidity">Turbidity (NTU)</Label>
                        <Input
                          id="turbidity"
                          type="number"
                          step="0.1"
                          value={turbidity}
                          onChange={(e) => setTurbidity(e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="bod">BOD (mg/L)</Label>
                        <Input
                          id="bod"
                          type="number"
                          step="0.1"
                          value={bod}
                          onChange={(e) => setBod(e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cod">COD (mg/L)</Label>
                        <Input
                          id="cod"
                          type="number"
                          step="0.1"
                          value={cod}
                          onChange={(e) => setCod(e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="nitrate">Nitrate (NO₃⁻) (mg/L)</Label>
                        <Input
                          id="nitrate"
                          type="number"
                          step="0.1"
                          value={nitrate}
                          onChange={(e) => setNitrate(e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="ammonia">Ammonia (NH₃) (mg/L)</Label>
                        <Input
                          id="ammonia"
                          type="number"
                          step="0.1"
                          value={ammonia}
                          onChange={(e) => setAmmonia(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    {/* Risk Indicator */}
                    {hasValues && (
                      <div className="p-4 border rounded-lg bg-muted/30">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium flex items-center gap-2">
                            AI Risk Assessment
                            {isLoadingPrediction && <Loader2 className="h-4 w-4 animate-spin" />}
                          </h4>
                          {currentRisk && (
                            <Badge className={getRiskColor(currentRisk.level)}>
                              {currentRisk.level.toUpperCase()} RISK
                            </Badge>
                          )}
                        </div>
                        
                        {predictionError && (
                          <div className="mb-3 text-sm text-yellow-600 bg-yellow-50 p-2 rounded">
                            ⚠️ {predictionError}
                          </div>
                        )}
                        
                        {currentRisk && (
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Risk Level</span>
                              <span>{currentRisk.percentage}%</span>
                            </div>
                            <Progress
                              value={currentRisk.percentage}
                              className={`h-2 ${
                                currentRisk.color === "green"
                                  ? "[&>div]:bg-green-500"
                                  : currentRisk.color === "yellow"
                                    ? "[&>div]:bg-yellow-500"
                                    : "[&>div]:bg-red-500"
                              }`}
                            />
                            {currentRisk.confidence && (
                              <div className="text-xs text-muted-foreground">
                                Model Confidence: {currentRisk.confidence}%
                              </div>
                            )}
                          </div>
                        )}
                        
                        {isLoadingPrediction && !currentRisk && (
                          <div className="text-sm text-muted-foreground flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Analyzing water quality parameters...
                          </div>
                        )}
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="notes">Additional Notes</Label>
                      <Textarea
                        id="notes"
                        placeholder="Any observations, unusual conditions, or additional information..."
                        rows={3}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Submit Button */}
                <div className="flex justify-end gap-4">
                  <Button type="button" variant="outline" asChild>
                    <a href="/dashboard">Cancel</a>
                  </Button>
                  <Button type="submit" disabled={isSubmitting} className="min-w-32">
                    {isSubmitting ? "Submitting..." : "Submit Test Results"}
                  </Button>
                </div>
              </form>
            </TabsContent>

            {/* Dashboard */}
            <TabsContent value="dashboard" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="animate-slide-up">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Safe Sources</CardTitle>
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">65%</div>
                    <p className="text-xs text-muted-foreground">58 out of 89 sources</p>
                  </CardContent>
                </Card>

                <Card className="animate-slide-up">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Moderate Risk</CardTitle>
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-yellow-600">25%</div>
                    <p className="text-xs text-muted-foreground">22 sources need monitoring</p>
                  </CardContent>
                </Card>

                <Card className="animate-slide-up">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">High Risk</CardTitle>
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-red-600">10%</div>
                    <p className="text-xs text-muted-foreground">9 sources need immediate action</p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="animate-slide-up">
                  <CardHeader>
                    <CardTitle>Turbidity Trends</CardTitle>
                    <CardDescription>Monthly average turbidity levels (NTU)</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={waterQualityTrends}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Area
                          type="monotone"
                          dataKey="turbidity"
                          stroke="hsl(var(--chart-1))"
                          fill="hsl(var(--chart-1))"
                          fillOpacity={0.3}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card className="animate-slide-up">
                  <CardHeader>
                    <CardTitle>Nitrate Trends</CardTitle>
                    <CardDescription>Monthly average nitrate levels (mg/L)</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={waterQualityTrends}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="nitrate" stroke="hsl(var(--chart-2))" strokeWidth={3} />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* History */}
            <TabsContent value="history" className="space-y-6">
              <Card className="animate-slide-up">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Recent Water Quality Tests</CardTitle>
                    <CardDescription>Latest test results from all sources</CardDescription>
                  </div>
                  <Button asChild>
                    <a href="/reports">
                      <Eye className="h-4 w-4 mr-2" />
                      View All Reports
                    </a>
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentTests.map((test) => (
                      <div key={test.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          <div
                            className={`w-12 h-12 rounded-lg flex items-center justify-center ${getRiskColor(
                              test.risk
                            )}`}
                          >
                            <Droplets className="h-6 w-6" />
                          </div>
                          <div>
                            <h4 className="font-medium">{test.location}</h4>
                            <p className="text-sm text-muted-foreground">
                              Tested by {test.tester} on {test.date}
                            </p>
                            <div className="flex gap-4 mt-1 text-xs text-muted-foreground">
                              <span>Turbidity: {test.turbidity} NTU</span>
                              <span>Nitrate: {test.nitrate} mg/L</span>
                            </div>
                          </div>
                        </div>
                        <Badge className={getRiskColor(test.risk)}>{test.risk.toUpperCase()} RISK</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </DashboardLayout>
    </AuthGuard>
  )
}