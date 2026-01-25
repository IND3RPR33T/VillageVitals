"use client"

import { useState, useEffect } from "react"
import { RBACAuthGuard } from "@/components/rbac-auth-guard"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Activity, Droplets, Search, Filter, Download, Eye, Calendar, MapPin, Users, Loader2, Trash2 } from "lucide-react"
import {
  getHealthReportsForRole,
  getWaterQualityTestsForRole,
  deleteDocument,
  type HealthReport,
  type WaterQualityTest
} from "@/lib/firestore-service"
import { getCurrentUserRole } from "@/lib/role-service"
import { normalizeRole } from "@/lib/rbac/role-utils"

export default function ReportsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterState, setFilterState] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")
  const [loading, setLoading] = useState(true)
  const [healthReports, setHealthReports] = useState<HealthReport[]>([])
  const [waterReports, setWaterReports] = useState<WaterQualityTest[]>([])
  const [isAdmin, setIsAdmin] = useState(false)
  const [selectedReport, setSelectedReport] = useState<HealthReport | WaterQualityTest | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [selectedReportType, setSelectedReportType] = useState<'health' | 'water'>('health')

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
      
      const normalizedRole = normalizeRole(role)
      setIsAdmin(normalizedRole === 'ADMIN')
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

  const getSeverityColor = (severity: string): "destructive" | "default" | "secondary" => {
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

  const getStatusColor = (status: string): "destructive" | "default" | "secondary" => {
    switch (status) {
      case "active":
        return "destructive"
      case "under_review":
      case "under-review":
        return "default"
      case "resolved":
      case "completed":
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

  const viewDetails = (report: HealthReport | WaterQualityTest, type: 'health' | 'water') => {
    setSelectedReport(report)
    setSelectedReportType(type)
    setIsDetailOpen(true)
  }

  const formatDateDetailed = (timestamp: any) => {
    if (!timestamp) return 'N/A'
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
      return date.toLocaleString()
    } catch {
      return 'N/A'
    }
  }

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
    <RBACAuthGuard requiredModule="HEALTH_REPORTS">
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
              <Button variant="outline" onClick={() => exportData(filteredHealthReports, 'health_reports')}>
                <Download className="mr-2 h-4 w-4" />
                Export Health
              </Button>
              <Button variant="outline" onClick={() => exportData(filteredWaterReports, 'water_reports')}>
                <Download className="mr-2 h-4 w-4" />
                Export Water
              </Button>
            </div>
          </div>

          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search reports..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={filterState} onValueChange={setFilterState}>
                  <SelectTrigger className="w-[180px]">
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Filter by state" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All States</SelectItem>
                    <SelectItem value="maharashtra">Maharashtra</SelectItem>
                    <SelectItem value="karnataka">Karnataka</SelectItem>
                    <SelectItem value="gujarat">Gujarat</SelectItem>
                    <SelectItem value="rajasthan">Rajasthan</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="under_review">Under Review</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Reports */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <Tabs defaultValue="health" className="w-full">
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

              <TabsContent value="health" className="mt-6">
                <div className="grid gap-4">
                  {filteredHealthReports.length === 0 ? (
                    <Card>
                      <CardContent className="py-8 text-center text-muted-foreground">
                        No health reports found matching your criteria.
                      </CardContent>
                    </Card>
                  ) : (
                    filteredHealthReports.map((report) => (
                      <Card key={report.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="pt-6">
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="font-semibold">{report.villageName}</h3>
                                <Badge variant={getSeverityColor(report.severity || '')}>
                                  {report.severity}
                                </Badge>
                                <Badge variant={getStatusColor(report.status)}>
                                  {report.status}
                                </Badge>
                              </div>
                              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <MapPin className="h-4 w-4" />
                                  {report.state}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-4 w-4" />
                                  {formatDate(report.createdAt)}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Users className="h-4 w-4" />
                                  {report.reporterName}
                                </span>
                              </div>
                              <p className="text-sm mt-2">
                                <span className="font-medium">Symptoms:</span> {report.symptoms?.join(', ')}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm" onClick={() => viewDetails(report, 'health')}>
                                <Eye className="h-4 w-4 mr-1" />
                                View
                              </Button>
                              {isAdmin && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDelete('symptom_reports', report.id)}
                                  className="text-red-600 hover:text-red-700"
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
                </div>
              </TabsContent>

              <TabsContent value="water" className="mt-6">
                <div className="grid gap-4">
                  {filteredWaterReports.length === 0 ? (
                    <Card>
                      <CardContent className="py-8 text-center text-muted-foreground">
                        No water quality reports found matching your criteria.
                      </CardContent>
                    </Card>
                  ) : (
                    filteredWaterReports.map((report) => (
                      <Card key={report.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="pt-6">
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="font-semibold">{report.location}</h3>
                                <Badge variant={getStatusColor(report.status)}>
                                  {report.status}
                                </Badge>
                              </div>
                              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Droplets className="h-4 w-4" />
                                  {report.sourceType}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-4 w-4" />
                                  {formatDate(report.createdAt)}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Users className="h-4 w-4" />
                                  {report.testerName}
                                </span>
                              </div>
                              <div className="flex gap-4 text-sm mt-2">
                                <span><strong>pH:</strong> {report.pHLevel}</span>
                                <span><strong>Chlorine:</strong> {report.chlorineLevel} mg/L</span>
                                <span><strong>Bacteria:</strong> {report.bacteriaPresent ? 'Present' : 'Not Detected'}</span>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm" onClick={() => viewDetails(report, 'water')}>
                                <Eye className="h-4 w-4 mr-1" />
                                View
                              </Button>
                              {isAdmin && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDelete('water_quality_tests', report.id)}
                                  className="text-red-600 hover:text-red-700"
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
                </div>
              </TabsContent>
            </Tabs>
          )}
        </div>

        {/* Detail View Dialog */}
        <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {selectedReportType === 'health' ? 'Health Report Details' : 'Water Quality Test Details'}
              </DialogTitle>
            </DialogHeader>
            
            {selectedReport && selectedReportType === 'health' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold text-sm text-muted-foreground">BASIC INFORMATION</h3>
                    <div className="mt-2 space-y-2">
                      <p><span className="font-medium">Village:</span> {(selectedReport as HealthReport).villageName}</p>
                      <p><span className="font-medium">State:</span> {(selectedReport as HealthReport).state}</p>
                      <p><span className="font-medium">Reporter:</span> {(selectedReport as HealthReport).reporterName}</p>
                      <p><span className="font-medium">Email:</span> {(selectedReport as HealthReport).reporterEmail}</p>
                      <p><span className="font-medium">Phone:</span> {(selectedReport as HealthReport).reporterPhone}</p>
                      <p><span className="font-medium">Date Reported:</span> {formatDateDetailed((selectedReport as HealthReport).createdAt)}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-sm text-muted-foreground">SYMPTOMS & SEVERITY</h3>
                    <div className="mt-2 space-y-2">
                      <p><span className="font-medium">Symptoms:</span> {(selectedReport as HealthReport).symptoms?.join(', ')}</p>
                      <p>
                        <span className="font-medium">Severity:</span>
                        <Badge variant={getSeverityColor((selectedReport as HealthReport).severity || '')} className="ml-2">
                          {(selectedReport as HealthReport).severity}
                        </Badge>
                      </p>
                      <p>
                        <span className="font-medium">Status:</span>
                        <Badge variant={getStatusColor((selectedReport as HealthReport).status)} className="ml-2">
                          {(selectedReport as HealthReport).status}
                        </Badge>
                      </p>
                    </div>
                  </div>
                </div>
                
                {(selectedReport as HealthReport).additionalInfo && (
                  <div>
                    <h3 className="font-semibold text-sm text-muted-foreground">ADDITIONAL INFORMATION</h3>
                    <p className="mt-2 p-3 bg-gray-50 rounded-md text-sm">{(selectedReport as HealthReport).additionalInfo}</p>
                  </div>
                )}

                {(selectedReport as HealthReport).location && (
                  <div>
                    <h3 className="font-semibold text-sm text-muted-foreground">LOCATION</h3>
                    <div className="mt-2 space-y-1">
                      <p><span className="font-medium">Coordinates:</span> {(selectedReport as HealthReport).location.latitude}, {(selectedReport as HealthReport).location.longitude}</p>
                      <p><span className="font-medium">Address:</span> {(selectedReport as HealthReport).location.address}</p>
                    </div>
                  </div>
                )}
                
                {(selectedReport as HealthReport).voiceNote && (
                  <div>
                    <h3 className="font-semibold text-sm text-muted-foreground">VOICE NOTE</h3>
                    <audio controls className="mt-2 w-full">
                      <source src={(selectedReport as HealthReport).voiceNote} type="audio/wav" />
                      Your browser does not support audio playback.
                    </audio>
                  </div>
                )}

                {/* Display images from either 'images' or 'attachments' field */}
                {(() => {
                  const report = selectedReport as HealthReport & { attachments?: string[] };
                  const imageUrls = report.images?.length ? report.images : report.attachments || [];
                  return imageUrls.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-sm text-muted-foreground">IMAGES</h3>
                      <div className="mt-2 grid grid-cols-2 md:grid-cols-3 gap-2">
                        {imageUrls.map((imageUrl, index) => (
                          <img
                            key={index}
                            src={imageUrl}
                            alt={`Report image ${index + 1}`}
                            className="w-full h-24 object-cover rounded border cursor-pointer hover:opacity-80"
                            onClick={() => window.open(imageUrl, '_blank')}
                          />
                        ))}
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
            
            {selectedReport && selectedReportType === 'water' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold text-sm text-muted-foreground">TEST INFORMATION</h3>
                    <div className="mt-2 space-y-2">
                      <p><span className="font-medium">Location:</span> {(selectedReport as WaterQualityTest).location}</p>
                      <p><span className="font-medium">Source Type:</span> {(selectedReport as WaterQualityTest).sourceType}</p>
                      <p><span className="font-medium">Tester:</span> {(selectedReport as WaterQualityTest).testerName}</p>
                      <p><span className="font-medium">Date Tested:</span> {formatDateDetailed((selectedReport as WaterQualityTest).createdAt)}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-sm text-muted-foreground">RESULTS</h3>
                    <div className="mt-2 space-y-2">
                      <p><span className="font-medium">pH Level:</span> {(selectedReport as WaterQualityTest).pHLevel}</p>
                      <p><span className="font-medium">Chlorine:</span> {(selectedReport as WaterQualityTest).chlorineLevel} mg/L</p>
                      <p><span className="font-medium">Bacteria:</span> {(selectedReport as WaterQualityTest).bacteriaPresent ? 'Present' : 'Not Detected'}</p>
                      <p>
                        <span className="font-medium">Status:</span>
                        <Badge variant={getStatusColor((selectedReport as WaterQualityTest).status)} className="ml-2">
                          {(selectedReport as WaterQualityTest).status}
                        </Badge>
                      </p>
                    </div>
                  </div>
                </div>
                
                {(selectedReport as WaterQualityTest).notes && (
                  <div>
                    <h3 className="font-semibold text-sm text-muted-foreground">NOTES</h3>
                    <p className="mt-2 p-3 bg-gray-50 rounded-md text-sm">{(selectedReport as WaterQualityTest).notes}</p>
                  </div>
                )}

                {(selectedReport as WaterQualityTest).images && (
                  <div>
                    <h3 className="font-semibold text-sm text-muted-foreground">IMAGES</h3>
                    <div className="mt-2 grid grid-cols-2 md:grid-cols-3 gap-2">
                      {(selectedReport as WaterQualityTest).images!.map((imageUrl, index) => (
                        <img
                          key={index}
                          src={imageUrl}
                          alt={`Test image ${index + 1}`}
                          className="w-full h-24 object-cover rounded border cursor-pointer hover:opacity-80"
                          onClick={() => window.open(imageUrl, '_blank')}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDetailOpen(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </DashboardLayout>
    </RBACAuthGuard>
  )
}
