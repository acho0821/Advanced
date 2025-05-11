import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"

export async function GET() {
  try {
    const supabase = createServerClient()

    // Get environment variables (redacted for security)
    const envInfo = {
      supabaseUrl: process.env.SUPABASE_URL ? "Set" : "Not set",
      supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY ? "Set" : "Not set",
      supabaseAnonKey: process.env.SUPABASE_ANON_KEY ? "Set" : "Not set",
      nextPublicSupabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? "Set" : "Not set",
      nextPublicSupabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "Set" : "Not set",
    }

    // List all buckets
    const { data: buckets, error } = await supabase.storage.listBuckets()

    if (error) {
      return NextResponse.json(
        {
          success: false,
          error: error.message,
          envInfo,
        },
        { status: 500 },
      )
    }

    // Get detailed info about each bucket
    const bucketsInfo = await Promise.all(
      buckets.map(async (bucket) => {
        try {
          const { data: files, error: filesError } = await supabase.storage.from(bucket.name).list()
          return {
            ...bucket,
            filesCount: filesError ? "Error" : files?.length || 0,
            filesError: filesError?.message,
          }
        } catch (e: any) {
          return {
            ...bucket,
            filesCount: "Error",
            filesError: e.message,
          }
        }
      }),
    )

    return NextResponse.json({
      success: true,
      buckets: bucketsInfo,
      envInfo,
    })
  } catch (error: any) {
    console.error("Error debugging buckets:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        stack: error.stack,
      },
      { status: 500 },
    )
  }
}
