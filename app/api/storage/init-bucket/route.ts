import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"

export async function GET() {
  try {
    const supabase = createServerClient()

    // Check if bucket exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets()

    if (listError) {
      throw listError
    }

    const bucketExists = buckets?.some((bucket) => bucket.name === "strata-documents")

    if (!bucketExists) {
      // Create the bucket if it doesn't exist
      const { error: createError } = await supabase.storage.createBucket("strata-documents", {
        public: true,
        fileSizeLimit: 52428800, // 50MB
      })

      if (createError) {
        throw createError
      }
    } else {
      // Update bucket to ensure it's public
      const { error: updateError } = await supabase.storage.updateBucket("strata-documents", {
        public: true,
      })

      if (updateError) {
        throw updateError
      }
    }

    return NextResponse.json({
      success: true,
      message: bucketExists ? "Bucket updated successfully" : "Bucket created successfully",
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
