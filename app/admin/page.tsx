"use client"

import { useEffect, useState, useRef } from "react"
import { RBACAuthGuard } from "@/components/rbac-auth-guard"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Users, Activity, Droplets, AlertTriangle, FileText, Download, Plus, Trash2,
  Eye, Loader2, CheckCircle, AlertCircle, BookOpen, Shield, Upload, X
} from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
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
  getAllUsers,
  getHealthReports,
  getWaterQualityTests,
  getSymptomReports,
  getEmergencyAlerts,
  getAlerts,
  deleteDocument,
  addAwarenessContent,
  getAwarenessContent,
  deleteAwarenessContent,
  type HealthReport,
  type WaterQualityTest,
  type Alert as AlertType,
  type AwarenessContent,
} from "@/lib/firestore-service"
import { uploadImage, validateImageFile, compressImage } from "@/lib/cloudinary-service"

export default function AdminPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  // Data states
  const [users, setUsers] = useState<any[]>([])
  const [healthReports, setHealthReports] = useState<HealthReport[]>([])
  const [waterTests, setWaterTests] = useState<WaterQualityTest[]>([])
  const [symptomReports, setSymptomReports] = useState<any[]>([])
  const [emergencyAlerts, setEmergencyAlerts] = useState<any[]>([])
  const [systemAlerts, setSystemAlerts] = useState<AlertType[]>([])
  const [awarenessContent, setAwarenessContent] = useState<AwarenessContent[]>([])

  // Dialog states
  const [isAddAwarenessOpen, setIsAddAwarenessOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [awarenessForm, setAwarenessForm] = useState({
    title: "",
    description: "",
    content: "",
    category: "health_tips",
    imageUrl: "",
    isFeatured: false,
  })
  
  // Image upload states
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>("")
  const [imageUploading, setImageUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    loadAllData()
  }, [])

  const loadAllData = async () => {
    try {
      setLoading(true)
      const [
        usersData,
        healthData,
        waterData,
        symptomData,
        emergencyData,
        alertsData,
        awarenessData,
      ] = await Promise.all([
        getAllUsers(),
        getHealthReports(100),
        getWaterQualityTests(100),
        getSymptomReports(100),
        getEmergencyAlerts(100),
        getAlerts(100),
        getAwarenessContent(100),
      ])

      setUsers(usersData)
      setHealthReports(healthData)
      setWaterTests(waterData)
      setSymptomReports(symptomData)
      setEmergencyAlerts(emergencyData)
      setSystemAlerts(alertsData)
      setAwarenessContent(awarenessData)
    } catch (error) {
      console.error("Error loading admin data:", error)
      setError("Failed to load admin data")
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A'
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    } catch {
      return 'N/A'
    }
  }

  const formatRole = (role: string) => {
    switch (role) {
      case 'asha_worker': return 'ASHA Worker'
      case 'health_official': return 'Health Official'
      case 'field_worker': return 'Field Worker'
      case 'admin': return 'Administrator'
      default: return role?.replace('_', ' ') || 'Unknown'
    }
  }

  const handleDelete = async (collectionName: string, docId: string, dataType: string) => {
    if (!confirm(`Are you sure you want to delete this ${dataType}?`)) return

    try {
      const success = await deleteDocument(collectionName, docId)
      if (success) {
        setSuccess(`${dataType} deleted successfully`)
        loadAllData() // Reload data
      } else {
        setError(`Failed to delete ${dataType}`)
      }
    } catch (error) {
      setError(`Error deleting ${dataType}`)
    }
  }

  // Image upload handlers
  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const validation = validateImageFile(file)
    if (!validation.valid) {
      setError(validation.error || "Invalid image file")
      return
    }

    setImageFile(file)
    
    // Create preview
    const reader = new FileReader()
    reader.onload = () => {
      setImagePreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const clearImageSelection = () => {
    setImageFile(null)
    setImagePreview("")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleAddAwareness = async () => {
    if (!awarenessForm.title || !awarenessForm.description || !awarenessForm.content) {
      setError("Please fill in all required fields")
      return
    }

    setIsSaving(true)
    try {
      // Upload image if selected
      let imageUrl = awarenessForm.imageUrl
      if (imageFile) {
        setImageUploading(true)
        try {
          const compressedFile = await compressImage(imageFile, 800, 0.8)
          const result = await uploadImage(compressedFile, {
            folder: 'awareness_content',
            quality: 'auto',
            format: 'auto',
          })
          imageUrl = result.secure_url
        } catch (err) {
          console.error("Image upload failed:", err)
          setError("Failed to upload image, but content will be saved without image")
        } finally {
          setImageUploading(false)
        }
      }

      await addAwarenessContent({ ...awarenessForm, imageUrl })
      setSuccess("Awareness content added successfully! It will now appear in the app.")
      setIsAddAwarenessOpen(false)
      setAwarenessForm({
        title: "",
        description: "",
        content: "",
        category: "health_tips",
        imageUrl: "",
        isFeatured: false,
      })
      clearImageSelection()
      loadAllData()
    } catch (error) {
      setError("Failed to add awareness content")
    } finally {
      setIsSaving(false)
    }
  }

  // Export to CSV
  const exportToCSV = (data: any[], filename: string, headers: string[]) => {
    const csvRows = []
    csvRows.push(headers.join(','))

    data.forEach(item => {
      const values = headers.map(header => {
        const value = item[header] ?? ''
        // Escape commas and quotes
        const escaped = String(value).replace(/"/g, '""')
        return `"${escaped}"`
      })
      csvRows.push(values.join(','))
    })

    const csvString = csvRows.join('\n')
    const blob = new Blob([csvString], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  const exportUsers = () => {
    const headers = ['uid', 'email', 'firstName', 'lastName', 'fullName', 'phone', 'phoneNumber', 'role', 'isVerified']
    exportToCSV(users, 'users', headers)
    setSuccess("Users exported to CSV")
  }

  const exportHealthReports = () => {
    const headers = ['reportId', 'reporterName', 'reporterEmail', 'villageName', 'state', 'symptoms', 'severity', 'numberOfCases', 'status', 'description']
    const data = healthReports.map(r => ({ ...r, symptoms: r.symptoms?.join('; ') || '' }))
    exportToCSV(data, 'health_reports', headers)
    setSuccess("Health reports exported to CSV")
  }

  const exportWaterTests = () => {
    const headers = ['testId', 'testerName', 'testerEmail', 'location', 'sourceType', 'coliform', 'turbidity', 'bod', 'cod', 'nitrate', 'ammonia', 'riskLevel', 'status']
    const data = waterTests.map(t => ({
      ...t,
      coliform: t.measurements?.coliform,
      turbidity: t.measurements?.turbidity,
      bod: t.measurements?.bod,
      cod: t.measurements?.cod,
      nitrate: t.measurements?.nitrate,
      ammonia: t.measurements?.ammonia,
      riskLevel: t.riskAssessment?.level,
    }))
    exportToCSV(data, 'water_quality_tests', headers)
    setSuccess("Water quality tests exported to CSV")
  }

  const exportSymptomReports = () => {
    const headers = ['id', 'symptoms', 'severity', 'description', 'location', 'createdAt']
    const data = symptomReports.map(r => ({
      ...r,
      symptoms: r.symptoms?.join?.('; ') || r.symptoms || '',
      createdAt: formatDate(r.createdAt),
    }))
    exportToCSV(data, 'symptom_reports', headers)
    setSuccess("Symptom reports exported to CSV")
  }

  const exportAllData = () => {
    exportUsers()
    setTimeout(() => exportHealthReports(), 500)
    setTimeout(() => exportWaterTests(), 1000)
    setTimeout(() => exportSymptomReports(), 1500)
  }

  if (loading) {
    return (
      <RBACAuthGuard allowedRoles={['ADMIN']} requiredModule="ADMIN_PANEL">
        <DashboardLayout>
          <div className="flex items-center justify-center min-h-[60vh]">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </DashboardLayout>
      </RBACAuthGuard>
    )
  }

  return (
    <RBACAuthGuard allowedRoles={['ADMIN']} requiredModule="ADMIN_PANEL">
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <Shield className="h-8 w-8" />
                Admin Dashboard
              </h1>
              <p className="text-muted-foreground">
                Manage users, reports, and content
              </p>
            </div>
            <div className="flex gap-2">
              <Button onClick={loadAllData} variant="outline">
                Refresh Data
              </Button>
              <Button onClick={exportAllData}>
                <Download className="h-4 w-4 mr-2" />
                Export All
              </Button>
            </div>
          </div>

          {/* Messages */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {success && (
            <Alert className="border-green-200 bg-green-50 text-green-800">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          {/* Stats Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Users className="h-4 w-4" /> Users
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{users.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Activity className="h-4 w-4" /> Health Reports
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{healthReports.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Droplets className="h-4 w-4" /> Water Tests
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{waterTests.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <FileText className="h-4 w-4" /> Symptoms
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{symptomReports.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" /> Emergencies
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{emergencyAlerts.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <BookOpen className="h-4 w-4" /> Awareness
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{awarenessContent.length}</div>
              </CardContent>
            </Card>
          </div>

          {/* Main Tabs */}
          <Tabs defaultValue="users" className="space-y-4">
            <TabsList className="grid grid-cols-6 w-full max-w-4xl">
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="health">Health</TabsTrigger>
              <TabsTrigger value="water">Water</TabsTrigger>
              <TabsTrigger value="symptoms">Symptoms</TabsTrigger>
              <TabsTrigger value="emergency">Emergency</TabsTrigger>
              <TabsTrigger value="awareness">Awareness</TabsTrigger>
            </TabsList>

            {/* Users Tab */}
            <TabsContent value="users">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>All Users</CardTitle>
                    <CardDescription>Manage registered users</CardDescription>
                  </div>
                  <Button onClick={exportUsers} variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" /> Export CSV
                  </Button>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Verified</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">
                            {user.firstName || user.fullName?.split(' ')[0] || 'N/A'} {user.lastName || ''}
                          </TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>{user.phone || user.phoneNumber || 'N/A'}</TableCell>
                          <TableCell>
                            <Badge variant={user.role === 'admin' ? 'destructive' : 'secondary'}>
                              {formatRole(user.role)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {user.isVerified ? (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            ) : (
                              <AlertCircle className="h-4 w-4 text-yellow-500" />
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Health Reports Tab */}
            <TabsContent value="health">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Health Reports</CardTitle>
                    <CardDescription>All health reports from web and app</CardDescription>
                  </div>
                  <Button onClick={exportHealthReports} variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" /> Export CSV
                  </Button>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Reporter</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Symptoms</TableHead>
                        <TableHead>Cases</TableHead>
                        <TableHead>Severity</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {healthReports.map((report) => (
                        <TableRow key={report.id}>
                          <TableCell className="font-mono text-xs">{report.reportId}</TableCell>
                          <TableCell>{report.reporterName}</TableCell>
                          <TableCell>{report.villageName}, {report.state}</TableCell>
                          <TableCell className="max-w-[150px] truncate">{report.symptoms?.join(', ')}</TableCell>
                          <TableCell>{report.numberOfCases}</TableCell>
                          <TableCell>
                            <Badge variant={report.severity === 'critical' || report.severity === 'high' ? 'destructive' : 'secondary'}>
                              {report.severity}
                            </Badge>
                          </TableCell>
                          <TableCell>{report.status}</TableCell>
                          <TableCell>{formatDate(report.createdAt)}</TableCell>
                          <TableCell>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDelete('health_reports', report.id!, 'report')}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Water Tests Tab */}
            <TabsContent value="water">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Water Quality Tests</CardTitle>
                    <CardDescription>All water quality test results</CardDescription>
                  </div>
                  <Button onClick={exportWaterTests} variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" /> Export CSV
                  </Button>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Tester</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Source</TableHead>
                        <TableHead>Risk Level</TableHead>
                        <TableHead>Turbidity</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {waterTests.map((test) => (
                        <TableRow key={test.id}>
                          <TableCell className="font-mono text-xs">{test.testId}</TableCell>
                          <TableCell>{test.testerName}</TableCell>
                          <TableCell>{test.location}</TableCell>
                          <TableCell>{test.sourceType}</TableCell>
                          <TableCell>
                            <Badge variant={test.riskAssessment?.level === 'high' ? 'destructive' : 'secondary'}>
                              {test.riskAssessment?.level}
                            </Badge>
                          </TableCell>
                          <TableCell>{test.measurements?.turbidity} NTU</TableCell>
                          <TableCell>{test.status}</TableCell>
                          <TableCell>{formatDate(test.createdAt)}</TableCell>
                          <TableCell>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDelete('water_quality_tests', test.id!, 'test')}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Symptom Reports Tab */}
            <TabsContent value="symptoms">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Symptom Reports (Flutter App)</CardTitle>
                    <CardDescription>Reports submitted from mobile app</CardDescription>
                  </div>
                  <Button onClick={exportSymptomReports} variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" /> Export CSV
                  </Button>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Symptoms</TableHead>
                        <TableHead>Severity</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {symptomReports.map((report) => (
                        <TableRow key={report.id}>
                          <TableCell className="font-mono text-xs">{report.id?.substring(0, 8)}</TableCell>
                          <TableCell className="max-w-[200px] truncate">
                            {Array.isArray(report.symptoms) ? report.symptoms.join(', ') : report.symptoms}
                          </TableCell>
                          <TableCell>
                            <Badge>{report.severity || 'N/A'}</Badge>
                          </TableCell>
                          <TableCell className="max-w-[200px] truncate">{report.description}</TableCell>
                          <TableCell>{formatDate(report.createdAt)}</TableCell>
                          <TableCell>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDelete('symptom_reports', report.id!, 'report')}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Emergency Alerts Tab */}
            <TabsContent value="emergency">
              <Card>
                <CardHeader>
                  <CardTitle>Emergency Alerts (Flutter App)</CardTitle>
                  <CardDescription>Emergency alerts from mobile app</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Audio</TableHead>
                        <TableHead>Image</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {emergencyAlerts.map((alert) => (
                        <TableRow key={alert.id}>
                          <TableCell className="font-mono text-xs">{alert.id?.substring(0, 8)}</TableCell>
                          <TableCell className="max-w-[200px] truncate">{alert.description}</TableCell>
                          <TableCell>
                            {alert.latitude && alert.longitude ? (
                              <a
                                href={`https://maps.google.com/?q=${alert.latitude},${alert.longitude}`}
                                target="_blank"
                                className="text-blue-600 hover:underline"
                              >
                                View Map
                              </a>
                            ) : 'N/A'}
                          </TableCell>
                          <TableCell>
                            {alert.audioUrl ? (
                              <a href={alert.audioUrl} target="_blank" className="text-blue-600 hover:underline">Listen</a>
                            ) : 'N/A'}
                          </TableCell>
                          <TableCell>
                            {alert.imageUrl ? (
                              <a href={alert.imageUrl} target="_blank" className="text-blue-600 hover:underline">View</a>
                            ) : 'N/A'}
                          </TableCell>
                          <TableCell>{formatDate(alert.createdAt)}</TableCell>
                          <TableCell>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDelete('emergency_alerts', alert.id!, 'alert')}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Awareness Tab */}
            <TabsContent value="awareness">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Awareness Content</CardTitle>
                    <CardDescription>Health tips and articles shown in the app</CardDescription>
                  </div>
                  <Dialog open={isAddAwarenessOpen} onOpenChange={setIsAddAwarenessOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" /> Add Content
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Add Awareness Content</DialogTitle>
                        <DialogDescription>
                          Create new health awareness content that will appear in the mobile app
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="title">Title *</Label>
                          <Input
                            id="title"
                            value={awarenessForm.title}
                            onChange={(e) => setAwarenessForm({ ...awarenessForm, title: e.target.value })}
                            placeholder="e.g., Preventing Waterborne Diseases"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="category">Category *</Label>
                          <Select
                            value={awarenessForm.category}
                            onValueChange={(value) => setAwarenessForm({ ...awarenessForm, category: value })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="health_tips">Health Tips</SelectItem>
                              <SelectItem value="disease_prevention">Disease Prevention</SelectItem>
                              <SelectItem value="water_safety">Water Safety</SelectItem>
                              <SelectItem value="emergency_prep">Emergency Preparedness</SelectItem>
                              <SelectItem value="nutrition">Nutrition</SelectItem>
                              <SelectItem value="general">General</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="description">Short Description *</Label>
                          <Input
                            id="description"
                            value={awarenessForm.description}
                            onChange={(e) => setAwarenessForm({ ...awarenessForm, description: e.target.value })}
                            placeholder="Brief summary for list view"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="content">Full Content *</Label>
                          <Textarea
                            id="content"
                            value={awarenessForm.content}
                            onChange={(e) => setAwarenessForm({ ...awarenessForm, content: e.target.value })}
                            placeholder="Full article content..."
                            rows={6}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Image (optional)</Label>
                          <div className="flex flex-col gap-2">
                            <input
                              ref={fileInputRef}
                              type="file"
                              accept="image/*"
                              onChange={handleImageSelect}
                              className="hidden"
                              id="awareness-image-upload"
                            />
                            
                            {imagePreview ? (
                              <div className="relative w-48">
                                <img 
                                  src={imagePreview} 
                                  alt="Preview" 
                                  className="w-full h-32 object-cover rounded border"
                                />
                                <button
                                  type="button"
                                  onClick={clearImageSelection}
                                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </div>
                            ) : (
                              <label 
                                htmlFor="awareness-image-upload"
                                className="flex items-center gap-2 px-4 py-2 border-2 border-dashed rounded cursor-pointer hover:border-primary hover:bg-gray-50 w-fit"
                              >
                                <Upload className="h-4 w-4" />
                                Choose Image
                              </label>
                            )}
                            
                            {imageUploading && (
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Uploading image...
                              </div>
                            )}
                            
                            <p className="text-xs text-muted-foreground">
                              Supported: JPG, PNG, WebP (max 10MB)
                            </p>
                            
                            {/* Fallback URL input */}
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <span>Or enter URL:</span>
                              <Input
                                value={awarenessForm.imageUrl}
                                onChange={(e) => setAwarenessForm({ ...awarenessForm, imageUrl: e.target.value })}
                                placeholder="https://example.com/image.jpg"
                                className="h-8 text-xs"
                              />
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id="featured"
                            checked={awarenessForm.isFeatured}
                            onChange={(e) => setAwarenessForm({ ...awarenessForm, isFeatured: e.target.checked })}
                          />
                          <Label htmlFor="featured">Featured (show at top)</Label>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAddAwarenessOpen(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleAddAwareness} disabled={isSaving}>
                          {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                          Add Content
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Featured</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {awarenessContent.map((content) => (
                        <TableRow key={content.id}>
                          <TableCell className="font-medium">{content.title}</TableCell>
                          <TableCell>
                            <Badge variant="secondary">{content.category?.replace('_', ' ')}</Badge>
                          </TableCell>
                          <TableCell className="max-w-[200px] truncate">{content.description}</TableCell>
                          <TableCell>
                            {content.isFeatured ? (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            ) : '-'}
                          </TableCell>
                          <TableCell>{formatDate(content.createdAt)}</TableCell>
                          <TableCell>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDelete('awareness_content', content.id!, 'content')}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </DashboardLayout>
    </RBACAuthGuard>
  )
}
