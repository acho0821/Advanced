import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"

export async function POST(request: Request) {
  try {
    const { id } = await request.json()

    if (!id) {
      return NextResponse.json({ error: "Missing request ID" }, { status: 400 })
    }

    const supabase = createServerClient()

    // Delete the maintenance request using server client with admin privileges
    const { error } = await supabase.from("maintenance_requests").delete().eq("id", id)

    if (error) {
      console.error("Error deleting maintenance request:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Error in delete API:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
