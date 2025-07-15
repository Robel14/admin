import { redirect } from "next/navigation"

export default function HomePage() {
  // Redirect root to admin panel
  redirect("/admin")
}
