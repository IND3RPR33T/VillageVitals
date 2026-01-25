"use client"

import { useState, useEffect } from "react"
import { AuthGuard } from "@/components/auth-guard"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertTriangle, Bell, Search, Filter, Plus, Eye, Trash2, Loader2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  getAlertsForRole,
  addAlert,
  deleteDocument,
  type Alert as AlertType
} from "@/lib/firestore-service"
import { getCurrentUserRole } from "@/lib/role-service"

export default function AlertsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [severityFilter, setSeverityFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [loading, setLoading] = useState(true)
  const [alerts, setAlerts] = useState<AlertType[]>([])
  const [isAdmin, setIsAdmin] = useState(false)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const [newAlert, setNewAlert] = useState({
    title: "",
    message: "",
    type: "general" as "health" | "water" | "emergency" | "general",
    severity: "info" as "info" | "warning" | "critical" | "emergency",
    targetAudience: "all" as "all" | "health-workers" | "community" | "admins",
    location: "",
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [alertsData, role] = await Promise.all([
        getAlertsForRole(100),
        getCurrentUserRole()
      ])
      setAlerts(alertsData)
      setIsAdmin(role === 'admin')
    } catch (error) {
      console.error("Error loading alerts:", error)
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

  const handleCreateAlert = async () => {
    if (!newAlert.title || !newAlert.message) return
    setIsSaving(true)
    try {
      await addAlert(newAlert)
      setIsCreateOpen(false)
      setNewAlert({
        title: "",
        message: "",
        type: "general",
        severity: "info",
        targetAudience: "all",
        location: "",
      })
      loadData()
    } catch (error) {
      console.error("Error creating alert:", error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this alert?")) return
    const success = await deleteDocument('alerts', id)
    if (success) loadData()
  }

  const filteredAlerts = alerts.filter((alert) => {
    const matchesSearch =
      alert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.message.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesSeverity = severityFilter === "all" || alert.severity === severityFilter
    return matchesSearch && matchesSeverity
  })

  const activeAlerts = alerts.filter(a => a.isActive)
  const highPriorityAlerts = alerts.filter(a => a.isActive && (a.severity === 'critical' || a.severity === 'emergency'))

  return (
    <AuthGuard>
      <DashboardLayout>
        <div className="space-y-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="animate-fade-in">
              <h1 className="text-3xl font-bold">Alert Management</h1>
              <p className="text-muted-foreground mt-2">
                {isAdmin ? "Monitor and manage health alerts across all villages" : "View health alerts for your area"}
              </p>
            </div>
            {isAdmin && (
              <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Alert
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle>Create New Alert</DialogTitle>
                    <DialogDescription>
                      Send an alert to users in the mobile app
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>Title *</Label>
                      <Input
                        value={newAlert.title}
                        onChange={(e) => setNewAlert({ ...newAlert, title: e.target.value })}
                        placeholder="Alert title"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Message *</Label>
                      <Textarea
                        value={newAlert.message}
                        onChange={(e) => setNewAlert({ ...newAlert, message: e.target.value })}
                        placeholder="Alert message..."
                        rows={3}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Type</Label>
                        <Select
                          value={newAlert.type}
                          onValueChange={(v: any) => setNewAlert({ ...newAlert, type: v })}
                        >
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="general">General</SelectItem>
                            <SelectItem value="health">Health</SelectItem>
                            <SelectItem value="water">Water</SelectItem>
                            <SelectItem value="emergency">Emergency</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Severity</Label>
                        <Select
                          value={newAlert.severity}
                          onValueChange={(v: any) => setNewAlert({ ...newAlert, severity: v })}
                        >
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="info">Info</SelectItem>
                            <SelectItem value="warning">Warning</SelectItem>
                            <SelectItem value="critical">Critical</SelectItem>
                            <SelectItem value="emergency">Emergency</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Target Audience</Label>
                      <Select
                        value={newAlert.targetAudience}
                        onValueChange={(v: any) => setNewAlert({ ...newAlert, targetAudience: v })}
                      >
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Users</SelectItem>
                          <SelectItem value="health-workers">Health Workers Only</SelectItem>
                          <SelectItem value="community">Community Members</SelectItem>
                          <SelectItem value="admins">Admins Only</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Location (optional)</Label>
                      <Input
                        value={newAlert.location}
                        onChange={(e) => setNewAlert({ ...newAlert, location: e.target.value })}
                        placeholder="e.g., Guwahati, Assam"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                    <Button onClick={handleCreateAlert} disabled={isSaving}>
                      {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                      Send Alert
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>

          {/* Alert Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="animate-slide-up">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
                <AlertTriangle className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{activeAlerts.length}</div>
                <p className="text-xs text-muted-foreground">
                  {highPriorityAlerts.length} high priority
                </p>
              </CardContent>
            </Card>

            <Card className="animate-slide-up">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Alerts</CardTitle>
                <Bell className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{alerts.length}</div>
                <p className="text-xs text-muted-foreground">All time</p>
              </CardContent>
            </Card>

            <Card className="animate-slide-up">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Emergency Alerts</CardTitle>
                <Badge variant="destructive" className="text-xs">
                  {alerts.filter(a => a.severity === 'emergency').length}
                </Badge>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{alerts.filter(a => a.severity === 'emergency').length}</div>
                <p className="text-xs text-muted-foreground">Critical attention required</p>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card className="animate-slide-up">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filter Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search alerts..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={severityFilter} onValueChange={setSeverityFilter}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="Filter by severity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Severities</SelectItem>
                    <SelectItem value="emergency">Emergency</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                    <SelectItem value="warning">Warning</SelectItem>
                    <SelectItem value="info">Info</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Alerts List */}
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : filteredAlerts.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                No alerts found. {isAdmin && "Create a new alert to notify users."}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredAlerts.map((alert) => (
                <Card key={alert.id} className="animate-slide-up hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-semibold text-lg flex items-center gap-2">
                              <AlertTriangle
                                className={`h-5 w-5 ${alert.severity === "emergency" || alert.severity === "critical"
                                    ? "text-red-500"
                                    : alert.severity === "warning"
                                      ? "text-yellow-500"
                                      : "text-blue-500"
                                  }`}
                              />
                              {alert.title}
                            </h3>
                            <p className="text-sm text-muted-foreground mt-1">
                              Created on {formatDate(alert.createdAt)} by {alert.creatorName}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Badge
                              variant={
                                alert.severity === "emergency" || alert.severity === "critical"
                                  ? "destructive"
                                  : alert.severity === "warning"
                                    ? "default"
                                    : "secondary"
                              }
                            >
                              {alert.severity}
                            </Badge>
                            <Badge variant={alert.isActive ? "default" : "outline"}>
                              {alert.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </div>
                        </div>

                        <p className="text-muted-foreground mb-3">{alert.message}</p>

                        <div className="flex items-center gap-4 text-sm">
                          <span><strong>Type:</strong> {alert.type}</span>
                          <span><strong>Audience:</strong> {alert.targetAudience}</span>
                          {alert.location && <span><strong>Location:</strong> {alert.location}</span>}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                        {isAdmin && (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(alert.id!)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </DashboardLayout>
    </AuthGuard>
  )
}
