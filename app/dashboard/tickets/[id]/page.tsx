import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { TicketDetailsUser } from "@/components/ticket-details-user"

export default async function UserTicketDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
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
    redirect("/dashboard")
  }

  // Check if user owns this ticket
  if (ticket.created_by !== user.id) {
    redirect("/dashboard")
  }

  // Get comments for this ticket
  const { data: comments } = await supabase
    .from("comments")
    .select(
      `
      *,
      user:profiles!comments_user_id_fkey(id, full_name, email, role)
    `,
    )
    .eq("ticket_id", id)
    .order("created_at", { ascending: true })

  return <TicketDetailsUser ticket={ticket} comments={comments || []} currentUserId={user.id} />
}
