import { type NextRequest, NextResponse } from "next/server"
import { hasuraClient } from "@/lib/hasura"

const UPDATE_CONTENT = `
  mutation UpdateContent($id: uuid!, $updates: content_set_input!) {
    update_content_by_pk(pk_columns: {id: $id}, _set: $updates) {
      id
      title
      description
      content
      category
      published
      updated_at
    }
  }
`

const DELETE_CONTENT = `
  mutation DeleteContent($id: uuid!) {
    delete_content_by_pk(id: $id) {
      id
      category
    }
  }
`

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const { title, description, content, category, published } = body

    const updates = {
      title,
      description,
      content,
      category,
      published,
      updated_at: new Date().toISOString(),
    }

    const data = await hasuraClient.request(UPDATE_CONTENT, {
      id: params.id,
      updates,
    })

    // Sync with main website
    await syncWithMainWebsite("update", data.update_content_by_pk)

    return NextResponse.json({ success: true, content: data.update_content_by_pk })
  } catch (error) {
    console.error("Error updating content:", error)
    return NextResponse.json({ error: "Failed to update content" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const data = await hasuraClient.request(DELETE_CONTENT, { id: params.id })

    // Sync with main website
    await syncWithMainWebsite("delete", data.delete_content_by_pk)

    return NextResponse.json({ success: true, message: "Content deleted" })
  } catch (error) {
    console.error("Error deleting content:", error)
    return NextResponse.json({ error: "Failed to delete content" }, { status: 500 })
  }
}

async function syncWithMainWebsite(action: string, content: any) {
  try {
    const mainWebsiteUrl = "https://www.ethiopia-vitality.org"
    const syncEndpoint = `${mainWebsiteUrl}/api/sync/${content.category}`

    await fetch(syncEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.MAIN_WEBSITE_API_KEY}`,
      },
      body: JSON.stringify({
        action,
        data: content,
      }),
    })
  } catch (error) {
    console.error("Sync error:", error)
  }
}
