import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"

export async function POST() {
  try {
    console.log("Starting force bucket creation")
    const supabase = createServerClient()

    // Check environment variables
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json(
        {
          error: "Missing required environment variables",
          details: "SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set",
        },
        { status: 500 },
      )
    }

    // Force create the bucket with service role
    const { data, error } = await supabase.storage.createBucket("strata-documents", {
      public: true,
      fileSizeLimit: 52428800, // 50MB
    })

    if (error && error.message !== "Bucket already exists") {
      console.error("Error creating bucket:", error)
      return NextResponse.json(
        {
          error: error.message,
          details: "Failed to create bucket with service role",
        },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      message: error?.message === "Bucket already exists" ? "Bucket already exists" : "Bucket created successfully",
      data,
    })
  } catch (error: any) {
    console.error("Error in force bucket creation:", error)
    return NextResponse.json(
      {
        error: error.message || "Unknown error",
        details: "Unexpected error during force bucket creation",
        stack: error.stack,
      },
      { status: 500 },
    )
  }
}
