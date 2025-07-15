"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Upload,
  Trash2,
  Settings,
  FileText,
  Video,
  ImageIcon,
  LogOut,
  Shield,
  X,
  Plus,
  Edit,
  Eye,
  Calendar,
  Megaphone,
  Heart,
  BookOpen,
} from "lucide-react"

interface ContentItem {
  id: string
  title: string
  description: string
  content: string
  category: "photos" | "videos" | "news" | "announcements" | "reports" | "volunteer"
  file_url?: string
  thumbnail_url?: string
  published: boolean
  created_at: string
  updated_at: string
}

interface User {
  id: string
  email: string
  username: string
  role: string
  profile_photo: string
  created_at: string
}

export default function AdminPanel() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [users, setUsers] = useState<User[]>([])
  const [content, setContent] = useState<ContentItem[]>([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [showContentModal, setShowContentModal] = useState(false)
  const [editingContent, setEditingContent] = useState<ContentItem | null>(null)
  const [currentUser, setCurrentUser] = useState<User>({
    id: "1",
    username: "Admin User",
    email: "admin@ethiopia-vitality.org",
    role: "admin",
    profile_photo: "/placeholder.svg?height=100&width=100",
    created_at: "2024-01-01",
  })
  const [profileForm, setProfileForm] = useState({
    username: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [contentForm, setContentForm] = useState({
    title: "",
    description: "",
    content: "",
    category: "photos" as ContentItem["category"],
    published: true,
  })

  // Load data on component mount
  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      // Mock data - replace with actual API calls
      setUsers([
        {
          id: "1",
          email: "admin@ethiopia-vitality.org",
          username: "Admin User",
          role: "admin",
          profile_photo: "/placeholder.svg?height=100&width=100",
          created_at: "2024-01-01",
        },
        {
          id: "2",
          email: "user@ethiopia-vitality.org",
          username: "Regular User",
          role: "user",
          profile_photo: "/placeholder.svg?height=100&width=100",
          created_at: "2024-01-15",
        },
      ])

      setContent([
        {
          id: "1",
          title: "Community Health Initiative",
          description: "New health program launched in rural areas",
          content: "We are excited to announce our new community health initiative...",
          category: "news",
          published: true,
          created_at: "2024-01-20",
          updated_at: "2024-01-20",
        },
        {
          id: "2",
          title: "Volunteer Training Workshop",
          description: "Join our upcoming volunteer training session",
          content: "We are looking for dedicated volunteers to join our mission...",
          category: "volunteer",
          published: true,
          created_at: "2024-01-18",
          updated_at: "2024-01-18",
        },
      ])
    } catch (error) {
      console.error("Error loading data:", error)
      setMessage("Error loading data from database")
    } finally {
      setLoading(false)
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    setTimeout(() => {
      if (email === "admin@ethiopia-vitality.org" && password === "admin123") {
        setIsAuthenticated(true)
        setMessage("Login successful!")
        loadData()
      } else {
        setMessage("Invalid credentials")
      }
      setLoading(false)
    }, 1000)
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, category: ContentItem["category"]) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setLoading(true)
      const formData = new FormData()
      formData.append("file", file)
      formData.append("category", category)

      const response = await fetch("/api/content/upload", {
        method: "POST",
        body: formData,
      })

      if (response.ok) {
        const result = await response.json()
        setMessage(`File uploaded to ${category} section successfully!`)
        loadData() // Reload content
      } else {
        setMessage("File upload failed")
      }
    } catch (error) {
      console.error("Upload error:", error)
      setMessage("File upload failed")
    } finally {
      setLoading(false)
    }
  }

  const handleContentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const method = editingContent ? "PUT" : "POST"
      const url = editingContent ? `/api/content/${editingContent.id}` : "/api/content"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(contentForm),
      })

      if (response.ok) {
        const result = await response.json()
        setMessage(editingContent ? "Content updated successfully!" : "Content created successfully!")
        setShowContentModal(false)
        setEditingContent(null)
        setContentForm({
          title: "",
          description: "",
          content: "",
          category: "photos",
          published: true,
        })
        loadData()
      } else {
        setMessage("Failed to save content")
      }
    } catch (error) {
      console.error("Content save error:", error)
      setMessage("Failed to save content")
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteContent = async (id: string) => {
    try {
      const response = await fetch(`/api/content/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setContent(content.filter((item) => item.id !== id))
        setMessage("Content deleted successfully!")
      } else {
        setMessage("Failed to delete content")
      }
    } catch (error) {
      console.error("Delete error:", error)
      setMessage("Failed to delete content")
    }
  }

  const openEditModal = (item: ContentItem) => {
    setEditingContent(item)
    setContentForm({
      title: item.title,
      description: item.description,
      content: item.content,
      category: item.category,
      published: item.published,
    })
    setShowContentModal(true)
  }

  const getCategoryIcon = (category: ContentItem["category"]) => {
    switch (category) {
      case "photos":
        return <ImageIcon className="w-5 h-5 text-blue-500" />
      case "videos":
        return <Video className="w-5 h-5 text-purple-500" />
      case "news":
        return <FileText className="w-5 h-5 text-green-500" />
      case "announcements":
        return <Megaphone className="w-5 h-5 text-orange-500" />
      case "reports":
        return <BookOpen className="w-5 h-5 text-indigo-500" />
      case "volunteer":
        return <Heart className="w-5 h-5 text-red-500" />
      default:
        return <FileText className="w-5 h-5 text-gray-500" />
    }
  }

  const getCategoryColor = (category: ContentItem["category"]) => {
    switch (category) {
      case "photos":
        return "bg-blue-100 text-blue-800"
      case "videos":
        return "bg-purple-100 text-purple-800"
      case "news":
        return "bg-green-100 text-green-800"
      case "announcements":
        return "bg-orange-100 text-orange-800"
      case "reports":
        return "bg-indigo-100 text-indigo-800"
      case "volunteer":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getContentByCategory = (category: ContentItem["category"]) => {
    return content.filter((item) => item.category === category)
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-green-800">Ethiopia Vitality Admin</CardTitle>
            <CardDescription>Sign in to manage your website content</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@ethiopia-vitality.org"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              {message && (
                <Alert>
                  <AlertDescription>{message}</AlertDescription>
                </Alert>
              )}
              <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={loading}>
                {loading ? "Signing in..." : "Sign In"}
              </Button>
            </form>
            <div className="mt-4 text-sm text-gray-600 text-center">
              Demo credentials: admin@ethiopia-vitality.org / admin123
            </div>
            <div className="mt-2 text-xs text-gray-500 text-center">
              Admin panel for{" "}
              <a href="https://www.ethiopia-vitality.org" className="text-green-600 hover:underline">
                www.ethiopia-vitality.org
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center mr-3">
                <Shield className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Ethiopia Vitality Admin</h1>
                <p className="text-xs text-gray-500">Managing www.ethiopia-vitality.org</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={() => window.open("https://www.ethiopia-vitality.org", "_blank")}
                className="flex items-center gap-2"
              >
                <Eye className="w-4 h-4" />
                View Site
              </Button>
              <div className="flex items-center gap-3">
                <img
                  src={currentUser.profile_photo || "/placeholder.svg"}
                  alt="Profile"
                  className="w-8 h-8 rounded-full object-cover border-2 border-green-200"
                />
                <div className="hidden sm:block">
                  <p className="text-sm font-medium text-gray-900">{currentUser.username}</p>
                  <p className="text-xs text-gray-500">{currentUser.email}</p>
                </div>
              </div>
              <Button variant="outline" onClick={() => setShowProfileModal(true)} className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Profile
              </Button>
              <Button variant="outline" onClick={() => setIsAuthenticated(false)} className="flex items-center gap-2">
                <LogOut className="w-4 h-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {message && (
          <Alert className="mb-6">
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-8">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="photos">Photos</TabsTrigger>
            <TabsTrigger value="videos">Videos</TabsTrigger>
            <TabsTrigger value="news">News</TabsTrigger>
            <TabsTrigger value="announcements">Announcements</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="volunteer">Volunteer</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
          </TabsList>

          {/* Dashboard */}
          <TabsContent value="dashboard">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Content</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{content.length}</div>
                  <p className="text-xs text-muted-foreground">Published content items</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Photos</CardTitle>
                  <ImageIcon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{getContentByCategory("photos").length}</div>
                  <p className="text-xs text-muted-foreground">Photo gallery items</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Videos</CardTitle>
                  <Video className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{getContentByCategory("videos").length}</div>
                  <p className="text-xs text-muted-foreground">Video content</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">News Articles</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{getContentByCategory("news").length}</div>
                  <p className="text-xs text-muted-foreground">Published news</p>
                </CardContent>
              </Card>
            </div>

            {/* Website Integration Status */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Website Integration Status</CardTitle>
                <CardDescription>Connection status with your main website</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <div>
                        <p className="font-medium text-green-800">Main Website Connected</p>
                        <p className="text-sm text-green-600">https://www.ethiopia-vitality.org</p>
                      </div>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Active</Badge>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <div>
                        <p className="font-medium text-blue-800">Admin Panel</p>
                        <p className="text-sm text-blue-600">admin.ethiopia-vitality.org</p>
                      </div>
                    </div>
                    <Badge className="bg-blue-100 text-blue-800">Live</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Photos Section */}
          <TabsContent value="photos">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <ImageIcon className="w-5 h-5 text-blue-500" />
                      Photo Gallery Management
                    </CardTitle>
                    <CardDescription>Manage photos that appear in the photo section of your website</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Label htmlFor="photo-upload" className="cursor-pointer">
                      <div className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                        <Upload className="w-4 h-4" />
                        Upload Photo
                      </div>
                    </Label>
                    <Input
                      id="photo-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleFileUpload(e, "photos")}
                    />
                    <Button
                      onClick={() => {
                        setEditingContent(null)
                        setContentForm({
                          title: "",
                          description: "",
                          content: "",
                          category: "photos",
                          published: true,
                        })
                        setShowContentModal(true)
                      }}
                      className="flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Add Photo Item
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {getContentByCategory("photos").map((item) => (
                    <div key={item.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          {getCategoryIcon(item.category)}
                          <Badge className={getCategoryColor(item.category)}>Photos</Badge>
                        </div>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm" onClick={() => openEditModal(item)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDeleteContent(item.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <h3 className="font-medium mb-2">{item.title}</h3>
                      <p className="text-sm text-gray-600 mb-3">{item.description}</p>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{new Date(item.created_at).toLocaleDateString()}</span>
                        <Badge variant={item.published ? "default" : "secondary"}>
                          {item.published ? "Published" : "Draft"}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Videos Section */}
          <TabsContent value="videos">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Video className="w-5 h-5 text-purple-500" />
                      Video Content Management
                    </CardTitle>
                    <CardDescription>Manage videos that appear in the video section of your website</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Label htmlFor="video-upload" className="cursor-pointer">
                      <div className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700">
                        <Upload className="w-4 h-4" />
                        Upload Video
                      </div>
                    </Label>
                    <Input
                      id="video-upload"
                      type="file"
                      accept="video/*"
                      className="hidden"
                      onChange={(e) => handleFileUpload(e, "videos")}
                    />
                    <Button
                      onClick={() => {
                        setEditingContent(null)
                        setContentForm({
                          title: "",
                          description: "",
                          content: "",
                          category: "videos",
                          published: true,
                        })
                        setShowContentModal(true)
                      }}
                      className="flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Add Video Item
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {getContentByCategory("videos").map((item) => (
                    <div key={item.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          {getCategoryIcon(item.category)}
                          <Badge className={getCategoryColor(item.category)}>Videos</Badge>
                        </div>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm" onClick={() => openEditModal(item)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDeleteContent(item.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <h3 className="font-medium mb-2">{item.title}</h3>
                      <p className="text-sm text-gray-600 mb-3">{item.description}</p>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{new Date(item.created_at).toLocaleDateString()}</span>
                        <Badge variant={item.published ? "default" : "secondary"}>
                          {item.published ? "Published" : "Draft"}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* News Section */}
          <TabsContent value="news">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="w-5 h-5 text-green-500" />
                      News Management
                    </CardTitle>
                    <CardDescription>Manage news articles that appear on your website</CardDescription>
                  </div>
                  <Button
                    onClick={() => {
                      setEditingContent(null)
                      setContentForm({
                        title: "",
                        description: "",
                        content: "",
                        category: "news",
                        published: true,
                      })
                      setShowContentModal(true)
                    }}
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                  >
                    <Plus className="w-4 h-4" />
                    Add News Article
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {getContentByCategory("news").map((item) => (
                    <div key={item.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          {getCategoryIcon(item.category)}
                          <Badge className={getCategoryColor(item.category)}>News</Badge>
                          <Badge variant={item.published ? "default" : "secondary"}>
                            {item.published ? "Published" : "Draft"}
                          </Badge>
                        </div>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm" onClick={() => openEditModal(item)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDeleteContent(item.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                      <p className="text-gray-600 mb-3">{item.description}</p>
                      <p className="text-sm text-gray-500 line-clamp-2">{item.content}</p>
                      <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(item.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Announcements Section */}
          <TabsContent value="announcements">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Megaphone className="w-5 h-5 text-orange-500" />
                      Announcements Management
                    </CardTitle>
                    <CardDescription>Manage announcements that appear on your website</CardDescription>
                  </div>
                  <Button
                    onClick={() => {
                      setEditingContent(null)
                      setContentForm({
                        title: "",
                        description: "",
                        content: "",
                        category: "announcements",
                        published: true,
                      })
                      setShowContentModal(true)
                    }}
                    className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700"
                  >
                    <Plus className="w-4 h-4" />
                    Add Announcement
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {getContentByCategory("announcements").map((item) => (
                    <div key={item.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          {getCategoryIcon(item.category)}
                          <Badge className={getCategoryColor(item.category)}>Announcement</Badge>
                          <Badge variant={item.published ? "default" : "secondary"}>
                            {item.published ? "Published" : "Draft"}
                          </Badge>
                        </div>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm" onClick={() => openEditModal(item)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDeleteContent(item.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                      <p className="text-gray-600 mb-3">{item.description}</p>
                      <p className="text-sm text-gray-500 line-clamp-2">{item.content}</p>
                      <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(item.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reports Section */}
          <TabsContent value="reports">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-indigo-500" />
                      Reports Management
                    </CardTitle>
                    <CardDescription>Manage reports and documents that appear on your website</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Label htmlFor="report-upload" className="cursor-pointer">
                      <div className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
                        <Upload className="w-4 h-4" />
                        Upload Report
                      </div>
                    </Label>
                    <Input
                      id="report-upload"
                      type="file"
                      accept=".pdf,.doc,.docx"
                      className="hidden"
                      onChange={(e) => handleFileUpload(e, "reports")}
                    />
                    <Button
                      onClick={() => {
                        setEditingContent(null)
                        setContentForm({
                          title: "",
                          description: "",
                          content: "",
                          category: "reports",
                          published: true,
                        })
                        setShowContentModal(true)
                      }}
                      className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700"
                    >
                      <Plus className="w-4 h-4" />
                      Add Report
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {getContentByCategory("reports").map((item) => (
                    <div key={item.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          {getCategoryIcon(item.category)}
                          <Badge className={getCategoryColor(item.category)}>Report</Badge>
                          <Badge variant={item.published ? "default" : "secondary"}>
                            {item.published ? "Published" : "Draft"}
                          </Badge>
                        </div>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm" onClick={() => openEditModal(item)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDeleteContent(item.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                      <p className="text-gray-600 mb-3">{item.description}</p>
                      <p className="text-sm text-gray-500 line-clamp-2">{item.content}</p>
                      <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(item.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Volunteer Opportunities Section */}
          <TabsContent value="volunteer">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Heart className="w-5 h-5 text-red-500" />
                      Volunteer Opportunities Management
                    </CardTitle>
                    <CardDescription>Manage volunteer opportunities that appear on your website</CardDescription>
                  </div>
                  <Button
                    onClick={() => {
                      setEditingContent(null)
                      setContentForm({
                        title: "",
                        description: "",
                        content: "",
                        category: "volunteer",
                        published: true,
                      })
                      setShowContentModal(true)
                    }}
                    className="flex items-center gap-2 bg-red-600 hover:bg-red-700"
                  >
                    <Plus className="w-4 h-4" />
                    Add Volunteer Opportunity
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {getContentByCategory("volunteer").map((item) => (
                    <div key={item.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          {getCategoryIcon(item.category)}
                          <Badge className={getCategoryColor(item.category)}>Volunteer</Badge>
                          <Badge variant={item.published ? "default" : "secondary"}>
                            {item.published ? "Published" : "Draft"}
                          </Badge>
                        </div>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm" onClick={() => openEditModal(item)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDeleteContent(item.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                      <p className="text-gray-600 mb-3">{item.description}</p>
                      <p className="text-sm text-gray-500 line-clamp-2">{item.content}</p>
                      <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(item.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Management */}
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>Manage user accounts and permissions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {users.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={user.profile_photo || "/placeholder.svg?height=40&width=40"}
                          alt={user.username}
                          className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
                        />
                        <div>
                          <p className="font-medium">{user.username}</p>
                          <p className="text-sm text-gray-600">{user.email}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant={user.role === "admin" ? "default" : "secondary"}>{user.role}</Badge>
                            <span className="text-xs text-gray-500">
                              Joined {new Date(user.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      {user.role !== "admin" && (
                        <Button variant="destructive" size="sm" disabled={loading}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Content Modal */}
        {showContentModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{editingContent ? "Edit Content" : "Add New Content"}</CardTitle>
                    <CardDescription>
                      {editingContent ? "Update existing content" : "Create new content for your website"}
                    </CardDescription>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setShowContentModal(false)}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleContentSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="content-title">Title</Label>
                    <Input
                      id="content-title"
                      type="text"
                      placeholder="Enter content title"
                      value={contentForm.title}
                      onChange={(e) => setContentForm({ ...contentForm, title: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="content-category">Category</Label>
                    <Select
                      value={contentForm.category}
                      onValueChange={(value: ContentItem["category"]) =>
                        setContentForm({ ...contentForm, category: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="photos">Photos</SelectItem>
                        <SelectItem value="videos">Videos</SelectItem>
                        <SelectItem value="news">News</SelectItem>
                        <SelectItem value="announcements">Announcements</SelectItem>
                        <SelectItem value="reports">Reports</SelectItem>
                        <SelectItem value="volunteer">Volunteer Opportunities</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="content-description">Description</Label>
                    <Textarea
                      id="content-description"
                      placeholder="Enter a brief description"
                      value={contentForm.description}
                      onChange={(e) => setContentForm({ ...contentForm, description: e.target.value })}
                      rows={3}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="content-content">Content</Label>
                    <Textarea
                      id="content-content"
                      placeholder="Enter the full content"
                      value={contentForm.content}
                      onChange={(e) => setContentForm({ ...contentForm, content: e.target.value })}
                      rows={6}
                      required
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="content-published"
                      checked={contentForm.published}
                      onChange={(e) => setContentForm({ ...contentForm, published: e.target.checked })}
                      className="rounded"
                    />
                    <Label htmlFor="content-published">Publish immediately</Label>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button type="submit" className="flex-1 bg-green-600 hover:bg-green-700" disabled={loading}>
                      {loading ? "Saving..." : editingContent ? "Update Content" : "Create Content"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1 bg-transparent"
                      onClick={() => setShowContentModal(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Profile Modal */}
        {showProfileModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-md">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Edit Profile</CardTitle>
                    <CardDescription>Update your profile information</CardDescription>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setShowProfileModal(false)}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <form className="space-y-4">
                  <div className="flex flex-col items-center space-y-4">
                    <img
                      src={currentUser.profile_photo || "/placeholder.svg"}
                      alt="Profile"
                      className="w-20 h-20 rounded-full object-cover border-4 border-green-200"
                    />
                    <Label htmlFor="profile-photo" className="cursor-pointer">
                      <div className="flex items-center gap-2 px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm">
                        <Upload className="w-4 h-4" />
                        Change Photo
                      </div>
                    </Label>
                    <Input id="profile-photo" type="file" accept="image/*" className="hidden" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      type="text"
                      placeholder={currentUser.username}
                      value={profileForm.username}
                      onChange={(e) => setProfileForm({ ...profileForm, username: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="current-password">Current Password</Label>
                    <Input
                      id="current-password"
                      type="password"
                      placeholder="Enter current password"
                      value={profileForm.currentPassword}
                      onChange={(e) => setProfileForm({ ...profileForm, currentPassword: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="new-password">New Password</Label>
                    <Input
                      id="new-password"
                      type="password"
                      placeholder="Enter new password"
                      value={profileForm.newPassword}
                      onChange={(e) => setProfileForm({ ...profileForm, newPassword: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm New Password</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      placeholder="Confirm new password"
                      value={profileForm.confirmPassword}
                      onChange={(e) => setProfileForm({ ...profileForm, confirmPassword: e.target.value })}
                    />
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button type="submit" className="flex-1 bg-green-600 hover:bg-green-700" disabled={loading}>
                      {loading ? "Updating..." : "Update Profile"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1 bg-transparent"
                      onClick={() => setShowProfileModal(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  )
}
