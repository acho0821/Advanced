"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getSupabaseBrowserClient } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"

export default function DebugUpload() {
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const supabase = getSupabaseBrowserClient()
  const { toast } = useToast()

  const runTests = async () => {
    setLoading(true)
    setResult(null)
    const results: any = {}

    try {
      // Test 1: Check bucket exists
      const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()
      results.buckets = {
        success: !bucketsError,
        data: buckets,
        error: bucketsError?.message,
      }

      const bucket = buckets?.find((b) => b.name === "strata-documents")
      results.bucketExists = !!bucket
      results.bucketDetails = bucket

      // Test 2: Try to upload a small test file
      if (bucket) {
        try {
          const testBlob = new Blob(["test content"], { type: "text/plain" })
          const testFileName = `test-${Date.now()}.txt`

          const { data: uploadData, error: uploadError } = await supabase.storage
            .from("strata-documents")
            .upload(testFileName, testBlob)

          results.testUpload = {
            success: !uploadError,
            data: uploadData,
            error: uploadError?.message,
          }

          // If upload succeeded, try to get URL and delete the test file
          if (!uploadError) {
            const { data: urlData } = supabase.storage.from("strata-documents").getPublicUrl(testFileName)

            results.publicUrl = {
              success: true,
              url: urlData.publicUrl,
            }

            // Clean up test file
            const { error: deleteError } = await supabase.storage.from("strata-documents").remove([testFileName])

            results.deleteTest = {
              success: !deleteError,
              error: deleteError?.message,
            }
          }
        } catch (e: any) {
          results.testUpload = {
            success: false,
            error: e.message,
          }
        }
      }

      // Test 3: Check user permissions
      const { data: session } = await supabase.auth.getSession()
      results.userSession = {
        exists: !!session?.session,
        user: session?.session?.user?.id,
      }

      setResult(results)

      if (results.testUpload?.success) {
        toast({
          title: "Test upload successful",
          description: "The storage system appears to be working correctly",
        })
      } else {
        toast({
          title: "Test upload failed",
          description: results.testUpload?.error || "Unknown error",
          variant: "destructive",
        })
      }
    } catch (error: any) {
      setResult({ error: error.message })
      toast({
        title: "Error running tests",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Debug Document Upload</CardTitle>
      </CardHeader>
      <CardContent>
        <Button onClick={runTests} disabled={loading}>
          {loading ? "Running Tests..." : "Run Diagnostic Tests"}
        </Button>

        {result && (
          <div className="mt-4 p-4 bg-slate-100 rounded-md overflow-auto max-h-96">
            <pre className="text-xs">{JSON.stringify(result, null, 2)}</pre>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
