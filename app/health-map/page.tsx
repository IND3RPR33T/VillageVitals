"use client"

import { useState, useEffect } from "react"
import { AuthGuard } from "@/components/auth-guard"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { MapPin, Activity, Droplets, Hospital, Users, Phone, Navigation, Filter, Loader2 } from "lucide-react"
import { getHealthReports, getWaterQualityTests, getSymptomReports, type HealthReport, type WaterQualityTest } from "@/lib/firestore-service"

// Static health centers (these don't change often)
const healthCenters = [
  {
    id: "hc1",
    type: "hospital" as const,
    name: "Guwahati Medical College",
    coordinates: { lat: 26.1445, lng: 91.7898 },
    contact: "+91 361 2528008",
    services: ["Emergency", "General Medicine", "Pediatrics"],
  },
  {
    id: "hc2",
    type: "hospital" as const,
    name: "Jorhat Medical College",
    coordinates: { lat: 26.7509, lng: 94.2037 },
    contact: "+91 376 2370012",
    services: ["Emergency", "Surgery", "Cardiology"],
  },
]

export default function HealthMapPage() {
  const [selectedLocation, setSelectedLocation] = useState<any>(null)
  const [showHealthIncidents, setShowHealthIncidents] = useState(true)
  const [showWaterSources, setShowWaterSources] = useState(true)
  const [showHealthCenters, setShowHealthCenters] = useState(true)
  const [severityFilter, setSeverityFilter] = useState("all")
  const [loading, setLoading] = useState(true)

  // Real data from Firestore
  const [healthIncidents, setHealthIncidents] = useState<any[]>([])
  const [waterSources, setWaterSources] = useState<any[]>([])

  useEffect(() => {
    loadMapData()
  }, [])

  const loadMapData = async () => {
    try {
      const [healthReports, waterTests, symptomReports] = await Promise.all([
        getHealthReports(50),
        getWaterQualityTests(50),
        getSymptomReports(50),
      ])

      // Transform health reports to map markers
      const healthMarkers = [
        ...healthReports.map((r, i) => ({
          id: r.id || `hr-${i}`,
          type: "health" as const,
          village: r.villageName || 'Unknown Village',
          coordinates: {
            lat: 26.1 + (Math.random() * 2),
            lng: 91.5 + (Math.random() * 3)
          },
          cases: r.numberOfCases || 1,
          symptoms: r.symptoms || [],
          severity: r.severity || 'low',
          date: formatDate(r.createdAt),
          population: 1000 + Math.floor(Math.random() * 2000),
        })),
        ...symptomReports.map((r, i) => ({
          id: r.id || `sr-${i}`,
          type: "health" as const,
          village: r.location?.address || r.patientInfo?.name || 'Symptom Report',
          coordinates: {
            lat: r.location?.latitude || 26.2 + (Math.random() * 2),
            lng: r.location?.longitude || 92 + (Math.random() * 3)
          },
          cases: 1,
          symptoms: r.symptoms?.map((s: any) => s.name || s) || [],
          severity: r.isEmergency ? 'high' : 'moderate',
          date: formatDate(r.createdAt),
          population: 800,
          source: 'Flutter App',
        })),
      ]

      // Transform water quality tests to map markers
      const waterMarkers = waterTests.map((t, i) => ({
        id: t.id || `wt-${i}`,
        type: "water" as const,
        village: t.location || 'Unknown Location',
        coordinates: {
          lat: 26 + (Math.random() * 2.5),
          lng: 92 + (Math.random() * 3)
        },
        sourceType: t.sourceType || 'Unknown',
        turbidity: t.measurements?.turbidity || 0,
        risk: t.riskAssessment?.level || 'low',
        date: formatDate(t.createdAt),
      }))

      setHealthIncidents(healthMarkers)
      setWaterSources(waterMarkers)
    } catch (error) {
      console.error('Error loading map data:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A'
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
      return date.toLocaleDateString()
    } catch {
      return 'N/A'
    }
  }

  const allLocations = [...healthIncidents, ...waterSources, ...healthCenters]

  const getMarkerColor = (item: any) => {
    if (item.type === "health") {
      switch (item.severity) {
        case "high":
        case "critical":
          return "bg-red-500"
        case "moderate":
        case "medium":
          return "bg-yellow-500"
        case "low":
          return "bg-green-500"
        default:
          return "bg-gray-500"
      }
    } else if (item.type === "water") {
      switch (item.risk) {
        case "high":
          return "bg-red-500"
        case "moderate":
          return "bg-yellow-500"
        case "low":
          return "bg-green-500"
        default:
          return "bg-gray-500"
      }
    } else {
      return "bg-blue-500"
    }
  }

  const getMarkerIcon = (item: any) => {
    switch (item.type) {
      case "health":
        return Activity
      case "water":
        return Droplets
      case "hospital":
        return Hospital
      default:
        return MapPin
    }
  }

  const filteredLocations = allLocations.filter((location) => {
    if (!showHealthIncidents && location.type === "health") return false
    if (!showWaterSources && location.type === "water") return false
    if (!showHealthCenters && location.type === "hospital") return false

    if (severityFilter !== "all") {
      if (location.type === "health" && location.severity !== severityFilter) return false
      if (location.type === "water" && location.risk !== severityFilter) return false
    }

    return true
  })

  if (loading) {
    return (
      <AuthGuard>
        <DashboardLayout>
          <div className="flex items-center justify-center min-h-[60vh]">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </DashboardLayout>
      </AuthGuard>
    )
  }

  return (
    <AuthGuard>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="animate-fade-in">
            <h1 className="text-3xl font-bold text-balance">Interactive Health Map</h1>
            <p className="text-muted-foreground mt-2">
              Visualize health incidents, water quality issues, and nearby health facilities
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Map Filters */}
            <Card className="lg:col-span-1 animate-slide-up">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Map Filters
                </CardTitle>
                <CardDescription>Control what information is displayed on the map</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Layer Controls */}
                <div className="space-y-4">
                  <h4 className="font-medium">Show Layers</h4>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="health-incidents"
                        checked={showHealthIncidents}
                        onCheckedChange={(checked) => setShowHealthIncidents(checked as boolean)}
                      />
                      <label htmlFor="health-incidents" className="text-sm flex items-center gap-2">
                        <Activity className="h-4 w-4 text-red-500" />
                        Health Incidents ({healthIncidents.length})
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="water-sources" checked={showWaterSources} onCheckedChange={(checked) => setShowWaterSources(checked as boolean)} />
                      <label htmlFor="water-sources" className="text-sm flex items-center gap-2">
                        <Droplets className="h-4 w-4 text-blue-500" />
                        Water Sources ({waterSources.length})
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="health-centers"
                        checked={showHealthCenters}
                        onCheckedChange={(checked) => setShowHealthCenters(checked as boolean)}
                      />
                      <label htmlFor="health-centers" className="text-sm flex items-center gap-2">
                        <Hospital className="h-4 w-4 text-green-500" />
                        Health Centers ({healthCenters.length})
                      </label>
                    </div>
                  </div>
                </div>

                {/* Severity Filter */}
                <div className="space-y-2">
                  <h4 className="font-medium">Filter by Severity</h4>
                  <Select value={severityFilter} onValueChange={setSeverityFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Levels</SelectItem>
                      <SelectItem value="high">High Risk Only</SelectItem>
                      <SelectItem value="moderate">Moderate Risk Only</SelectItem>
                      <SelectItem value="low">Low Risk Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Legend */}
                <div className="space-y-2">
                  <h4 className="font-medium">Legend</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <span>High Risk</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <span>Moderate Risk</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span>Low Risk/Safe</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span>Health Facility</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Map Area */}
            <Card className="lg:col-span-3 animate-slide-up">
              <CardHeader>
                <CardTitle>Health & Water Quality Map</CardTitle>
                <CardDescription>
                  Showing {filteredLocations.length} locations from Firestore. Click on markers to view details.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Simulated Map Interface */}
                <div className="relative bg-muted/30 rounded-lg h-96 overflow-hidden">
                  {/* Map Background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-green-100 to-blue-100">
                    <div className="absolute inset-0 opacity-20">
                      <svg width="100%" height="100%" className="text-muted-foreground/20">
                        <defs>
                          <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="1" />
                          </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#grid)" />
                      </svg>
                    </div>
                  </div>

                  {/* Map Markers */}
                  {filteredLocations.length === 0 ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <p className="text-muted-foreground">No data to display. Submit reports to see them on the map.</p>
                    </div>
                  ) : (
                    filteredLocations.map((location, index) => {
                      const Icon = getMarkerIcon(location)
                      const colorClass = getMarkerColor(location)

                      return (
                        <button
                          key={location.id}
                          className={`absolute w-8 h-8 ${colorClass} rounded-full flex items-center justify-center text-white shadow-lg hover:scale-110 transition-transform`}
                          style={{
                            left: `${10 + (index % 8) * 10}%`,
                            top: `${15 + Math.floor(index / 8) * 15}%`,
                          }}
                          onClick={() => setSelectedLocation(location)}
                        >
                          <Icon className="h-4 w-4" />
                        </button>
                      )
                    })
                  )}

                  {/* Map Controls */}
                  <div className="absolute top-4 right-4 flex flex-col gap-2">
                    <Button size="sm" variant="secondary">
                      +
                    </Button>
                    <Button size="sm" variant="secondary">
                      -
                    </Button>
                  </div>

                  {/* Compass */}
                  <div className="absolute bottom-4 right-4">
                    <div className="w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center">
                      <Navigation className="h-6 w-6 text-muted-foreground" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Location Details */}
          {selectedLocation && (
            <Card className="animate-slide-up">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {selectedLocation.type === "health" && <Activity className="h-5 w-5" />}
                  {selectedLocation.type === "water" && <Droplets className="h-5 w-5" />}
                  {selectedLocation.type === "hospital" && <Hospital className="h-5 w-5" />}
                  {selectedLocation.village || selectedLocation.name}
                  {selectedLocation.source && (
                    <Badge variant="outline" className="ml-2">{selectedLocation.source}</Badge>
                  )}
                </CardTitle>
                <CardDescription>Detailed information about this location</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Health Incident Details */}
                  {selectedLocation.type === "health" && (
                    <>
                      <div className="space-y-2">
                        <h4 className="font-medium flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          Cases & Population
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          <strong>{selectedLocation.cases}</strong> reported cases
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Village population: <strong>{selectedLocation.population}</strong>
                        </p>
                        <Badge
                          variant={
                            selectedLocation.severity === "high" || selectedLocation.severity === "critical"
                              ? "destructive"
                              : selectedLocation.severity === "moderate"
                                ? "default"
                                : "secondary"
                          }
                        >
                          {selectedLocation.severity} severity
                        </Badge>
                      </div>

                      <div className="space-y-2">
                        <h4 className="font-medium">Symptoms Reported</h4>
                        <div className="flex flex-wrap gap-1">
                          {selectedLocation.symptoms && selectedLocation.symptoms.length > 0 ? (
                            selectedLocation.symptoms.map((symptom: string, idx: number) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {symptom}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-sm text-muted-foreground">No symptoms recorded</span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">Reported on {selectedLocation.date}</p>
                      </div>
                    </>
                  )}

                  {/* Water Source Details */}
                  {selectedLocation.type === "water" && (
                    <>
                      <div className="space-y-2">
                        <h4 className="font-medium">Water Quality</h4>
                        <p className="text-sm text-muted-foreground">
                          Source Type: <strong>{selectedLocation.sourceType}</strong>
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Turbidity: <strong>{selectedLocation.turbidity} NTU</strong>
                        </p>
                        <Badge
                          variant={
                            selectedLocation.risk === "high"
                              ? "destructive"
                              : selectedLocation.risk === "moderate"
                                ? "default"
                                : "secondary"
                          }
                        >
                          {selectedLocation.risk} risk
                        </Badge>
                      </div>

                      <div className="space-y-2">
                        <h4 className="font-medium">Test Information</h4>
                        <p className="text-xs text-muted-foreground">Last tested on {selectedLocation.date}</p>
                        <Button size="sm" variant="outline">
                          Schedule Retest
                        </Button>
                      </div>
                    </>
                  )}

                  {/* Health Center Details */}
                  {selectedLocation.type === "hospital" && (
                    <>
                      <div className="space-y-2">
                        <h4 className="font-medium flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          Contact Information
                        </h4>
                        <p className="text-sm text-muted-foreground">{selectedLocation.contact}</p>
                        <Button size="sm" variant="outline">
                          Call Now
                        </Button>
                      </div>

                      <div className="space-y-2">
                        <h4 className="font-medium">Available Services</h4>
                        <div className="flex flex-wrap gap-1">
                          {selectedLocation.services.map((service: string) => (
                            <Badge key={service} variant="outline" className="text-xs">
                              {service}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  {/* Common Actions */}
                  <div className="space-y-2">
                    <h4 className="font-medium">Actions</h4>
                    <div className="flex flex-col gap-2">
                      <Button size="sm" variant="outline">
                        Get Directions
                      </Button>
                      {selectedLocation.type !== "hospital" && (
                        <Button size="sm" variant="outline">
                          Report Issue
                        </Button>
                      )}
                      <Button size="sm" variant="outline">
                        Share Location
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Summary Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="animate-slide-up">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Health Incidents</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{healthIncidents.length}</div>
                <p className="text-xs text-muted-foreground">
                  {healthIncidents.filter((h) => h.severity === "high" || h.severity === "critical").length} high priority
                </p>
              </CardContent>
            </Card>

            <Card className="animate-slide-up">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Water Sources Monitored</CardTitle>
                <Droplets className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{waterSources.length}</div>
                <p className="text-xs text-muted-foreground">
                  {waterSources.filter((w) => w.risk === "high").length} need immediate attention
                </p>
              </CardContent>
            </Card>

            <Card className="animate-slide-up">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Health Facilities</CardTitle>
                <Hospital className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{healthCenters.length}</div>
                <p className="text-xs text-muted-foreground">Available for emergency response</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </DashboardLayout>
    </AuthGuard>
  )
}
