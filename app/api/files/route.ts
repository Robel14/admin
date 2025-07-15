import { type NextRequest, NextResponse } from "next/server"
import { insertFile, deleteFileById } from "@/lib/neon"

export async function GET() {
  try {
    const files = await fetch("/api/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-hasura-admin-secret": "8z865XNRXKMg2TJCRzSBj2FZUDKEpgMfqdbJckBh0vpzDk2z7tdQ8X9dVOXEqM9P",
      },
      body: JSON.stringify({
        query: `
          query GetFiles {
            files {
              id
              name
              original_name
              file_type
              file_size
              file_url
              created_at
            }
          }
        `,
      }),
    })

    const result = await files.json()
    return NextResponse.json({ files: result.data.files })
  } catch (error) {
    console.error("Error fetching files:", error)
    return NextResponse.json({ error: "Failed to fetch files" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // In a real application, you would upload to cloud storage first
    // For now, we'll create a mock file URL
    const fileUrl = `/uploads/${Date.now()}-${file.name}`

    const fileData = {
      name: `${Date.now()}-${file.name}`,
      original_name: file.name,
      file_type: file.type,
      file_size: file.size,
      file_url: fileUrl,
      uploaded_by: "1", // Current user ID
    }

    const newFile = await insertFile(fileData)
    return NextResponse.json({ success: true, file: newFile })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const fileId = searchParams.get("id")

    if (!fileId) {
      return NextResponse.json({ error: "File ID required" }, { status: 400 })
    }

    await deleteFileById(fileId)
    return NextResponse.json({ success: true, message: "File deleted" })
  } catch (error) {
    console.error("Delete error:", error)
    return NextResponse.json({ error: "Delete failed" }, { status: 500 })
  }
}
