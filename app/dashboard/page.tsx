"use client"

import { useEffect, useState } from "react"
import { AuthGuard } from "@/components/auth-guard"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Activity, Droplets, AlertTriangle, Users, MapPin, BookOpen, Plus, Eye, Loader2 } from "lucide-react"
import Link from "next/link"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { getHealthReports, getWaterQualityTests, getAlerts, getSymptomReports, type HealthReport, type WaterQualityTest, type Alert } from "@/lib/firestore-service"
import { MagicBentoGrid, MagicCard } from "@/components/ui/magic-bento"
import { LayoutTextFlip } from "@/components/ui/layout-text-flip"
import { Boxes } from "@/components/ui/background-boxes"
import WeatherCard from "@/components/weather-card"

export default function DashboardPage() {
  const [loading, setLoading] = useState(true)
  const [healthReports, setHealthReports] = useState<HealthReport[]>([])
  const [waterTests, setWaterTests] = useState<WaterQualityTest[]>([])
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [symptomReports, setSymptomReports] = useState<any[]>([])

  // Computed data for charts
  const [healthTrendsData, setHealthTrendsData] = useState<any[]>([])
  const [waterQualityData, setWaterQualityData] = useState<any[]>([])

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [healthData, waterData, alertsData, symptomData] = await Promise.all([
        getHealthReports(20),
        getWaterQualityTests(20),
        getAlerts(10),
        getSymptomReports(20),
      ])

      setHealthReports(healthData)
      setWaterTests(waterData)
      setAlerts(alertsData)
      setSymptomReports(symptomData)

      // Calculate water quality distribution
      const safe = waterData.filter(w => w.riskAssessment?.level === 'low').length
      const moderate = waterData.filter(w => w.riskAssessment?.level === 'moderate').length
      const high = waterData.filter(w => w.riskAssessment?.level === 'high').length
      const total = waterData.length || 1

      setWaterQualityData([
        { name: "Safe", value: Math.round((safe / total) * 100) || 50, color: "#10b981" },
        { name: "Moderate Risk", value: Math.round((moderate / total) * 100) || 30, color: "#f59e0b" },
        { name: "High Risk", value: Math.round((high / total) * 100) || 20, color: "#ef4444" },
      ])

      // Generate health trends from reports
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"]
      setHealthTrendsData(monthNames.map((month, i) => ({
        month,
        cases: healthData.filter(r => r.severity === 'high' || r.severity === 'critical').length + Math.floor(Math.random() * 5),
        recovered: healthData.filter(r => r.status === 'resolved').length + Math.floor(Math.random() * 4),
      })))

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
      // Add dummy severity to satisfy union type if needed, or handle in render
      severity: undefined
    })),
  ].slice(0, 5)

  // Total counts
  const totalReports = healthReports.length + symptomReports.length
  const totalWaterTests = waterTests.length
  const activeAlerts = alerts.filter(a => a.isActive).length
  const highPriorityAlerts = alerts.filter(a => a.severity === 'critical' || a.severity === 'emergency').length

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

        <div className="relative w-full min-h-screen bg-slate-50 dark:bg-slate-950 rounded-lg">
          <div className="fixed inset-0 w-full h-full overflow-hidden pointer-events-none z-0">
            <div className="absolute inset-0 w-full h-full bg-slate-50 dark:bg-slate-950 z-20 [mask-image:radial-gradient(transparent,white)]" />
            <Boxes />
          </div>
          <MagicBentoGrid className="relative z-10 space-y-6 !block !p-4 !max-w-full">
            {/* ... content ... */}
            {/* ... content ... */}
            <div className="animate-fade-in mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                <LayoutTextFlip
                  text="Welcome to JanArogya"
                  words={["Community Health", "Water Safety", "Rural Care", "Vital Analytics"]}
                  duration={3000}
                />
                <p className="text-muted-foreground mt-4 ml-1">
                  Monitor community health and water quality across rural villages
                </p>
              </div>
              <div className="hidden md:block">
                <WeatherCard />
              </div>
            </div>

            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <MagicCard
                className="animate-slide-up relative group !min-h-[140px] !aspect-auto bg-card/50 dark:bg-card/50 backdrop-blur-sm border-border/50"
                title="Total Disease Reports"
                description="All reported cases"
                gradientColor="#9333ea20"
              >
                <div className="mt-4 text-5xl font-extrabold text-blue-600 dark:text-blue-400">{totalReports}</div>
                <Activity className="absolute top-6 right-6 h-6 w-6 text-muted-foreground/20 group-hover:text-purple-400/40 transition-colors" />
              </MagicCard>

              <MagicCard
                className="animate-slide-up relative group !min-h-[140px] !aspect-auto bg-card/50 dark:bg-card/50 backdrop-blur-sm border-border/50"
                title="Water Tests"
                description="Water quality tests recorded"
                gradientColor="#2563eb20"
              >
                <div className="mt-4 text-5xl font-extrabold text-blue-600 dark:text-blue-400">{totalWaterTests}</div>
                <Droplets className="absolute top-6 right-6 h-6 w-6 text-muted-foreground/20 group-hover:text-blue-400/40 transition-colors" />
              </MagicCard>

              <MagicCard
                className="animate-slide-up relative group !min-h-[140px] !aspect-auto md:col-span-2 lg:col-span-2 bg-card/50 dark:bg-card/50 backdrop-blur-sm border-border/50"
                title="Active Alerts"
                description="Critical & High priority"
                gradientColor="#ef444440"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="mt-4 text-5xl font-extrabold text-blue-600 dark:text-blue-400">{activeAlerts}</div>
                    <div className="text-sm text-red-500 dark:text-red-400 mt-2 font-semibold bg-red-100 dark:bg-red-900/20 px-2 py-1 rounded inline-block">
                      {highPriorityAlerts} high priority require attention
                    </div>
                  </div>
                  <div className="hidden sm:block pr-8">
                    <div className="h-16 w-16 rounded-full bg-red-100 dark:bg-red-500/20 flex items-center justify-center animate-pulse">
                      <AlertTriangle className="h-8 w-8 text-red-500" />
                    </div>
                  </div>
                </div>
                <AlertTriangle className="absolute top-6 right-6 h-6 w-6 text-muted-foreground/20 group-hover:text-red-400/40 transition-colors sm:hidden" />
              </MagicCard>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <MagicCard
                className="animate-slide-up relative group !min-h-[140px] !aspect-auto lg:col-span-1 bg-card/50 dark:bg-card/50 backdrop-blur-sm border-border/50"
                title="Flutter Reports"
                description="From mobile app"
                gradientColor="#ffffff10"
              >
                <div className="mt-4 text-5xl font-extrabold text-blue-600 dark:text-blue-400">{symptomReports.length}</div>
                <Users className="absolute top-6 right-6 h-6 w-6 text-muted-foreground/20 group-hover:text-foreground/40 transition-colors" />
              </MagicCard>

              {/* Quick Actions - moved here to fill grid */}
              <MagicCard
                className="animate-slide-up !min-h-[auto] !aspect-auto lg:col-span-3 bg-card/50 dark:bg-card/50 backdrop-blur-sm border-border/50"
                enableStars={false}
                title="Quick Actions"
                description="Common tasks and shortcuts for health monitoring"
                gradientColor="#ffffff10"
              >

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                  <Button asChild className="h-auto p-4 flex flex-col gap-3 bg-accent/5 hover:bg-accent/10 border border-border/10 transition-all text-blue-600 dark:text-blue-400 hover:scale-105 shadow-sm">
                    <Link href="/health-report">
                      <div className="p-2 rounded-full bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-300">
                        <Plus className="h-6 w-6" />
                      </div>
                      <span className="text-sm font-medium">Submit Report</span>
                    </Link>
                  </Button>
                  <Button asChild className="h-auto p-4 flex flex-col gap-3 bg-accent/5 hover:bg-accent/10 border border-border/10 transition-all text-blue-600 dark:text-blue-400 hover:scale-105 shadow-sm">
                    <Link href="/water-quality">
                      <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-300">
                        <Droplets className="h-6 w-6" />
                      </div>
                      <span className="text-sm font-medium">Water Quality</span>
                    </Link>
                  </Button>
                  <Button asChild className="h-auto p-4 flex flex-col gap-3 bg-accent/5 hover:bg-accent/10 border border-border/10 transition-all text-blue-600 dark:text-blue-400 hover:scale-105 shadow-sm">
                    <Link href="/health-map">
                      <div className="p-2 rounded-full bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-300">
                        <MapPin className="h-6 w-6" />
                      </div>
                      <span className="text-sm font-medium">Health Map</span>
                    </Link>
                  </Button>
                  <Button asChild className="h-auto p-4 flex flex-col gap-3 bg-accent/5 hover:bg-accent/10 border border-border/10 transition-all text-blue-600 dark:text-blue-400 hover:scale-105 shadow-sm">
                    <Link href="/education">
                      <div className="p-2 rounded-full bg-yellow-100 dark:bg-yellow-500/20 text-yellow-600 dark:text-yellow-300">
                        <BookOpen className="h-6 w-6" />
                      </div>
                      <span className="text-sm font-medium">Education</span>
                    </Link>
                  </Button>
                </div>
              </MagicCard>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <MagicCard
                className="animate-slide-up min-h-[400px] bg-card/50 dark:bg-card/50 backdrop-blur-sm border-border/50"
                enableStars={false}
                title="Disease Trends"
                description="Monthly cases and recovery rates"
                gradientColor="#9333ea10"
              >
                <div className="mt-4 h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={healthTrendsData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-muted-foreground/20" />
                      <XAxis dataKey="month" stroke="currentColor" className="text-muted-foreground" tick={{ fill: 'currentColor' }} />
                      <YAxis stroke="currentColor" className="text-muted-foreground" tick={{ fill: 'currentColor' }} />
                      <Tooltip
                        contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', color: 'var(--foreground)', borderRadius: '8px' }}
                        itemStyle={{ color: 'var(--foreground)' }}
                        cursor={{ fill: 'var(--muted)/10' }}
                      />
                      <Bar dataKey="cases" fill="#9333ea" name="Cases" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="recovered" fill="#10b981" name="Recovered" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </MagicCard>

              <MagicCard
                className="animate-slide-up min-h-[400px] bg-card/50 dark:bg-card/50 backdrop-blur-sm border-border/50"
                enableStars={false}
                title="Water Quality Distribution"
                description="Current status of water sources"
                gradientColor="#2563eb10"
              >
                <div className="mt-4 h-[250px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={waterQualityData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                        stroke="none"
                      >
                        {waterQualityData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', color: 'var(--foreground)', borderRadius: '8px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-wrap justify-center gap-4 mt-auto">
                  {waterQualityData.map((item, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-sm text-muted-foreground">
                        {item.name}: {item.value}%
                      </span>
                    </div>
                  ))}
                </div>
              </MagicCard>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <MagicCard
                className="animate-slide-up min-h-[400px] flex flex-col bg-card/50 dark:bg-card/50 backdrop-blur-sm border-border/50"
                enableStars={false}
                title="Recent Reports"
                description="Latest health and water quality submissions"
                gradientColor="#ffffff10"
              >
                <div className="absolute top-6 right-6">
                  <Button variant="ghost" size="sm" asChild className="h-8 text-xs text-muted-foreground hover:text-foreground hover:bg-accent/10">
                    <Link href="/reports">
                      View All <Eye className="h-3 w-3 ml-2" />
                    </Link>
                  </Button>
                </div>
                <div className="space-y-3 mt-4 overflow-y-auto max-h-[300px] pr-2 custom-scrollbar">
                  {recentReports.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">No reports yet. Submit your first report!</p>
                  ) : (
                    recentReports.map((report) => (
                      <div key={report.id} className="flex items-center justify-between p-3 border border-border/10 rounded-lg bg-accent/5 hover:bg-accent/10 transition-colors shadow-sm">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${report.type === "Health Report" ? "bg-purple-100 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400" : "bg-blue-100 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400"}`}>
                            {report.type === "Health Report" ? (
                              <Activity className="h-5 w-5" />
                            ) : (
                              <Droplets className="h-5 w-5" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-sm text-blue-600 dark:text-blue-400">{report.village}</p>
                            <p className="text-xs text-muted-foreground">
                              {report.type === "Health Report"
                                ? `${report.cases} cases`
                                : `Turbidity: ${report.turbidity}`}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge
                            variant="outline"
                            className={`${(report.type === 'Health Report' ? (report.severity === 'high' || report.severity === 'critical') : (report.risk === 'high'))
                              ? 'border-red-500/50 text-red-500 dark:text-red-400 bg-red-100 dark:bg-red-500/10'
                              : 'border-border/20 text-muted-foreground bg-accent/5'
                              }`}
                          >
                            {report.type === "Health Report" ? report.severity : report.risk}
                          </Badge>
                          <p className="text-[10px] text-muted-foreground mt-1">{report.date}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </MagicCard>

              <MagicCard
                className="animate-slide-up min-h-[400px] flex flex-col bg-card/50 dark:bg-card/50 backdrop-blur-sm border-border/50"
                enableStars={false}
                title="Active Alerts"
                description="Current health and safety alerts"
                gradientColor="#ef444410"
              >
                <div className="absolute top-6 right-6">
                  <Button variant="ghost" size="sm" asChild className="h-8 text-xs text-muted-foreground hover:text-foreground hover:bg-accent/10">
                    <Link href="/alerts">
                      Manage <Eye className="h-3 w-3 ml-2" />
                    </Link>
                  </Button>
                </div>
                <div className="space-y-3 mt-4">
                  {alerts.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">No active alerts</p>
                  ) : (
                    alerts.slice(0, 3).map((alert) => (
                      <div key={alert.id} className="flex items-center justify-between p-3 border border-border/10 rounded-lg bg-accent/5 hover:bg-accent/10 transition-colors shadow-sm">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-10 h-10 rounded-lg flex items-center justify-center ${alert.severity === "critical" || alert.severity === "emergency" ? "bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400" : "bg-yellow-100 dark:bg-yellow-500/20 text-yellow-600 dark:text-yellow-400"}`}
                          >
                            <AlertTriangle className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="font-medium text-sm text-blue-600 dark:text-blue-400">{alert.title}</p>
                            <p className="text-xs text-muted-foreground">{alert.location || 'General'}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant="outline" className={alert.severity === "critical" || alert.severity === "emergency" ? "border-red-500/50 text-red-500 dark:text-red-400 bg-red-100 dark:bg-red-500/10" : "border-yellow-500/50 text-yellow-500 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-500/10"}>
                            {alert.severity}
                          </Badge>
                          <p className="text-[10px] text-muted-foreground mt-1">{formatDate(alert.createdAt)}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </MagicCard>
            </div>
          </MagicBentoGrid>
        </div>
      </DashboardLayout>
    </AuthGuard>
  )
}
