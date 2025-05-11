import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function POST(request: Request) {
  try {
    // Get credentials from request body
    const { url, serviceKey } = await request.json()

    if (!url || !serviceKey) {
      return NextResponse.json(
        {
          error: "Missing required parameters",
          details: "Both Supabase URL and service key are required.",
        },
        { status: 400 },
      )
    }

    // Create a Supabase client with the provided credentials
    const supabase = createClient(url, serviceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    // Try to create the bucket
    const { data, error } = await supabase.storage.createBucket("strata-documents", {
      public: true,
      fileSizeLimit: 52428800, // 50MB
    })

    if (error) {
      return NextResponse.json(
        {
          error: error.message,
          details: "Failed to create bucket with provided credentials.",
        },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      message: "Bucket created successfully",
      data,
    })
  } catch (error: any) {
    console.error("Error in manual bucket creation:", error)
    return NextResponse.json(
      {
        error: error.message || "Unknown error",
        details: "Unexpected error during manual bucket creation.",
      },
      { status: 500 },
    )
  }
}
