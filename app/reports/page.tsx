"use client"

import { useState } from "react"
import { AuthGuard } from "@/components/auth-guard"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Activity, Droplets, Search, Filter, Download, Eye, Calendar, MapPin, Users } from "lucide-react"
import Link from "next/link"

// Mock data for reports
const healthReports = [
  {
    id: 1,
    type: "Health Report",
    village: "Kamakhya Village",
    state: "Assam",
    cases: 5,
    symptoms: ["Fever", "Headache", "Body Ache"],
    date: "2024-01-15",
    severity: "moderate",
    status: "under-review",
    reporter: "Dr. Priya Sharma",
  },
  {
    id: 2,
    type: "Health Report",
    village: "Majuli Village",
    state: "Assam",
    cases: 2,
    symptoms: ["Stomach Pain", "Nausea"],
    date: "2024-01-14",
    severity: "low",
    status: "resolved",
    reporter: "Health Worker Ram",
  },
  {
    id: 3,
    type: "Health Report",
    village: "Dibrugarh Village",
    state: "Assam",
    cases: 8,
    symptoms: ["Fever", "Cough", "Difficulty Breathing"],
    date: "2024-01-13",
    severity: "high",
    status: "active",
    reporter: "Community Member",
  },
]

const waterReports = [
  {
    id: 4,
    type: "Water Quality",
    village: "Brahmaputra Village",
    state: "Assam",
    turbidity: 8.5,
    contamination: "Low",
    risk: "low",
    date: "2024-01-15",
    status: "safe",
    reporter: "Water Inspector",
  },
  {
    id: 5,
    type: "Water Quality",
    village: "Tezpur Village",
    state: "Assam",
    turbidity: 15.2,
    contamination: "Moderate",
    risk: "moderate",
    date: "2024-01-14",
    status: "monitoring",
    reporter: "Health Worker",
  },
]

export default function ReportsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterState, setFilterState] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "destructive"
      case "moderate":
        return "default"
      case "low":
        return "secondary"
      default:
        return "secondary"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "destructive"
      case "under-review":
        return "default"
      case "resolved":
        return "secondary"
      case "safe":
        return "secondary"
      case "monitoring":
        return "default"
      default:
        return "secondary"
    }
  }

  return (
    <AuthGuard>
      <DashboardLayout>
        <div className="space-y-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="animate-fade-in">
              <h1 className="text-3xl font-bold">Reports & Data</h1>
              <p className="text-muted-foreground mt-2">View and manage all health and water quality reports</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export Data
              </Button>
              <Button asChild>
                <Link href="/health-report">
                  <Activity className="h-4 w-4 mr-2" />
                  New Report
                </Link>
              </Button>
            </div>
          </div>

          {/* Filters */}
          <Card className="animate-slide-up">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filters & Search
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by village, symptoms, or reporter..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={filterState} onValueChange={setFilterState}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="Filter by state" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All States</SelectItem>
                    <SelectItem value="assam">Assam</SelectItem>
                    <SelectItem value="manipur">Manipur</SelectItem>
                    <SelectItem value="mizoram">Mizoram</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="under-review">Under Review</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Reports Tabs */}
          <Tabs defaultValue="health" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="health" className="flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Health Reports
              </TabsTrigger>
              <TabsTrigger value="water" className="flex items-center gap-2">
                <Droplets className="h-4 w-4" />
                Water Quality
              </TabsTrigger>
            </TabsList>

            {/* Health Reports */}
            <TabsContent value="health" className="space-y-4">
              {healthReports.map((report) => (
                <Card key={report.id} className="animate-slide-up hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-semibold text-lg flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-muted-foreground" />
                              {report.village}, {report.state}
                            </h3>
                            <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                              <Calendar className="h-4 w-4" />
                              {report.date} • Reported by {report.reporter}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Badge variant={getSeverityColor(report.severity)}>{report.severity}</Badge>
                            <Badge variant={getStatusColor(report.status)}>{report.status}</Badge>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">
                              <strong>{report.cases}</strong> cases reported
                            </span>
                          </div>
                          <div className="md:col-span-2">
                            <p className="text-sm text-muted-foreground">Symptoms:</p>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {report.symptoms.map((symptom) => (
                                <Badge key={symptom} variant="outline" className="text-xs">
                                  {symptom}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                        <Button size="sm">Take Action</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            {/* Water Quality Reports */}
            <TabsContent value="water" className="space-y-4">
              {waterReports.map((report) => (
                <Card key={report.id} className="animate-slide-up hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-semibold text-lg flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-muted-foreground" />
                              {report.village}, {report.state}
                            </h3>
                            <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                              <Calendar className="h-4 w-4" />
                              {report.date} • Tested by {report.reporter}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Badge variant={getSeverityColor(report.risk)}>{report.risk} risk</Badge>
                            <Badge variant={getStatusColor(report.status)}>{report.status}</Badge>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <div>
                            <p className="text-sm text-muted-foreground">Turbidity</p>
                            <p className="font-medium">{report.turbidity} NTU</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Contamination Level</p>
                            <p className="font-medium">{report.contamination}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Overall Risk</p>
                            <Badge variant={getSeverityColor(report.risk)}>{report.risk}</Badge>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                        <Button size="sm">Schedule Retest</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
          </Tabs>
        </div>
      </DashboardLayout>
    </AuthGuard>
  )
}
