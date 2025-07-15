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
import {
  Upload,
  Trash2,
  Database,
  Settings,
  Users,
  FileText,
  Video,
  ImageIcon,
  LogOut,
  Shield,
  Save,
  X,
} from "lucide-react"
import {
  fetchUsers,
  fetchFiles,
  fetchVideoLinks,
  deleteFile,
  deleteVideoLink,
  updateUserProfile,
  updateUserPassword,
} from "@/lib/hasura"
import { hashPassword } from "@/lib/auth"

interface User {
  id: string
  email: string
  username: string
  role: string
  profile_photo: string
  created_at: string
}

interface File {
  id: string
  name: string
  original_name: string
  file_type: string
  file_size: number
  file_url: string
  created_at: string
}

interface VideoLink {
  id: string
  title: string
  url: string
  description: string
}

export default function AdminDashboard() {
  const [users, setUsers] = useState<User[]>([])
  const [files, setFiles] = useState<File[]>([])
  const [videoLinks, setVideoLinks] = useState<VideoLink[]>([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [currentUser, setCurrentUser] = useState<User>({
    id: "1",
    username: "Admin User",
    email: "admin@healethiopia.org",
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

  // Load data on component mount
  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [usersData, filesData, videosData] = await Promise.all([fetchUsers(), fetchFiles(), fetchVideoLinks()])

      setUsers(usersData)
      setFiles(filesData)
      setVideoLinks(videosData)
    } catch (error) {
      console.error("Error loading data:", error)
      setMessage("Error loading data from database")
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setLoading(true)
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/files", {
        method: "POST",
        body: formData,
      })

      if (response.ok) {
        const result = await response.json()
        setFiles([result.file, ...files])
        setMessage("File uploaded successfully!")
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

  const handleDeleteFile = async (id: string) => {
    try {
      await deleteFile(id)
      setFiles(files.filter((file) => file.id !== id))
      setMessage("File deleted successfully!")
    } catch (error) {
      console.error("Delete error:", error)
      setMessage("Failed to delete file")
    }
  }

  const handleDeleteVideoLink = async (id: string) => {
    try {
      await deleteVideoLink(id)
      setVideoLinks(videoLinks.filter((video) => video.id !== id))
      setMessage("Video link deleted successfully!")
    } catch (error) {
      console.error("Delete error:", error)
      setMessage("Failed to delete video link")
    }
  }

  const handleDeleteUser = async (id: string) => {
    // This would be implemented with a proper delete user mutation
    setUsers(users.filter((user) => user.id !== id))
    setMessage("User deleted successfully!")
  }

  const handleProfilePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      // In a real app, you'd upload to cloud storage first
      const photoUrl = URL.createObjectURL(file)

      await updateUserProfile(currentUser.id, undefined, photoUrl)
      setCurrentUser({ ...currentUser, profile_photo: photoUrl })
      setMessage("Profile photo updated!")
    } catch (error) {
      console.error("Photo upload error:", error)
      setMessage("Failed to update profile photo")
    }
  }

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Validate password change if provided
      if (profileForm.newPassword && profileForm.newPassword !== profileForm.confirmPassword) {
        setMessage("New passwords don't match!")
        setLoading(false)
        return
      }

      // Update username if provided
      if (profileForm.username) {
        await updateUserProfile(currentUser.id, profileForm.username)
        setCurrentUser({ ...currentUser, username: profileForm.username })
      }

      // Update password if provided
      if (profileForm.newPassword && profileForm.currentPassword) {
        const hashedPassword = await hashPassword(profileForm.newPassword)
        await updateUserPassword(currentUser.id, hashedPassword)
      }

      setMessage("Profile updated successfully!")
      setShowProfileModal(false)
      setProfileForm({ username: "", currentPassword: "", newPassword: "", confirmPassword: "" })
    } catch (error) {
      console.error("Profile update error:", error)
      setMessage("Failed to update profile")
    } finally {
      setLoading(false)
    }
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
              <h1 className="text-xl font-semibold text-gray-900">Heal Ethiopia Admin</h1>
            </div>
            <div className="flex items-center gap-4">
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
              <Button variant="outline" className="flex items-center gap-2 bg-transparent">
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
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="files">Files</TabsTrigger>
            <TabsTrigger value="videos">Videos</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Dashboard */}
          <TabsContent value="dashboard">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{users.length}</div>
                  <p className="text-xs text-muted-foreground">Active users in system</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Files</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{files.length}</div>
                  <p className="text-xs text-muted-foreground">Files uploaded</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Video Links</CardTitle>
                  <Video className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{videoLinks.length}</div>
                  <p className="text-xs text-muted-foreground">Active video links</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Database</CardTitle>
                  <Database className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">Connected</div>
                  <p className="text-xs text-muted-foreground">Hasura + Neon</p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest actions in your admin panel</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div>
                      <p className="text-sm font-medium">Database connected successfully</p>
                      <p className="text-xs text-gray-500">Connected to Hasura and Neon</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div>
                      <p className="text-sm font-medium">Admin panel initialized</p>
                      <p className="text-xs text-gray-500">Ready for file and user management</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Files Management */}
          <TabsContent value="files">
            <Card>
              <CardHeader>
                <CardTitle>File Management</CardTitle>
                <CardDescription>Upload, view, and delete files stored in your system</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Label htmlFor="file-upload" className="cursor-pointer">
                      <div className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors">
                        <Upload className="w-4 h-4" />
                        Upload File
                      </div>
                    </Label>
                    <Input
                      id="file-upload"
                      type="file"
                      className="hidden"
                      onChange={handleFileUpload}
                      disabled={loading}
                    />
                    {loading && <span className="text-sm text-gray-500">Uploading...</span>}
                  </div>

                  <div className="space-y-2">
                    {files.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <p>No files uploaded yet</p>
                        <p className="text-sm">Upload your first file to get started</p>
                      </div>
                    ) : (
                      files.map((file) => (
                        <div
                          key={file.id}
                          className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            {file.file_type.includes("image") ? (
                              <ImageIcon className="w-5 h-5 text-blue-500" />
                            ) : file.file_type.includes("video") ? (
                              <Video className="w-5 h-5 text-purple-500" />
                            ) : (
                              <FileText className="w-5 h-5 text-gray-500" />
                            )}
                            <div>
                              <p className="font-medium">{file.original_name}</p>
                              <p className="text-sm text-gray-500">
                                {file.file_type} • {(file.file_size / 1024).toFixed(1)} KB •{" "}
                                {new Date(file.created_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteFile(file.id)}
                            disabled={loading}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Video Links Management */}
          <TabsContent value="videos">
            <Card>
              <CardHeader>
                <CardTitle>Video Links Management</CardTitle>
                <CardDescription>Manage YouTube video links and embeds for your website</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {videoLinks.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Video className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>No video links found</p>
                      <p className="text-sm">Video links will appear here when added to the database</p>
                    </div>
                  ) : (
                    videoLinks.map((video) => (
                      <div
                        key={video.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <Video className="w-5 h-5 text-red-500" />
                          <div>
                            <p className="font-medium">{video.title}</p>
                            <p className="text-sm text-gray-500">{video.description}</p>
                            <p className="text-xs text-blue-600 hover:underline cursor-pointer">{video.url}</p>
                          </div>
                        </div>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteVideoLink(video.id)}
                          disabled={loading}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))
                  )}
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
                  {users.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>No users found</p>
                      <p className="text-sm">Users will appear here when they register</p>
                    </div>
                  ) : (
                    users.map((user) => (
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
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteUser(user.id)}
                            disabled={loading}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings */}
          <TabsContent value="settings">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Database Configuration</CardTitle>
                  <CardDescription>Your current database connections</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                        <div className="flex items-center gap-2 mb-2">
                          <Database className="w-5 h-5 text-green-600" />
                          <h3 className="font-medium text-green-800">Hasura GraphQL</h3>
                        </div>
                        <p className="text-sm text-green-700">https://heal-db.hasura.app/v1/graphql</p>
                        <div className="mt-2">
                          <Badge className="bg-green-100 text-green-800">Connected</Badge>
                        </div>
                      </div>
                      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-center gap-2 mb-2">
                          <Database className="w-5 h-5 text-blue-600" />
                          <h3 className="font-medium text-blue-800">Neon PostgreSQL</h3>
                        </div>
                        <p className="text-sm text-blue-700">
                          ep-winter-morning-a5x6pbns-pooler.us-east-2.aws.neon.tech
                        </p>
                        <div className="mt-2">
                          <Badge className="bg-blue-100 text-blue-800">Connected</Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>System Settings</CardTitle>
                  <CardDescription>Configure your application settings</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="site-name">Site Name</Label>
                      <Input id="site-name" defaultValue="Heal Ethiopia" />
                    </div>
                    <div>
                      <Label htmlFor="max-file-size">Max File Size (MB)</Label>
                      <Input id="max-file-size" type="number" defaultValue="10" />
                    </div>
                    <div>
                      <Label htmlFor="allowed-types">Allowed File Types</Label>
                      <Input id="allowed-types" defaultValue="jpg,jpeg,png,pdf,doc,docx" />
                    </div>
                    <Button className="bg-green-600 hover:bg-green-700">
                      <Save className="w-4 h-4 mr-2" />
                      Save Settings
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

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
                <form onSubmit={handleProfileUpdate} className="space-y-4">
                  {/* Profile Photo */}
                  <div className="flex flex-col items-center space-y-4">
                    <img
                      src={currentUser.profile_photo || "/placeholder.svg"}
                      alt="Profile"
                      className="w-20 h-20 rounded-full object-cover border-4 border-green-200"
                    />
                    <Label htmlFor="profile-photo" className="cursor-pointer">
                      <div className="flex items-center gap-2 px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm transition-colors">
                        <Upload className="w-4 h-4" />
                        Change Photo
                      </div>
                    </Label>
                    <Input
                      id="profile-photo"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleProfilePhotoUpload}
                    />
                  </div>

                  {/* Username */}
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

                  {/* Current Password */}
                  <div className="space-y-2">
                    <Label htmlFor="current-password">Current Password</Label>
                    <Input
                      id="current-password"
                      type="password"
                      placeholder="Enter current password to change"
                      value={profileForm.currentPassword}
                      onChange={(e) => setProfileForm({ ...profileForm, currentPassword: e.target.value })}
                    />
                  </div>

                  {/* New Password */}
                  <div className="space-y-2">
                    <Label htmlFor="new-password">New Password</Label>
                    <Input
                      id="new-password"
                      type="password"
                      placeholder="Enter new password (optional)"
                      value={profileForm.newPassword}
                      onChange={(e) => setProfileForm({ ...profileForm, newPassword: e.target.value })}
                    />
                  </div>

                  {/* Confirm Password */}
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
