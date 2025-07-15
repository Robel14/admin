import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const hostname = request.headers.get("host") || ""

  // Handle admin subdomain routing
  if (hostname.startsWith("admin.")) {
    // Redirect admin subdomain to /admin path
    if (!pathname.startsWith("/admin")) {
      return NextResponse.rewrite(new URL(`/admin${pathname}`, request.url))
    }
  }

  // Handle main website integration
  if (pathname.startsWith("/api/admin-sync/")) {
    // Add CORS headers for main website integration
    const response = NextResponse.next()
    response.headers.set("Access-Control-Allow-Origin", "https://www.ethiopia-vitality.org")
    response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
    response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Admin-Source")
    return response
  }

  // Protect admin routes
  if (pathname.startsWith("/admin")) {
    // In a real application, you would check for authentication tokens
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin-sync/:path*", "/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
