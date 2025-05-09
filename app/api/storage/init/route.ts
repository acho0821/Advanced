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

    const bucketExists = buckets.some((bucket) => bucket.name === "strata-documents")

    if (!bucketExists) {
      // Create the bucket if it doesn't exist
      const { error: createError } = await supabase.storage.createBucket("strata-documents", {
        public: true,
        fileSizeLimit: 52428800, // 50MB
      })

      if (createError) {
        throw createError
      }

      // Set bucket public
      const { error: updateError } = await supabase.storage.updateBucket("strata-documents", {
        public: true,
      })

      if (updateError) {
        throw updateError
      }
    }

    return NextResponse.json({
      success: true,
      message: bucketExists ? "Bucket already exists" : "Bucket created successfully",
    })
  } catch (error: any) {
    console.error("Error initializing storage:", error)
    return NextResponse.json({ error: error.message || "Failed to initialize storage" }, { status: 500 })
  }
}
