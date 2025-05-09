"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useRouter } from "next/navigation"
import { getSupabaseBrowserClient } from "@/lib/supabase"
import { CheckCircle, XCircle, AlertCircle } from "lucide-react"

export default function StorageDiagnosticPage() {
  const [user, setUser] = useState<any>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState<any>(null)
  const [initializing, setInitializing] = useState(false)
  const router = useRouter()
  const supabase = getSupabaseBrowserClient()

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession()

        if (error || !data.session) {
          router.push("/login")
          return
        }

        // Get user profile data
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", data.session.user.id)
          .single()

        if (profileError) {
          console.error("Error fetching profile:", profileError)
          return
        }

        setUser({
          ...data.session.user,
          profile: profileData,
        })

        setIsAdmin(profileData.role === "admin")

        if (profileData.role !== "admin") {
          router.push("/dashboard")
        }
      } catch (error) {
        console.error("Session error:", error)
        router.push("/login")
      } finally {
        setLoading(false)
      }
    }

    checkSession()
    checkStorageStatus()
  }, [router, supabase])

  const checkStorageStatus = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/storage/status")
      const data = await response.json()
      setStatus(data)
    } catch (error) {
      console.error("Error checking storage status:", error)
    } finally {
      setLoading(false)
    }
  }

  const initializeStorage = async () => {
    try {
      setInitializing(true)
      const response = await fetch("/api/storage/init")
      const data = await response.json()

      // Refresh status
      await checkStorageStatus()
    } catch (error) {
      console.error("Error initializing storage:", error)
    } finally {
      setInitializing(false)
    }
  }

  if (loading) {
    return <div className="container mx-auto p-8 text-center">Loading...</div>
  }

  if (!isAdmin) {
    return <div className="container mx-auto p-8 text-center">Redirecting to dashboard...</div>
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-6">Storage Diagnostic</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Storage Status</CardTitle>
          <CardDescription>Check the status of the document storage system</CardDescription>
        </CardHeader>
        <CardContent>
          {status ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="font-medium">Bucket Exists:</span>
                {status.exists ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
              </div>

              {status.exists && (
                <>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Public Access:</span>
                    {status.public ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="font-medium">Upload Permission:</span>
                    {status.canUpload ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )}
                  </div>
                </>
              )}

              {status.error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{status.error}</AlertDescription>
                </Alert>
              )}

              <div className="pt-2">
                <Button onClick={checkStorageStatus}>Refresh Status</Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-4">Loading storage status...</div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Initialize Storage</CardTitle>
          <CardDescription>Create or reset the document storage bucket</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            If you're having issues with document uploads, you can initialize the storage system. This will create the
            storage bucket if it doesn't exist or ensure it has the correct permissions.
          </p>
          <Button onClick={initializeStorage} disabled={initializing}>
            {initializing ? "Initializing..." : "Initialize Storage"}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
