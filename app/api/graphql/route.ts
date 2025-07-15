import { type NextRequest, NextResponse } from "next/server"

const HASURA_ENDPOINT = "https://heal-db.hasura.app/v1/graphql"
const HASURA_ADMIN_SECRET = "8z865XNRXKMg2TJCRzSBj2FZUDKEpgMfqdbJckBh0vpzDk2z7tdQ8X9dVOXEqM9P"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const response = await fetch(HASURA_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-hasura-admin-secret": HASURA_ADMIN_SECRET,
      },
      body: JSON.stringify(body),
    })

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("GraphQL proxy error:", error)
    return NextResponse.json({ error: "GraphQL request failed" }, { status: 500 })
  }
}
