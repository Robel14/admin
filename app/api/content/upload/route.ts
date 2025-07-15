import { type NextRequest, NextResponse } from "next/server"
import { hasuraClient } from "@/lib/hasura"

const INSERT_CONTENT_WITH_FILE = `
  mutation InsertContentWithFile($object: content_insert_input!) {
    insert_content_one(object: $object) {
      id
      title
      file_url
      category
      created_at
    }
  }
`

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    const category = formData.get("category") as string

    if (!file || !category) {
      return NextResponse.json({ error: "File and category are required" }, { status: 400 })
    }

    // In a real application, you would upload to cloud storage (Vercel Blob, AWS S3, etc.)
    // For now, we'll create a mock file URL based on category
    const fileUrl = `/uploads/${category}/${Date.now()}-${file.name}`
    const thumbnailUrl = file.type.includes("image") ? fileUrl : `/thumbnails/${category}/default.jpg`

    // Create content entry in database
    const contentData = {
      title: file.name.replace(/\.[^/.]+$/, ""), // Remove file extension
      description: `Uploaded ${category} file`,
      content: `File uploaded to ${category} section`,
      category,
      file_url: fileUrl,
      thumbnail_url: thumbnailUrl,
      published: true,
      created_by: "1", // Current user ID
    }

    const data = await hasuraClient.request(INSERT_CONTENT_WITH_FILE, { object: contentData })

    // Here you would also sync with your main website's API
    await syncWithMainWebsite(category, data.insert_content_one)

    return NextResponse.json({ success: true, content: data.insert_content_one })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }
}

// Function to sync content with main website
async function syncWithMainWebsite(category: string, content: any) {
  try {
    // This would make an API call to your main website to update the respective section
    const mainWebsiteUrl = "https://www.ethiopia-vitality.org"
    const syncEndpoint = `${mainWebsiteUrl}/api/sync/${category}`

    const response = await fetch(syncEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.MAIN_WEBSITE_API_KEY}`, // Add this to your env
      },
      body: JSON.stringify({
        action: "create",
        data: content,
      }),
    })

    if (!response.ok) {
      console.error("Failed to sync with main website:", response.statusText)
    }
  } catch (error) {
    console.error("Sync error:", error)
  }
}
