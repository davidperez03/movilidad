import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { TicketDetailsAgent } from "@/components/ticket-details-agent"

export default async function AgentTicketDetailsPage({ params }: { params: Promise<{ id: string }> }) {
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

  // Check if user is agent or admin
  if (profile?.role !== "agent" && profile?.role !== "admin") {
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
    redirect("/agent")
  }

  // Get all agents for assignment
  const { data: agents } = await supabase.from("profiles").select("id, full_name, email").in("role", ["agent", "admin"])

  return <TicketDetailsAgent ticket={ticket} agents={agents || []} currentUserId={user.id} />
}
