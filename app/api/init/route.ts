import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"

export async function GET() {
  try {
    const supabase = createServerClient()

    // Create a new storage bucket if it doesn't exist
    const { error: bucketError } = await supabase.storage.createBucket("strata-documents", {
      public: true, // Make the bucket public
      fileSizeLimit: 10485760, // 10MB
    })

    if (bucketError && bucketError.message !== "Bucket already exists") {
      console.error("Error creating bucket:", bucketError)
    }

    return NextResponse.json({
      success: true,
      message: "Initialization completed successfully",
      details: {
        bucket:
          bucketError?.message === "Bucket already exists" ? "Bucket already exists" : "Bucket created successfully",
      },
    })
  } catch (error: any) {
    console.error("Initialization error:", error)
    return NextResponse.json({ error: error.message || "Initialization failed" }, { status: 500 })
  }
}
