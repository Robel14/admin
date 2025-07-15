import { type NextRequest, NextResponse } from "next/server"

export async function GET() {
  // Mock video links data
  const videos = [
    {
      id: "1",
      title: "Heal Ethiopia Introduction",
      url: "https://youtube.com/watch?v=example1",
      description: "Introduction video",
    },
    {
      id: "2",
      title: "Community Impact",
      url: "https://youtube.com/watch?v=example2",
      description: "Community impact showcase",
    },
  ]

  return NextResponse.json({ videos })
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const videoId = searchParams.get("id")

    if (!videoId) {
      return NextResponse.json({ error: "Video ID required" }, { status: 400 })
    }

    // In a real application, you would remove the video link from your database

    return NextResponse.json({ success: true, message: "Video link deleted" })
  } catch (error) {
    return NextResponse.json({ error: "Delete failed" }, { status: 500 })
  }
}
