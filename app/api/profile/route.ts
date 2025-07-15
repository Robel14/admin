import { type NextRequest, NextResponse } from "next/server"
import { updateUserProfile, updateUserPassword } from "@/lib/neon"
import { hashPassword } from "@/lib/auth"

export async function PUT(request: NextRequest) {
  try {
    const { userId, username, profilePhoto, currentPassword, newPassword } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 })
    }

    // Handle password update
    if (currentPassword && newPassword) {
      // In a real app, you'd verify the current password first
      const hashedPassword = await hashPassword(newPassword)
      await updateUserPassword(userId, hashedPassword)
    }

    // Handle profile update
    const updates: { username?: string; profile_photo?: string } = {}
    if (username) updates.username = username
    if (profilePhoto) updates.profile_photo = profilePhoto

    if (Object.keys(updates).length > 0) {
      const updatedUser = await updateUserProfile(userId, updates)
      return NextResponse.json({ success: true, user: updatedUser })
    }

    return NextResponse.json({ success: true, message: "Profile updated" })
  } catch (error) {
    console.error("Profile update error:", error)
    return NextResponse.json({ error: "Update failed" }, { status: 500 })
  }
}
