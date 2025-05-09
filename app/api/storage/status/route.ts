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

    const bucket = buckets.find((b) => b.name === "strata-documents")

    if (!bucket) {
      return NextResponse.json({
        exists: false,
        message: "Bucket does not exist",
      })
    }

    // Test upload permission
    const testFile = new Blob(["test"], { type: "text/plain" })
    const testFileName = `test-${Date.now()}.txt`

    const { error: uploadError } = await supabase.storage.from("strata-documents").upload(testFileName, testFile)

    const canUpload = !uploadError

    // Clean up test file
    if (canUpload) {
      await supabase.storage.from("strata-documents").remove([testFileName])
    }

    return NextResponse.json({
      exists: true,
      public: bucket.public,
      canUpload,
      message: canUpload ? "Storage is working correctly" : "Upload permission issue",
      error: uploadError ? uploadError.message : null,
    })
  } catch (error: any) {
    console.error("Error checking storage status:", error)
    return NextResponse.json(
      {
        error: error.message || "Failed to check storage status",
      },
      { status: 500 },
    )
  }
}
