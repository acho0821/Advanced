import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"

export async function GET() {
  try {
    const supabase = createServerClient()

    // Create the bucket if it doesn't exist
    const { data: buckets } = await supabase.storage.listBuckets()

    const bucketExists = buckets?.some((bucket) => bucket.name === "strata-documents")

    if (!bucketExists) {
      await supabase.storage.createBucket("strata-documents", {
        public: true,
      })
    }

    return NextResponse.json({
      success: true,
      message: bucketExists ? "Bucket already exists" : "Bucket created successfully",
    })
  } catch (error: any) {
    console.error("Error initializing storage bucket:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 },
    )
  }
}
