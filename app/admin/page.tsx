"use client"

import { useState } from "react"
import { AuthGuard } from "@/components/auth-guard"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  Users,
  Download,
  Filter,
  Search,
  Plus,
  Edit,
  Trash2,
  AlertTriangle,
  Activity,
  Droplets,
  FileText,
  Send,
  Eye,
  Settings,
  BarChart3,
} from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts"

// Mock data for admin dashboard
const systemStats = {
  totalUsers: 1247,
  activeReports: 89,
  pendingAlerts: 12,
  dataIntegrity: 98.5,
}

const reportsData = [
  {
    state: "Assam",
    district: "Kamrup",
    village: "Kamakhya",
    type: "Health",
    cases: 5,
    severity: "moderate",
    date: "2024-01-15",
    status: "pending",
  },
  {
    state: "Assam",
    district: "Jorhat",
    village: "Majuli",
    type: "Water",
    turbidity: 15.2,
    risk: "moderate",
    date: "2024-01-14",
    status: "reviewed",
  },
  {
    state: "Manipur",
    district: "Imphal East",
    village: "Porompat",
    type: "Health",
    cases: 3,
    severity: "low",
    date: "2024-01-13",
    status: "resolved",
  },
  {
    state: "Mizoram",
    district: "Aizawl",
    village: "Bethlehem",
    type: "Water",
    turbidity: 8.5,
    risk: "low",
    date: "2024-01-12",
    status: "approved",
  },
]

const usersData = [
  {
    id: 1,
    name: "Dr. Priya Sharma",
    email: "priya@example.com",
    role: "Health Worker",
    village: "Kamakhya",
    status: "active",
    lastLogin: "2024-01-15",
  },
  {
    id: 2,
    name: "Ram Kumar",
    email: "ram@example.com",
    role: "Community Member",
    village: "Majuli",
    status: "active",
    lastLogin: "2024-01-14",
  },
  {
    id: 3,
    name: "Dr. Singh",
    email: "singh@example.com",
    role: "Admin",
    village: "Guwahati",
    status: "active",
    lastLogin: "2024-01-15",
  },
  {
    id: 4,
    name: "Maya Devi",
    email: "maya@example.com",
    role: "Health Worker",
    village: "Dibrugarh",
    status: "inactive",
    lastLogin: "2024-01-10",
  },
]

const alertsData = [
  {
    id: 1,
    title: "Water Contamination Alert",
    message: "High turbidity detected in Dibrugarh village water source",
    severity: "high",
    villages: ["Dibrugarh", "Tinsukia"],
    status: "active",
    created: "2024-01-15",
  },
  {
    id: 2,
    title: "Seasonal Flu Outbreak",
    message: "Increased flu cases reported in multiple villages",
    severity: "moderate",
    villages: ["Kamakhya", "Majuli"],
    status: "pending",
    created: "2024-01-14",
  },
]

const chartData = [
  { month: "Jan", health: 45, water: 23, resolved: 52 },
  { month: "Feb", health: 38, water: 19, resolved: 41 },
  { month: "Mar", health: 52, water: 31, resolved: 67 },
  { month: "Apr", health: 29, water: 15, resolved: 38 },
  { month: "May", health: 41, water: 27, resolved: 55 },
  { month: "Jun", health: 33, water: 18, resolved: 44 },
]

export default function AdminPage() {
  const [stateFilter, setStateFilter] = useState("all")
  const [districtFilter, setDistrictFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedAlert, setSelectedAlert] = useState<any>(null)
  const [isCreateAlertOpen, setIsCreateAlertOpen] = useState(false)

  const handleExportData = (format: "excel" | "pdf") => {
    // Simulate data export
    console.log(`Exporting data as ${format}`)
    alert(`Data exported as ${format.toUpperCase()}`)
  }

  return (
    <AuthGuard requiredRole="admin">
      <DashboardLayout>
        <div className="space-y-8">
          {/* Header */}
          <div className="animate-fade-in">
            <h1 className="text-3xl font-bold text-balance">Admin & Officials Dashboard</h1>
            <p className="text-muted-foreground mt-2">
              Comprehensive system management and data oversight for health officials
            </p>
          </div>

          {/* System Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="animate-slide-up">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{systemStats.totalUsers}</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-600">+12%</span> from last month
                </p>
              </CardContent>
            </Card>

            <Card className="animate-slide-up">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Reports</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{systemStats.activeReports}</div>
                <p className="text-xs text-muted-foreground">Awaiting review</p>
              </CardContent>
            </Card>

            <Card className="animate-slide-up">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Alerts</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{systemStats.pendingAlerts}</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-red-600">3 high priority</span>
                </p>
              </CardContent>
            </Card>

            <Card className="animate-slide-up">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Data Integrity</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{systemStats.dataIntegrity}%</div>
                <p className="text-xs text-muted-foreground">System health excellent</p>
              </CardContent>
            </Card>
          </div>

          {/* Main Dashboard Tabs */}
          <Tabs defaultValue="reports" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="reports">Reports</TabsTrigger>
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="alerts">Alerts</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            {/* Reports Management */}
            <TabsContent value="reports" className="space-y-6">
              {/* Filters */}
              <Card className="animate-slide-up">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Filter className="h-5 w-5" />
                    Data Filters & Export
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search reports..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <Select value={stateFilter} onValueChange={setStateFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="Filter by state" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All States</SelectItem>
                        <SelectItem value="assam">Assam</SelectItem>
                        <SelectItem value="manipur">Manipur</SelectItem>
                        <SelectItem value="mizoram">Mizoram</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={districtFilter} onValueChange={setDistrictFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="Filter by district" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Districts</SelectItem>
                        <SelectItem value="kamrup">Kamrup</SelectItem>
                        <SelectItem value="jorhat">Jorhat</SelectItem>
                        <SelectItem value="imphal-east">Imphal East</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="Filter by status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="reviewed">Reviewed</SelectItem>
                        <SelectItem value="resolved">Resolved</SelectItem>
                      </SelectContent>
                    </Select>
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={() => handleExportData("excel")}>
                        <Download className="h-4 w-4 mr-2" />
                        Excel
                      </Button>
                      <Button variant="outline" onClick={() => handleExportData("pdf")}>
                        <Download className="h-4 w-4 mr-2" />
                        PDF
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Reports Table */}
              <Card className="animate-slide-up">
                <CardHeader>
                  <CardTitle>All Reports</CardTitle>
                  <CardDescription>Comprehensive view of all health and water quality reports</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Location</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Details</TableHead>
                        <TableHead>Severity/Risk</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {reportsData.map((report, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{report.village}</div>
                              <div className="text-sm text-muted-foreground">
                                {report.district}, {report.state}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="flex items-center gap-1 w-fit">
                              {report.type === "Health" ? (
                                <Activity className="h-3 w-3" />
                              ) : (
                                <Droplets className="h-3 w-3" />
                              )}
                              {report.type}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {report.type === "Health" ? (
                              <span>{report.cases} cases</span>
                            ) : (
                              <span>{report.turbidity} NTU</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                report.severity === "high" || report.risk === "high"
                                  ? "destructive"
                                  : report.severity === "moderate" || report.risk === "moderate"
                                    ? "default"
                                    : "secondary"
                              }
                            >
                              {report.severity || report.risk}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                report.status === "pending"
                                  ? "default"
                                  : report.status === "reviewed"
                                    ? "secondary"
                                    : "outline"
                              }
                            >
                              {report.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{report.date}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="outline">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* User Management */}
            <TabsContent value="users" className="space-y-6">
              <Card className="animate-slide-up">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>User Management</CardTitle>
                    <CardDescription>Manage user accounts, roles, and permissions</CardDescription>
                  </div>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add User
                  </Button>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Village</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Last Login</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {usersData.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">{user.name}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{user.role}</Badge>
                          </TableCell>
                          <TableCell>{user.village}</TableCell>
                          <TableCell>
                            <Badge variant={user.status === "active" ? "secondary" : "outline"}>{user.status}</Badge>
                          </TableCell>
                          <TableCell>{user.lastLogin}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="outline">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Alert Management */}
            <TabsContent value="alerts" className="space-y-6">
              <Card className="animate-slide-up">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Alert Management</CardTitle>
                    <CardDescription>Create, manage, and broadcast health alerts</CardDescription>
                  </div>
                  <Dialog open={isCreateAlertOpen} onOpenChange={setIsCreateAlertOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Create Alert
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Create New Alert</DialogTitle>
                        <DialogDescription>
                          Broadcast an alert to selected villages and health workers
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="alert-title">Alert Title</Label>
                          <Input id="alert-title" placeholder="Enter alert title" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="alert-message">Message</Label>
                          <Textarea id="alert-message" placeholder="Enter alert message" rows={4} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="alert-severity">Severity</Label>
                            <Select>
                              <SelectTrigger>
                                <SelectValue placeholder="Select severity" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="low">Low</SelectItem>
                                <SelectItem value="moderate">Moderate</SelectItem>
                                <SelectItem value="high">High</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="alert-villages">Target Villages</Label>
                            <Select>
                              <SelectTrigger>
                                <SelectValue placeholder="Select villages" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">All Villages</SelectItem>
                                <SelectItem value="kamakhya">Kamakhya</SelectItem>
                                <SelectItem value="majuli">Majuli</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" onClick={() => setIsCreateAlertOpen(false)}>
                            Cancel
                          </Button>
                          <Button onClick={() => setIsCreateAlertOpen(false)}>
                            <Send className="h-4 w-4 mr-2" />
                            Send Alert
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {alertsData.map((alert) => (
                      <div key={alert.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-medium">{alert.title}</h4>
                              <Badge
                                variant={
                                  alert.severity === "high"
                                    ? "destructive"
                                    : alert.severity === "moderate"
                                      ? "default"
                                      : "secondary"
                                }
                              >
                                {alert.severity}
                              </Badge>
                              <Badge variant={alert.status === "active" ? "secondary" : "outline"}>
                                {alert.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">{alert.message}</p>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span>Villages: {alert.villages.join(", ")}</span>
                              <span>Created: {alert.created}</span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <Send className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Analytics */}
            <TabsContent value="analytics" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="animate-slide-up">
                  <CardHeader>
                    <CardTitle>Monthly Report Trends</CardTitle>
                    <CardDescription>Health and water quality reports over time</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="health" fill="hsl(var(--chart-1))" name="Health Reports" />
                        <Bar dataKey="water" fill="hsl(var(--chart-2))" name="Water Reports" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card className="animate-slide-up">
                  <CardHeader>
                    <CardTitle>Resolution Rate</CardTitle>
                    <CardDescription>Monthly resolution trends</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Line
                          type="monotone"
                          dataKey="resolved"
                          stroke="hsl(var(--chart-3))"
                          strokeWidth={3}
                          name="Resolved Cases"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* System Settings */}
            <TabsContent value="settings" className="space-y-6">
              <Card className="animate-slide-up">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    System Configuration
                  </CardTitle>
                  <CardDescription>Manage system-wide settings and preferences</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="font-medium">Notification Settings</h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="email-alerts">Email Alerts</Label>
                          <Switch id="email-alerts" defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label htmlFor="sms-alerts">SMS Alerts</Label>
                          <Switch id="sms-alerts" defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label htmlFor="push-notifications">Push Notifications</Label>
                          <Switch id="push-notifications" />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-medium">Data Management</h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="auto-backup">Automatic Backup</Label>
                          <Switch id="auto-backup" defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label htmlFor="data-retention">Extended Data Retention</Label>
                          <Switch id="data-retention" defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label htmlFor="analytics">Advanced Analytics</Label>
                          <Switch id="analytics" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <Button>Save Configuration</Button>
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
