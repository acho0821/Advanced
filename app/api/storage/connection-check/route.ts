import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"
import { createClient } from "@supabase/supabase-js"

export async function GET() {
  try {
    // Check environment variables
    const envInfo = {
      supabaseUrl: process.env.SUPABASE_URL ? "Set" : "Not set",
      supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY ? "Set" : "Not set",
      supabaseAnonKey: process.env.SUPABASE_ANON_KEY ? "Set" : "Not set",
      nextPublicSupabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? "Set" : "Not set",
      nextPublicSupabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "Set" : "Not set",
    }

    // Create server client
    const serverClient = createServerClient()

    // Try to list buckets with server client
    const { data: serverBuckets, error: serverError } = await serverClient.storage.listBuckets()

    // Create a browser-like client for comparison
    const browserLikeClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || "",
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
    )

    // Try to list buckets with browser-like client
    const { data: browserBuckets, error: browserError } = await browserLikeClient.storage.listBuckets()

    return NextResponse.json({
      envInfo,
      serverClient: {
        buckets: serverBuckets || [],
        error: serverError?.message,
      },
      browserClient: {
        buckets: browserBuckets || [],
        error: browserError?.message,
      },
      // Redacted URLs for security
      urls: {
        serverUrl: process.env.SUPABASE_URL ? process.env.SUPABASE_URL.split("://")[0] + "://..." : null,
        browserUrl: process.env.NEXT_PUBLIC_SUPABASE_URL
          ? process.env.NEXT_PUBLIC_SUPABASE_URL.split("://")[0] + "://..."
          : null,
      },
    })
  } catch (error: any) {
    console.error("Connection check error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
