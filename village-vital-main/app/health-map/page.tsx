"use client"

import { useState } from "react"
import { AuthGuard } from "@/components/auth-guard"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { MapPin, Activity, Droplets, Hospital, Users, Phone, Navigation, Filter } from "lucide-react"

// Mock data for map locations
const healthIncidents = [
  {
    id: 1,
    type: "health",
    village: "Kamakhya Village",
    coordinates: { lat: 26.1445, lng: 91.7362 },
    cases: 5,
    symptoms: ["Fever", "Headache"],
    severity: "moderate",
    date: "2024-01-15",
    population: 1200,
  },
  {
    id: 2,
    type: "health",
    village: "Majuli Village",
    coordinates: { lat: 26.951, lng: 94.2224 },
    cases: 2,
    symptoms: ["Stomach Pain"],
    severity: "low",
    date: "2024-01-14",
    population: 800,
  },
  {
    id: 3,
    type: "health",
    village: "Dibrugarh Village",
    coordinates: { lat: 27.4728, lng: 94.912 },
    cases: 8,
    symptoms: ["Fever", "Cough", "Difficulty Breathing"],
    severity: "high",
    date: "2024-01-13",
    population: 2100,
  },
]

const waterSources = [
  {
    id: 4,
    type: "water",
    village: "Brahmaputra Village",
    coordinates: { lat: 26.2006, lng: 92.9376 },
    sourceType: "Well",
    turbidity: 8.5,
    risk: "low",
    date: "2024-01-15",
  },
  {
    id: 5,
    type: "water",
    village: "Tezpur Village",
    coordinates: { lat: 26.6335, lng: 92.7983 },
    sourceType: "River",
    turbidity: 15.2,
    risk: "moderate",
    date: "2024-01-14",
  },
  {
    id: 6,
    type: "water",
    village: "Silchar Village",
    coordinates: { lat: 24.8333, lng: 92.7789 },
    sourceType: "Pond",
    turbidity: 25.8,
    risk: "high",
    date: "2024-01-12",
  },
]

const healthCenters = [
  {
    id: 7,
    type: "hospital",
    name: "Guwahati Medical College",
    coordinates: { lat: 26.1445, lng: 91.7898 },
    contact: "+91 361 2528008",
    services: ["Emergency", "General Medicine", "Pediatrics"],
  },
  {
    id: 8,
    type: "hospital",
    name: "Jorhat Medical College",
    coordinates: { lat: 26.7509, lng: 94.2037 },
    contact: "+91 376 2370012",
    services: ["Emergency", "Surgery", "Cardiology"],
  },
]

const allLocations = [...healthIncidents, ...waterSources, ...healthCenters]

export default function HealthMapPage() {
  const [selectedLocation, setSelectedLocation] = useState<any>(null)
  const [showHealthIncidents, setShowHealthIncidents] = useState(true)
  const [showWaterSources, setShowWaterSources] = useState(true)
  const [showHealthCenters, setShowHealthCenters] = useState(true)
  const [severityFilter, setSeverityFilter] = useState("all")

  const getMarkerColor = (item: any) => {
    if (item.type === "health") {
      switch (item.severity) {
        case "high":
          return "bg-red-500"
        case "moderate":
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
                        onCheckedChange={setShowHealthIncidents}
                      />
                      <label htmlFor="health-incidents" className="text-sm flex items-center gap-2">
                        <Activity className="h-4 w-4 text-red-500" />
                        Health Incidents
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="water-sources" checked={showWaterSources} onCheckedChange={setShowWaterSources} />
                      <label htmlFor="water-sources" className="text-sm flex items-center gap-2">
                        <Droplets className="h-4 w-4 text-blue-500" />
                        Water Sources
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="health-centers"
                        checked={showHealthCenters}
                        onCheckedChange={setShowHealthCenters}
                      />
                      <label htmlFor="health-centers" className="text-sm flex items-center gap-2">
                        <Hospital className="h-4 w-4 text-green-500" />
                        Health Centers
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
                <CardDescription>Click on markers to view detailed information about each location</CardDescription>
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
                  {filteredLocations.map((location, index) => {
                    const Icon = getMarkerIcon(location)
                    const colorClass = getMarkerColor(location)

                    return (
                      <button
                        key={location.id}
                        className={`absolute w-8 h-8 ${colorClass} rounded-full flex items-center justify-center text-white shadow-lg hover:scale-110 transition-transform animate-pulse-health`}
                        style={{
                          left: `${20 + (index % 5) * 15}%`,
                          top: `${20 + Math.floor(index / 5) * 20}%`,
                        }}
                        onClick={() => setSelectedLocation(location)}
                      >
                        <Icon className="h-4 w-4" />
                      </button>
                    )
                  })}

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
                            selectedLocation.severity === "high"
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
                          {selectedLocation.symptoms.map((symptom: string) => (
                            <Badge key={symptom} variant="outline" className="text-xs">
                              {symptom}
                            </Badge>
                          ))}
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
                  {healthIncidents.filter((h) => h.severity === "high").length} high priority
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
