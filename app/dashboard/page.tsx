"use client"

import { useEffect, useState } from "react"
import { RBACAuthGuard } from "@/components/rbac-auth-guard"
import { DashboardLayout } from "@/components/dashboard-layout"
import { RoleRestricted, AdminOnly, HealthOfficialOnly, FieldWorkerPlus } from "@/components/role-restricted"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Activity, Droplets, AlertTriangle, Users, MapPin, BookOpen, Plus, Eye, Loader2 } from "lucide-react"
import Link from "next/link"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import {
  getHealthReportsForRole,
  getWaterQualityTestsForRole,
  getAlertsForRole,
  getSymptomReportsForRole,
  type HealthReport,
  type WaterQualityTest,
  type Alert
} from "@/lib/firestore-service"
import { getCurrentUserRole } from "@/lib/role-service"
import { normalizeRole } from "@/lib/rbac/role-utils"
import { initializeDataIfEmpty } from "@/lib/init-data"

export default function DashboardPage() {
  const [loading, setLoading] = useState(true)
  const [healthReports, setHealthReports] = useState<HealthReport[]>([])
  const [waterTests, setWaterTests] = useState<WaterQualityTest[]>([])
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [symptomReports, setSymptomReports] = useState<any[]>([])
  const [isAdmin, setIsAdmin] = useState(false)

  // Computed data for charts
  const [healthTrendsData, setHealthTrendsData] = useState<any[]>([])
  const [waterQualityData, setWaterQualityData] = useState<any[]>([])

  useEffect(() => {
    const initializeAndLoadData = async () => {
      try {
        // Initialize sample data if database is empty
        await initializeDataIfEmpty()
        // Load data
        await loadData()
      } catch (error) {
        console.error('Error during initialization:', error)
        await loadData() // Try to load data even if initialization fails
      }
    }
    
    initializeAndLoadData()
  }, [])

  const loadData = async () => {
    try {
      console.log('🔄 Loading dashboard data...');
      
      const [healthData, waterData, alertsData, symptomData, role] = await Promise.all([
        getHealthReportsForRole(20),
        getWaterQualityTestsForRole(20),
        getAlertsForRole(10),
        getSymptomReportsForRole(20),
        getCurrentUserRole(),
      ])

      console.log('📊 Data loaded:', {
        healthReports: healthData.length,
        waterTests: waterData.length,
        alerts: alertsData.length,
        symptomReports: symptomData.length,
        userRole: role
      });

      setHealthReports(healthData)
      setWaterTests(waterData)
      setAlerts(alertsData)
      setSymptomReports(symptomData)
      
      // Normalize role for admin check
      const normalizedRole = normalizeRole(role)
      setIsAdmin(normalizedRole === 'ADMIN')

      // Calculate water quality distribution from REAL data only
      const total = waterData.length
      if (total > 0) {
        const safe = waterData.filter(w => w.riskAssessment?.level === 'low').length
        const moderate = waterData.filter(w => w.riskAssessment?.level === 'moderate').length
        const high = waterData.filter(w => w.riskAssessment?.level === 'high').length

        setWaterQualityData([
          { name: "Safe", value: Math.round((safe / total) * 100), color: "#10b981" },
          { name: "Moderate Risk", value: Math.round((moderate / total) * 100), color: "#f59e0b" },
          { name: "High Risk", value: Math.round((high / total) * 100), color: "#ef4444" },
        ])
      } else {
        // No water data - show empty chart message
        setWaterQualityData([])
      }

      // Generate health trends from REAL reports only
      if (healthData.length > 0 || symptomData.length > 0) {
        // Group by month from actual createdAt timestamps
        const monthCounts: Record<string, { cases: number; recovered: number }> = {}
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

        healthData.forEach(r => {
          try {
            const date = r.createdAt?.toDate ? r.createdAt.toDate() : (r.createdAt ? new Date(r.createdAt as any) : new Date())
            const monthKey = monthNames[date.getMonth()]
            if (!monthCounts[monthKey]) monthCounts[monthKey] = { cases: 0, recovered: 0 }
            monthCounts[monthKey].cases += 1
            if (r.status === 'resolved') monthCounts[monthKey].recovered += 1
          } catch { }
        })

        const trendsData = Object.entries(monthCounts).map(([month, data]) => ({
          month,
          cases: data.cases,
          recovered: data.recovered,
        }))

        setHealthTrendsData(trendsData.length > 0 ? trendsData : [])
      } else {
        setHealthTrendsData([])
      }

    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Format date from Firestore timestamp
  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A'
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
      return date.toLocaleDateString()
    } catch {
      return 'N/A'
    }
  }

  // Combine health reports and water tests for recent activity
  const recentReports = [
    ...healthReports.slice(0, 3).map(r => ({
      id: r.id,
      type: "Health Report" as const,
      village: r.villageName || 'Unknown Village',
      cases: r.numberOfCases,
      symptoms: r.symptoms?.slice(0, 2).join(', ') || 'Unknown',
      date: formatDate(r.createdAt),
      severity: r.severity || 'low',
    })),
    ...waterTests.slice(0, 2).map(t => ({
      id: t.id,
      type: "Water Quality" as const,
      village: t.location || 'Unknown Location',
      turbidity: t.measurements?.turbidity || 0,
      risk: t.riskAssessment?.level || 'low',
      date: formatDate(t.createdAt),
    })),
  ].slice(0, 5)

  // Total counts
  const totalReports = healthReports.length + symptomReports.length
  const totalWaterTests = waterTests.length
  const activeAlerts = alerts.filter(a => a.isActive).length
  const highPriorityAlerts = alerts.filter(a => a.severity === 'critical' || a.severity === 'emergency').length

  if (loading) {
    return (
      <RBACAuthGuard requiredModule="DASHBOARD">
        <DashboardLayout>
          <div className="flex items-center justify-center min-h-[60vh]">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </DashboardLayout>
      </RBACAuthGuard>
    )
  }

  return (
    <RBACAuthGuard requiredModule="DASHBOARD">
      <DashboardLayout>
        <div className="space-y-8">
          {/* Welcome Section */}
          <div className="animate-fade-in">
            <h1 className="text-3xl font-bold text-balance">Welcome to VillageVitals</h1>
            <p className="text-muted-foreground mt-2">
              Monitor community health and water quality across rural villages
            </p>
          </div>

          {/* Admin Data Initialization - Only show if no data */}
          <AdminOnly showBlurred={false}>
            {(totalReports === 0 && totalWaterTests === 0) && (
              <Card className="animate-slide-up border-yellow-200 bg-yellow-50">
                <CardHeader>
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    No Data Found
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-yellow-700 mb-4">
                    It looks like there&apos;s no data in the system. Would you like to initialize with sample data?
                  </p>
                  <Button 
                    onClick={async () => {
                      try {
                        const response = await fetch('/api/init-db', { method: 'POST' })
                        const result = await response.json()
                        if (result.success) {
                          console.log('✅ Data initialized!')
                          await loadData() // Reload dashboard data
                        }
                      } catch (error) {
                        console.error('❌ Failed to initialize data:', error)
                      }
                    }}
                    size="sm"
                    className="bg-yellow-600 hover:bg-yellow-700"
                  >
                    Initialize Sample Data
                  </Button>
                </CardContent>
              </Card>
            )}
          </AdminOnly>

          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="animate-slide-up">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalReports}</div>
                <p className="text-xs text-muted-foreground">
                  Health & symptom reports
                </p>
              </CardContent>
            </Card>

            <Card className="animate-slide-up">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Water Tests</CardTitle>
                <Droplets className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalWaterTests}</div>
                <p className="text-xs text-muted-foreground">
                  Water quality tests recorded
                </p>
              </CardContent>
            </Card>

            <Card className="animate-slide-up">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{activeAlerts}</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-red-600">{highPriorityAlerts} high priority</span>
                </p>
              </CardContent>
            </Card>

            <Card className="animate-slide-up">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Flutter Reports</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{symptomReports.length}</div>
                <p className="text-xs text-muted-foreground">
                  From mobile app
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card className="animate-slide-up">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common tasks and shortcuts for health monitoring</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* Health Report - Field Workers and above */}
                <FieldWorkerPlus>
                  <Button asChild className="h-auto p-4 flex flex-col gap-2">
                    <Link href="/health-report">
                      <Plus className="h-6 w-6" />
                      <span className="text-sm">Submit Report</span>
                    </Link>
                  </Button>
                </FieldWorkerPlus>
                
                {/* Water Quality - Field Workers and above */}
                <FieldWorkerPlus>
                  <Button asChild variant="outline" className="h-auto p-4 flex flex-col gap-2 bg-transparent">
                    <Link href="/water-quality">
                      <Droplets className="h-6 w-6" />
                      <span className="text-sm">Water Quality</span>
                    </Link>
                  </Button>
                </FieldWorkerPlus>
                
                {/* Health Map - Available to all */}
                <Button asChild variant="outline" className="h-auto p-4 flex flex-col gap-2 bg-transparent">
                  <Link href="/health-map">
                    <MapPin className="h-6 w-6" />
                    <span className="text-sm">Health Map</span>
                  </Link>
                </Button>
                
                {/* Education - Available to all */}
                <Button asChild variant="outline" className="h-auto p-4 flex flex-col gap-2 bg-transparent">
                  <Link href="/education">
                    <BookOpen className="h-6 w-6" />
                    <span className="text-sm">Education</span>
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Health Trends Chart - Health Officials and above with detailed data */}
            <HealthOfficialOnly>
              <Card className="animate-slide-up">
                <CardHeader>
                  <CardTitle>Health Trends (Detailed)</CardTitle>
                  <CardDescription>Monthly health cases and recovery rates - Full analytics</CardDescription>
                </CardHeader>
                <CardContent>
                  {healthTrendsData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={healthTrendsData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="cases" fill="hsl(var(--chart-1))" name="Cases" />
                        <Bar dataKey="recovered" fill="hsl(var(--chart-2))" name="Recovered" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                      <div className="text-center">
                        <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p>No health trend data available</p>
                        <p className="text-sm">Start submitting health reports to see trends</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </HealthOfficialOnly>

            {/* Water Quality Distribution - Field Workers and above */}
            <FieldWorkerPlus>
              <Card className="animate-slide-up">
                <CardHeader>
                  <CardTitle>Water Quality Distribution</CardTitle>
                  <CardDescription>Current status of water sources</CardDescription>
                </CardHeader>
                <CardContent>
                  {waterQualityData.length > 0 ? (
                    <>
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={waterQualityData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={100}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {waterQualityData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="flex justify-center gap-4 mt-4">
                        {waterQualityData.map((item, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                            <span className="text-sm">
                              {item.name}: {item.value}%
                            </span>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                      <div className="text-center">
                        <Droplets className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p>No water quality data available</p>
                        <p className="text-sm">Conduct water quality tests to see distribution</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </FieldWorkerPlus>
          </div>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Reports */}
            <Card className="animate-slide-up">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Recent Reports</CardTitle>
                  <CardDescription>Latest health and water quality submissions</CardDescription>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/reports">
                    <Eye className="h-4 w-4 mr-2" />
                    View All
                  </Link>
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentReports.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">No reports yet. Submit your first report!</p>
                  ) : (
                    recentReports.map((report) => (
                      <div key={report.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                            {report.type === "Health Report" ? (
                              <Activity className="h-5 w-5 text-primary" />
                            ) : (
                              <Droplets className="h-5 w-5 text-primary" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium">{report.village}</p>
                            <p className="text-sm text-muted-foreground">
                              {report.type === "Health Report"
                                ? `${report.cases} cases - ${report.symptoms}`
                                : `Turbidity: ${report.turbidity} NTU`}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge
                            variant={
                              report.type === "Health Report"
                                ? ((report.severity as string) === "high" || (report.severity as string) === "critical")
                                  ? "destructive"
                                  : ((report.severity as string) === "moderate" || (report.severity as string) === "medium")
                                    ? "default"
                                    : "secondary"
                                : (report as any).risk === "high"
                                  ? "destructive"
                                  : (report as any).risk === "moderate" || (report as any).risk === "medium"
                                    ? "default"
                                    : "secondary"
                            }
                          >
                            {report.type === "Health Report" ? report.severity : report.risk}
                          </Badge>
                          <p className="text-xs text-muted-foreground mt-1">{report.date}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Active Alerts */}
            <Card className="animate-slide-up">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Active Alerts</CardTitle>
                  <CardDescription>Current health and safety alerts</CardDescription>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/alerts">
                    <Eye className="h-4 w-4 mr-2" />
                    Manage
                  </Link>
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {alerts.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">No active alerts</p>
                  ) : (
                    alerts.slice(0, 3).map((alert) => (
                      <div key={alert.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-10 h-10 rounded-lg flex items-center justify-center ${alert.severity === "critical" || alert.severity === "emergency" ? "bg-red-100" : "bg-yellow-100"
                              }`}
                          >
                            <AlertTriangle
                              className={`h-5 w-5 ${alert.severity === "critical" || alert.severity === "emergency" ? "text-red-600" : "text-yellow-600"}`}
                            />
                          </div>
                          <div>
                            <p className="font-medium">{alert.title}</p>
                            <p className="text-sm text-muted-foreground">{alert.location || 'General'}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant={alert.severity === "critical" || alert.severity === "emergency" ? "destructive" : "default"}>{alert.severity}</Badge>
                          <p className="text-xs text-muted-foreground mt-1">{formatDate(alert.createdAt)}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </DashboardLayout>
    </RBACAuthGuard>
  )
}
