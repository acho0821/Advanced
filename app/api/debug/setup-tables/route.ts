import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"

export async function GET() {
  try {
    const supabase = createServerClient()
    const results: any = {}

    // Check if maintenance_requests table exists
    const { data: tableInfo, error: tableError } = await supabase.from("maintenance_requests").select("id").limit(1)

    results.tableCheck = {
      success: !tableError,
      error: tableError?.message,
    }

    // If table doesn't exist, create it
    if (tableError && tableError.code === "PGRST204") {
      const { error: createError } = await supabase.rpc("create_maintenance_table")

      results.tableCreation = {
        success: !createError,
        error: createError?.message,
      }
    }

    // Check if documents table exists
    const { data: docTableInfo, error: docTableError } = await supabase.from("documents").select("id").limit(1)

    results.docTableCheck = {
      success: !docTableError,
      error: docTableError?.message,
    }

    // If documents table doesn't exist, create it
    if (docTableError && docTableError.code === "PGRST204") {
      const { error: createDocError } = await supabase.rpc("create_documents_table")

      results.docTableCreation = {
        success: !createDocError,
        error: createDocError?.message,
      }
    }

    return NextResponse.json({
      success: true,
      results,
    })
  } catch (error: any) {
    console.error("Error setting up tables:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
