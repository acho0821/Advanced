import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"

export async function GET() {
  try {
    const supabase = createServerClient()

    // Create a new storage bucket if it doesn't exist
    const { data, error } = await supabase.storage.createBucket("strata-documents", {
      public: true, // Make the bucket public
      fileSizeLimit: 10485760, // 10MB
    })

    if (error && error.message !== "Bucket already exists") {
      throw error
    }

    return NextResponse.json({
      success: true,
      message: error?.message === "Bucket already exists" ? "Bucket already exists" : "Bucket created successfully",
    })
  } catch (error: any) {
    console.error("Error creating storage bucket:", error)
    return NextResponse.json({ error: error.message || "Failed to create storage bucket" }, { status: 500 })
  }
}
