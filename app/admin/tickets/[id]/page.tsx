import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { TicketDetailsAdmin } from "@/components/ticket-details-admin"

export default async function AdminTicketDetailsPage({ params }: { params: Promise<{ id: string }> }) {
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

  // Get ticket details
  const { data: ticket } = await supabase
    .from("tickets")
    .select(
      `
      *,
      created_by_profile:profiles!tickets_created_by_fkey(id, full_name, email),
      assigned_to_profile:profiles!tickets_assigned_to_fkey(id, full_name, email)
    `,
    )
    .eq("id", id)
    .single()

  if (!ticket) {
    redirect("/admin")
  }

  // Get all agents for assignment
  const { data: agents } = await supabase.from("profiles").select("id, full_name, email").in("role", ["agent", "admin"])

  return <TicketDetailsAdmin ticket={ticket} agents={agents || []} />
}
