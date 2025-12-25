"use client"

import { useState } from "react"
import { AuthGuard } from "@/components/auth-guard"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertTriangle, Bell, Search, Filter, Plus, Eye, Edit, Trash2 } from "lucide-react"

const alertsData = [
  {
    id: 1,
    title: "Water Contamination Alert",
    message: "High turbidity levels detected in multiple water sources. Immediate testing required.",
    severity: "high",
    villages: ["Dibrugarh", "Tinsukia", "Jorhat"],
    status: "active",
    created: "2024-01-15",
    recipients: 156,
  },
  {
    id: 2,
    title: "Seasonal Flu Outbreak",
    message: "Increased flu cases reported. Enhanced monitoring and prevention measures recommended.",
    severity: "moderate",
    villages: ["Kamakhya", "Majuli", "Guwahati"],
    status: "active",
    created: "2024-01-14",
    recipients: 89,
  },
  {
    id: 3,
    title: "Health Center Closure",
    message: "Temporary closure of Tezpur Health Center due to maintenance. Alternative facilities available.",
    severity: "low",
    villages: ["Tezpur", "Sonitpur"],
    status: "resolved",
    created: "2024-01-12",
    recipients: 45,
  },
]

export default function AlertsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [severityFilter, setSeverityFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")

  const filteredAlerts = alertsData.filter((alert) => {
    const matchesSearch =
      alert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.message.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesSeverity = severityFilter === "all" || alert.severity === severityFilter
    const matchesStatus = statusFilter === "all" || alert.status === statusFilter

    return matchesSearch && matchesSeverity && matchesStatus
  })

  return (
    <AuthGuard>
      <DashboardLayout>
        <div className="space-y-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="animate-fade-in">
              <h1 className="text-3xl font-bold">Alert Management</h1>
              <p className="text-muted-foreground mt-2">Monitor and manage health alerts across all villages</p>
            </div>
            <Button asChild>
              <a href="/admin">
                <Plus className="h-4 w-4 mr-2" />
                Create Alert
              </a>
            </Button>
          </div>

          {/* Alert Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="animate-slide-up">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
                <AlertTriangle className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{alertsData.filter((a) => a.status === "active").length}</div>
                <p className="text-xs text-muted-foreground">
                  {alertsData.filter((a) => a.status === "active" && a.severity === "high").length} high priority
                </p>
              </CardContent>
            </Card>

            <Card className="animate-slide-up">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Recipients</CardTitle>
                <Bell className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{alertsData.reduce((sum, alert) => sum + alert.recipients, 0)}</div>
                <p className="text-xs text-muted-foreground">Across all active alerts</p>
              </CardContent>
            </Card>

            <Card className="animate-slide-up">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Villages Covered</CardTitle>
                <Badge variant="outline" className="text-xs">
                  {new Set(alertsData.flatMap((a) => a.villages)).size}
                </Badge>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{new Set(alertsData.flatMap((a) => a.villages)).size}</div>
                <p className="text-xs text-muted-foreground">Unique villages with alerts</p>
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
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="moderate">Moderate</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Alerts List */}
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
                              className={`h-5 w-5 ${
                                alert.severity === "high"
                                  ? "text-red-500"
                                  : alert.severity === "moderate"
                                    ? "text-yellow-500"
                                    : "text-green-500"
                              }`}
                            />
                            {alert.title}
                          </h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            Created on {alert.created} • {alert.recipients} recipients
                          </p>
                        </div>
                        <div className="flex gap-2">
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
                          <Badge variant={alert.status === "active" ? "default" : "outline"}>{alert.status}</Badge>
                        </div>
                      </div>

                      <p className="text-muted-foreground mb-3">{alert.message}</p>

                      <div className="flex items-center gap-4">
                        <div>
                          <span className="text-sm font-medium">Affected Villages:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {alert.villages.map((village) => (
                              <Badge key={village} variant="outline" className="text-xs">
                                {village}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      <Button variant="outline" size="sm">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </DashboardLayout>
    </AuthGuard>
  )
}
