"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function ConnectionCheck() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const checkConnection = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch("/api/storage/connection-check")
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to check connection")
      }

      setResult(data)

      if (data.serverClient.error || data.browserClient.error) {
        toast({
          title: "Connection Issues Detected",
          description: "There are issues with the Supabase connection. See details below.",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Connection Check",
          description: "Connection check completed. See results below.",
        })
      }
    } catch (error: any) {
      console.error("Error checking connection:", error)
      setError(error.message)
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Supabase Connection Check</CardTitle>
      </CardHeader>
      <CardContent>
        <Button onClick={checkConnection} disabled={loading}>
          {loading ? "Checking..." : "Check Connection"}
        </Button>

        {error && (
          <Alert variant="destructive" className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {result && (
          <div className="mt-4 space-y-4">
            <div>
              <h3 className="font-medium">Environment Variables:</h3>
              <ul className="list-disc pl-5 mt-2">
                {Object.entries(result.envInfo).map(([key, value]) => (
                  <li key={key} className="flex items-center gap-2">
                    {key}:{" "}
                    {value === "Set" ? (
                      <>
                        <CheckCircle className="h-4 w-4 text-green-500" /> Set
                      </>
                    ) : (
                      <>
                        <AlertCircle className="h-4 w-4 text-red-500" /> Not Set
                      </>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-medium">Server Client:</h3>
              {result.serverClient.error ? (
                <Alert variant="destructive" className="mt-2">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{result.serverClient.error}</AlertDescription>
                </Alert>
              ) : (
                <div className="mt-2">
                  <p>Buckets found: {result.serverClient.buckets.length}</p>
                  {result.serverClient.buckets.length > 0 && (
                    <ul className="list-disc pl-5 mt-1">
                      {result.serverClient.buckets.map((bucket: any) => (
                        <li key={bucket.id}>{bucket.name}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>

            <div>
              <h3 className="font-medium">Browser Client:</h3>
              {result.browserClient.error ? (
                <Alert variant="destructive" className="mt-2">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{result.browserClient.error}</AlertDescription>
                </Alert>
              ) : (
                <div className="mt-2">
                  <p>Buckets found: {result.browserClient.buckets.length}</p>
                  {result.browserClient.buckets.length > 0 && (
                    <ul className="list-disc pl-5 mt-1">
                      {result.browserClient.buckets.map((bucket: any) => (
                        <li key={bucket.id}>{bucket.name}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>

            <div>
              <h3 className="font-medium">URLs:</h3>
              <p>Server URL: {result.urls.serverUrl || "Not set"}</p>
              <p>Browser URL: {result.urls.browserUrl || "Not set"}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
