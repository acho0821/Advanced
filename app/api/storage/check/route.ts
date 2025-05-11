import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"

export async function GET() {
  try {
    const supabase = createServerClient()
    const results: any = {}

    // Check if service role key is available
    results.serviceRoleAvailable = !!process.env.SUPABASE_SERVICE_ROLE_KEY
    results.supabaseUrl = process.env.SUPABASE_URL

    // Check if we can list buckets
    try {
      const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()

      results.bucketsListing = {
        success: !bucketsError,
        count: buckets?.length || 0,
        error: bucketsError?.message,
      }

      if (!bucketsError) {
        results.buckets = buckets

        // Check if our bucket exists
        const bucket = buckets.find((b) => b.name === "strata-documents")
        results.bucketExists = !!bucket

        if (bucket) {
          results.bucket = bucket

          // Try to list files in the bucket
          try {
            const { data: files, error: filesError } = await supabase.storage.from("strata-documents").list()

            results.filesListing = {
              success: !filesError,
              count: files?.length || 0,
              error: filesError?.message,
            }

            if (!filesError) {
              results.files = files
            }
          } catch (e: any) {
            results.filesListing = {
              success: false,
              error: e.message,
            }
          }
        }
      }
    } catch (e: any) {
      results.bucketsListing = {
        success: false,
        error: e.message,
      }
    }

    return NextResponse.json(results)
  } catch (error: any) {
    console.error("Error checking storage:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
