import { type NextRequest, NextResponse } from "next/server"
import { hasuraClient } from "@/lib/hasura"

const INSERT_CONTENT = `
  mutation InsertContent($object: content_insert_input!) {
    insert_content_one(object: $object) {
      id
      title
      description
      content
      category
      published
      created_at
      updated_at
    }
  }
`

const GET_CONTENT = `
  query GetContent($category: String) {
    content(where: {category: {_eq: $category}}, order_by: {created_at: desc}) {
      id
      title
      description
      content
      category
      file_url
      thumbnail_url
      published
      created_at
      updated_at
    }
  }
`

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")

    const data = await hasuraClient.request(GET_CONTENT, { category })
    return NextResponse.json({ content: data.content })
  } catch (error) {
    console.error("Error fetching content:", error)
    return NextResponse.json({ error: "Failed to fetch content" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, description, content, category, published } = body

    const contentData = {
      title,
      description,
      content,
      category,
      published: published ?? true,
      created_by: "1", // Current user ID
    }

    const data = await hasuraClient.request(INSERT_CONTENT, { object: contentData })
    return NextResponse.json({ success: true, content: data.insert_content_one })
  } catch (error) {
    console.error("Error creating content:", error)
    return NextResponse.json({ error: "Failed to create content" }, { status: 500 })
  }
}
