import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"

// Support both GET and POST methods for flexibility
export async function GET() {
  return handleInitBucket()
}

export async function POST() {
  return handleInitBucket()
}

async function handleInitBucket() {
  try {
    console.log("Starting storage bucket initialization")
    const supabase = createServerClient()

    // Check environment variables
    const envInfo = {
      supabaseUrl: !!process.env.SUPABASE_URL,
      supabaseServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      supabaseAnonKey: !!process.env.SUPABASE_ANON_KEY,
    }
    console.log("Environment variables check:", envInfo)

    // Check if bucket exists
    console.log("Checking if bucket exists")
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()

    if (bucketsError) {
      console.error("Error listing buckets:", bucketsError)

      // If we can't list buckets due to permissions, try to create the bucket directly
      // This might work if the bucket doesn't exist yet
      if (bucketsError.message.includes("policy") || bucketsError.message.includes("permission")) {
        console.log("Permission error listing buckets, trying direct bucket creation")
        return await attemptDirectBucketCreation(supabase)
      }

      return NextResponse.json(
        {
          error: bucketsError.message,
          details: "Error listing buckets. This may be a permissions issue.",
          envInfo,
        },
        { status: 500 },
      )
    }

    console.log("Buckets found:", buckets?.length || 0)
    const bucket = buckets?.find((b) => b.name === "strata-documents")

    if (bucket) {
      console.log("Bucket exists, updating settings")
      try {
        // Update bucket to be public
        const { error: updateError } = await supabase.storage.updateBucket("strata-documents", {
          public: true,
          fileSizeLimit: 52428800, // 50MB
        })

        if (updateError) {
          console.error("Error updating bucket:", updateError)
          return NextResponse.json(
            {
              error: updateError.message,
              details: "Error updating bucket settings. This may be a permissions issue.",
              envInfo,
            },
            { status: 500 },
          )
        }

        return NextResponse.json({
          message: "Bucket updated successfully",
          bucket,
          envInfo,
        })
      } catch (updateErr: any) {
        console.error("Exception updating bucket:", updateErr)
        return NextResponse.json(
          {
            error: updateErr.message,
            details: "Exception updating bucket settings.",
            envInfo,
          },
          { status: 500 },
        )
      }
    } else {
      console.log("Bucket does not exist, creating new bucket")
      return await attemptDirectBucketCreation(supabase)
    }
  } catch (error: any) {
    console.error("Error initializing storage bucket:", error)
    return NextResponse.json(
      {
        error: error.message || "Unknown error occurred",
        stack: error.stack,
        details: "Unexpected error during bucket initialization.",
      },
      { status: 500 },
    )
  }
}

async function attemptDirectBucketCreation(supabase: any) {
  try {
    // Create bucket with explicit options
    const { data, error: createError } = await supabase.storage.createBucket("strata-documents", {
      public: true,
      fileSizeLimit: 52428800, // 50MB
    })

    if (createError) {
      console.error("Error creating bucket:", createError)

      // If we can't create the bucket due to RLS, provide a helpful message
      if (createError.message.includes("policy") || createError.message.includes("permission")) {
        return NextResponse.json(
          {
            error: createError.message,
            details:
              "Row-level security policy is preventing bucket creation. Please check your Supabase permissions or use the Supabase dashboard to create the bucket manually.",
            workaround: "You can create the 'strata-documents' bucket manually in the Supabase dashboard.",
          },
          { status: 403 },
        )
      }

      return NextResponse.json(
        {
          error: createError.message,
          details: "Error creating bucket.",
        },
        { status: 500 },
      )
    }

    return NextResponse.json({
      message: "Bucket created successfully",
      data,
    })
  } catch (createErr: any) {
    console.error("Exception creating bucket:", createErr)
    return NextResponse.json(
      {
        error: createErr.message,
        details: "Exception during bucket creation.",
      },
      { status: 500 },
    )
  }
}
