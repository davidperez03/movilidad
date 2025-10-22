import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { UserDetailsAdmin } from "@/components/user-details-admin"

export default async function AdminUserDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Get user profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  // Check if user is admin
  if (profile?.role !== "admin") {
    redirect("/dashboard")
  }

  // Get user details
  const { data: userProfile } = await supabase.from("profiles").select("*").eq("id", id).single()

  if (!userProfile) {
    redirect("/admin")
  }

  // Get user's tickets
  const { data: userTickets } = await supabase
    .from("tickets")
    .select("*")
    .eq("created_by", id)
    .order("created_at", { ascending: false })

  return <UserDetailsAdmin userProfile={userProfile} tickets={userTickets || []} />
}
