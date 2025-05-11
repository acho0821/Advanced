"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"

export default function InitializeStorage() {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleInitialize = async () => {
    try {
      setLoading(true)

      const response = await fetch("/api/storage/init-bucket", {
        method: "POST",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to initialize storage bucket")
      }

      const data = await response.json()

      toast({
        title: "Success",
        description: "Bucket updated successfully",
      })
    } catch (error: any) {
      console.error("Error initializing storage:", error)
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
    <Button onClick={handleInitialize} disabled={loading}>
      {loading ? "Initializing..." : "Initialize Storage Bucket"}
    </Button>
  )
}
