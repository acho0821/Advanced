import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"

export async function POST() {
  try {
    const supabase = createServerClient()

    // Check if bucket exists
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()

    if (bucketsError) {
      return NextResponse.json({ error: bucketsError.message }, { status: 500 })
    }

    const bucket = buckets.find((b) => b.name === "strata-documents")

    if (bucket) {
      // Update bucket to be public
      const { error: updateError } = await supabase.storage.updateBucket("strata-documents", {
        public: true,
        fileSizeLimit: 52428800, // 50MB
      })

      if (updateError) {
        return NextResponse.json({ error: updateError.message }, { status: 500 })
      }

      return NextResponse.json({ message: "Bucket updated successfully", bucket })
    } else {
      // Create bucket
      const { data, error: createError } = await supabase.storage.createBucket("strata-documents", {
        public: true,
        fileSizeLimit: 52428800, // 50MB
      })

      if (createError) {
        return NextResponse.json({ error: createError.message }, { status: 500 })
      }

      return NextResponse.json({ message: "Bucket created successfully", data })
    }
  } catch (error: any) {
    console.error("Error initializing storage bucket:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
