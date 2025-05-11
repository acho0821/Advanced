"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, ExternalLink, RefreshCw } from "lucide-react"
import Link from "next/link"
import { getSupabaseBrowserClient } from "@/lib/supabase"

export default function InitializeStorage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [rlsError, setRlsError] = useState(false)
  const [bucketInfo, setBucketInfo] = useState<any>(null)
  const { toast } = useToast()
  const supabase = getSupabaseBrowserClient()

  // Check bucket status on component mount
  useEffect(() => {
    checkBucketStatus()
  }, [])

  const checkBucketStatus = async () => {
    try {
      setLoading(true)
      setError(null)

      // Check if bucket exists
      const { data: buckets, error } = await supabase.storage.listBuckets()

      if (error) {
        setError("Error checking buckets: " + error.message)
        return
      }

      // Check for both possible bucket names
      const bucket = buckets.find(
        (b) => b.name === "strata-documents" || b.name === "strata_documents" || b.name === "stratadocuments",
      )

      if (bucket) {
        setBucketInfo(bucket)
        toast({
          title: "Bucket Found",
          description: `Found bucket: ${bucket.name}`,
        })
      } else {
        setError("No storage bucket found. Please initialize it.")
      }
    } catch (e: any) {
      setError("Error checking bucket status: " + e.message)
    } finally {
      setLoading(false)
    }
  }

  const handleInitialize = async () => {
    try {
      setLoading(true)
      setError(null)
      setRlsError(false)

      // Try GET method first
      const response = await fetch("/api/storage/init-bucket", {
        method: "GET",
      })

      const data = await response.json()

      if (!response.ok) {
        // Check if this is an RLS policy error
        if (
          data.error &&
          (data.error.includes("policy") ||
            data.error.includes("permission") ||
            data.error.includes("violates row-level security"))
        ) {
          setRlsError(true)
          throw new Error(
            "Row-level security policy is preventing bucket creation. You may need to create the bucket manually in the Supabase dashboard.",
          )
        }

        throw new Error(data.error || `Failed with status: ${response.status}`)
      }

      toast({
        title: "Success",
        description: data.message || "Bucket initialized successfully",
      })

      // Check bucket status after initialization
      await checkBucketStatus()
    } catch (error: any) {
      console.error("Error initializing storage:", error)
      setError(error.message || "Failed to initialize storage bucket")
      toast({
        title: "Error",
        description: error.message || "Failed to initialize storage bucket",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      {bucketInfo && (
        <Alert className="mb-4">
          <AlertTitle>Bucket Found: {bucketInfo.name}</AlertTitle>
          <AlertDescription>
            The storage bucket exists in Supabase. If you're still seeing errors, try refreshing the page.
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error}
            {rlsError && (
              <div className="mt-2">
                <p className="font-semibold">Workaround:</p>
                <ol className="list-decimal pl-5 mt-1">
                  <li>Go to your Supabase dashboard</li>
                  <li>Navigate to Storage</li>
                  <li>Create a new bucket named "strata-documents"</li>
                  <li>Set the bucket to public</li>
                  <li>Return here and refresh the page</li>
                </ol>
                <Link
                  href="https://app.supabase.com/project/_/storage/buckets"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-blue-600 hover:underline mt-2"
                >
                  Open Supabase Dashboard
                  <ExternalLink className="h-3 w-3 ml-1" />
                </Link>
              </div>
            )}
          </AlertDescription>
        </Alert>
      )}

      <div className="flex gap-2">
        <Button onClick={handleInitialize} disabled={loading}>
          {loading ? "Initializing..." : "Initialize Storage Bucket"}
        </Button>
        <Button variant="outline" onClick={checkBucketStatus} disabled={loading}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Check Bucket Status
        </Button>
      </div>
    </div>
  )
}
