import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"

export async function GET() {
  try {
    const supabase = createServerClient()

    // Check bucket status
    const { data: buckets, error: listError } = await supabase.storage.listBuckets()

    if (listError) {
      throw listError
    }

    const bucket = buckets.find((b) => b.name === "strata-documents")

    // Try to upload a test file
    let uploadTest = { success: false, error: null }

    if (bucket) {
      try {
        const testBlob = new Blob(["test"], { type: "text/plain" })
        const { data, error } = await supabase.storage
          .from("strata-documents")
          .upload(`test-${Date.now()}.txt`, testBlob)

        uploadTest = {
          success: !error,
          error: error ? error.message : null,
        }
      } catch (e: any) {
        uploadTest = {
          success: false,
          error: e.message,
        }
      }
    }

    return NextResponse.json({
      buckets,
      bucket,
      uploadTest,
      serviceRole: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      url: process.env.SUPABASE_URL,
    })
  } catch (error: any) {
    console.error("Storage debug error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
