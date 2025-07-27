import { redirect } from "next/navigation"

export default function HomePage() {
  // Redirect to the garage setup page
  redirect("/garage-setup")
}
