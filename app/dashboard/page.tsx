"use client"

import { AuthGuard } from "@/components/auth-guard"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Activity, Droplets, AlertTriangle, Users, MapPin, BookOpen, Plus, Eye } from "lucide-react"
import Link from "next/link"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"

// Mock data for charts
const healthTrendsData = [
  { month: "Jan", cases: 12, recovered: 10 },
  { month: "Feb", cases: 8, recovered: 7 },
  { month: "Mar", cases: 15, recovered: 12 },
  { month: "Apr", cases: 6, recovered: 6 },
  { month: "May", cases: 9, recovered: 8 },
  { month: "Jun", cases: 4, recovered: 4 },
]

const waterQualityData = [
  { name: "Safe", value: 65, color: "#10b981" },
  { name: "Moderate Risk", value: 25, color: "#f59e0b" },
  { name: "High Risk", value: 10, color: "#ef4444" },
]

const recentReports = [
  {
    id: 1,
    type: "Health Report",
    village: "Kamakhya Village",
    cases: 3,
    symptoms: "Fever, Headache",
    date: "2024-01-15",
    severity: "moderate",
  },
  {
    id: 2,
    type: "Water Quality",
    village: "Brahmaputra Village",
    turbidity: 8.5,
    risk: "low",
    date: "2024-01-14",
  },
  {
    id: 3,
    type: "Health Report",
    village: "Majuli Village",
    cases: 1,
    symptoms: "Stomach Pain",
    date: "2024-01-13",
    severity: "low",
  },
]

const activeAlerts = [
  {
    id: 1,
    title: "Water Contamination Alert",
    village: "Dibrugarh Village",
    severity: "high",
    date: "2024-01-15",
  },
  {
    id: 2,
    title: "Seasonal Flu Outbreak",
    village: "Tezpur Village",
    severity: "moderate",
    date: "2024-01-14",
  },
]

export default function DashboardPage() {
  return (
    <AuthGuard>
      <DashboardLayout>
        <div className="space-y-8">
          {/* Welcome Section */}
          <div className="animate-fade-in">
            <h1 className="text-3xl font-bold text-balance">Welcome to VillageVitals</h1>
            <p className="text-muted-foreground mt-2">
              Monitor community health and water quality across rural villages
            </p>
          </div>

          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="animate-slide-up">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">1,234</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-600">+12%</span> from last month
                </p>
              </CardContent>
            </Card>

            <Card className="animate-slide-up">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Water Sources</CardTitle>
                <Droplets className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">89</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-600">65%</span> safe quality
                </p>
              </CardContent>
            </Card>

            <Card className="animate-slide-up">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">7</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-red-600">2 high priority</span>
                </p>
              </CardContent>
            </Card>

            <Card className="animate-slide-up">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Villages Connected</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">156</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-600">+8</span> new this month
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
                <Button asChild className="h-auto p-4 flex flex-col gap-2">
                  <Link href="/health-report">
                    <Plus className="h-6 w-6" />
                    <span className="text-sm">Submit Report</span>
                  </Link>
                </Button>
                <Button asChild variant="outline" className="h-auto p-4 flex flex-col gap-2 bg-transparent">
                  <Link href="/water-quality">
                    <Droplets className="h-6 w-6" />
                    <span className="text-sm">Water Quality</span>
                  </Link>
                </Button>
                <Button asChild variant="outline" className="h-auto p-4 flex flex-col gap-2 bg-transparent">
                  <Link href="/health-map">
                    <MapPin className="h-6 w-6" />
                    <span className="text-sm">Health Map</span>
                  </Link>
                </Button>
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
            {/* Health Trends Chart */}
            <Card className="animate-slide-up">
              <CardHeader>
                <CardTitle>Health Trends</CardTitle>
                <CardDescription>Monthly health cases and recovery rates</CardDescription>
              </CardHeader>
              <CardContent>
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
              </CardContent>
            </Card>

            {/* Water Quality Distribution */}
            <Card className="animate-slide-up">
              <CardHeader>
                <CardTitle>Water Quality Distribution</CardTitle>
                <CardDescription>Current status of water sources</CardDescription>
              </CardHeader>
              <CardContent>
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
              </CardContent>
            </Card>
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
                  {recentReports.map((report) => (
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
                              ? report.severity === "high"
                                ? "destructive"
                                : report.severity === "moderate"
                                  ? "default"
                                  : "secondary"
                              : report.risk === "high"
                                ? "destructive"
                                : report.risk === "moderate"
                                  ? "default"
                                  : "secondary"
                          }
                        >
                          {report.type === "Health Report" ? report.severity : report.risk}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">{report.date}</p>
                      </div>
                    </div>
                  ))}
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
                  {activeAlerts.map((alert) => (
                    <div key={alert.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            alert.severity === "high" ? "bg-red-100" : "bg-yellow-100"
                          }`}
                        >
                          <AlertTriangle
                            className={`h-5 w-5 ${alert.severity === "high" ? "text-red-600" : "text-yellow-600"}`}
                          />
                        </div>
                        <div>
                          <p className="font-medium">{alert.title}</p>
                          <p className="text-sm text-muted-foreground">{alert.village}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={alert.severity === "high" ? "destructive" : "default"}>{alert.severity}</Badge>
                        <p className="text-xs text-muted-foreground mt-1">{alert.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </DashboardLayout>
    </AuthGuard>
  )
}
