"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function InitializeStorage() {
  const [initializing, setInitializing] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const handleInitialize = async () => {
    try {
      setInitializing(true)
      setSuccess(null)
      setError(null)

      const response = await fetch("/api/storage/init-bucket")
      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || "Failed to initialize storage")
      }

      setSuccess(data.message)
      toast({
        title: "Success",
        description: data.message,
      })
    } catch (error: any) {
      console.error("Error initializing storage:", error)
      setError(error.message || "An error occurred")
      toast({
        title: "Error",
        description: error.message || "Failed to initialize storage",
        variant: "destructive",
      })
    } finally {
      setInitializing(false)
    }
  }

  return (
    <div className="mb-6">
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="mb-4">
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      <Button onClick={handleInitialize} disabled={initializing}>
        {initializing ? "Initializing..." : "Initialize Storage Bucket"}
      </Button>
    </div>
  )
}
