"use client"

import { useState, useEffect } from "react"
import { AuthGuard } from "@/components/auth-guard"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Activity, Droplets, Search, Filter, Download, Eye, Calendar, MapPin, Users, Loader2, Trash2 } from "lucide-react"
import Link from "next/link"
import {
  getHealthReportsForRole,
  getWaterQualityTestsForRole,
  deleteDocument,
  type HealthReport,
  type WaterQualityTest
} from "@/lib/firestore-service"
import { getCurrentUserRole } from "@/lib/role-service"

export default function ReportsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterState, setFilterState] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")
  const [loading, setLoading] = useState(true)
  const [healthReports, setHealthReports] = useState<HealthReport[]>([])
  const [waterReports, setWaterReports] = useState<WaterQualityTest[]>([])
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [health, water, role] = await Promise.all([
        getHealthReportsForRole(100),
        getWaterQualityTestsForRole(100),
        getCurrentUserRole()
      ])
      setHealthReports(health)
      setWaterReports(water)
      setIsAdmin(role === 'admin')
    } catch (error) {
      console.error("Error loading data:", error)
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

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
      case "critical":
        return "destructive"
      case "moderate":
      case "medium":
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
      case "under_review":
      case "under-review":
        return "default"
      case "resolved":
      case "completed":
        return "secondary"
      case "safe":
        return "secondary"
      case "monitoring":
      case "pending":
        return "default"
      default:
        return "secondary"
    }
  }

  const handleDelete = async (collection: string, id: string) => {
    if (!confirm("Are you sure you want to delete this report?")) return
    const success = await deleteDocument(collection, id)
    if (success) loadData()
  }

  // Export to CSV
  const exportData = (data: any[], filename: string) => {
    if (data.length === 0) return
    const headers = Object.keys(data[0]).filter(k => k !== 'id')
    const csvRows = [headers.join(',')]
    data.forEach(item => {
      const values = headers.map(h => {
        const val = item[h]
        if (Array.isArray(val)) return `"${val.join('; ')}"`
        if (typeof val === 'object' && val?.toDate) return `"${val.toDate().toISOString()}"`
        return `"${String(val || '')}"`
      })
      csvRows.push(values.join(','))
    })
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }

  // Filter reports based on search
  const filteredHealthReports = healthReports.filter(r => {
    const matchesSearch = searchTerm === "" ||
      r.villageName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.symptoms?.some(s => s.toLowerCase().includes(searchTerm.toLowerCase())) ||
      r.reporterName?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesState = filterState === "all" || r.state?.toLowerCase() === filterState.toLowerCase()
    const matchesStatus = filterStatus === "all" || r.status === filterStatus
    return matchesSearch && matchesState && matchesStatus
  })

  const filteredWaterReports = waterReports.filter(r => {
    const matchesSearch = searchTerm === "" ||
      r.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.testerName?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === "all" || r.status === filterStatus
    return matchesSearch && matchesStatus
  })

  return (
    <AuthGuard>
      <DashboardLayout>
        <div className="space-y-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="animate-fade-in">
              <h1 className="text-3xl font-bold">Reports & Data</h1>
              <p className="text-muted-foreground mt-2">
                {isAdmin ? "View and manage all health and water quality reports" : "View your submitted reports"}
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => exportData([...healthReports, ...waterReports], 'all_reports')}>
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
                    <SelectItem value="under_review">Under Review</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <Tabs defaultValue="health" className="space-y-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="health" className="flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  Health Reports ({filteredHealthReports.length})
                </TabsTrigger>
                <TabsTrigger value="water" className="flex items-center gap-2">
                  <Droplets className="h-4 w-4" />
                  Water Quality ({filteredWaterReports.length})
                </TabsTrigger>
              </TabsList>

              {/* Health Reports */}
              <TabsContent value="health" className="space-y-4">
                {filteredHealthReports.length === 0 ? (
                  <Card>
                    <CardContent className="py-12 text-center text-muted-foreground">
                      No health reports found. {!isAdmin && "Submit a new report to see it here."}
                    </CardContent>
                  </Card>
                ) : (
                  filteredHealthReports.map((report) => (
                    <Card key={report.id} className="animate-slide-up hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <h3 className="font-semibold text-lg flex items-center gap-2">
                                  <MapPin className="h-4 w-4 text-muted-foreground" />
                                  {report.villageName}, {report.state}
                                </h3>
                                <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                                  <Calendar className="h-4 w-4" />
                                  {formatDate(report.createdAt)} • Reported by {report.reporterName}
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
                                  <strong>{report.numberOfCases}</strong> cases reported
                                </span>
                              </div>
                              <div className="md:col-span-2">
                                <p className="text-sm text-muted-foreground">Symptoms:</p>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {report.symptoms?.map((symptom) => (
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
                            {isAdmin && (
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDelete('health_reports', report.id!)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </TabsContent>

              {/* Water Quality Reports */}
              <TabsContent value="water" className="space-y-4">
                {filteredWaterReports.length === 0 ? (
                  <Card>
                    <CardContent className="py-12 text-center text-muted-foreground">
                      No water quality tests found. {!isAdmin && "Submit a new test to see it here."}
                    </CardContent>
                  </Card>
                ) : (
                  filteredWaterReports.map((report) => (
                    <Card key={report.id} className="animate-slide-up hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <h3 className="font-semibold text-lg flex items-center gap-2">
                                  <MapPin className="h-4 w-4 text-muted-foreground" />
                                  {report.location}
                                </h3>
                                <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                                  <Calendar className="h-4 w-4" />
                                  {formatDate(report.createdAt)} • Tested by {report.testerName}
                                </p>
                              </div>
                              <div className="flex gap-2">
                                <Badge variant={getSeverityColor(report.riskAssessment?.level || 'low')}>
                                  {report.riskAssessment?.level || 'N/A'} risk
                                </Badge>
                                <Badge variant={getStatusColor(report.status)}>{report.status}</Badge>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                              <div>
                                <p className="text-sm text-muted-foreground">Source Type</p>
                                <p className="font-medium">{report.sourceType}</p>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">Turbidity</p>
                                <p className="font-medium">{report.measurements?.turbidity || 'N/A'} NTU</p>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">Coliform</p>
                                <p className="font-medium">{report.measurements?.coliform || 'N/A'}</p>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">Risk Level</p>
                                <Badge variant={getSeverityColor(report.riskAssessment?.level || 'low')}>
                                  {report.riskAssessment?.level || 'N/A'}
                                </Badge>
                              </div>
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </Button>
                            {isAdmin && (
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDelete('water_quality_tests', report.id!)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </TabsContent>
            </Tabs>
          )}
        </div>
      </DashboardLayout>
    </AuthGuard>
  )
}
