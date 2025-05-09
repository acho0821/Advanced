"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { getSupabaseBrowserClient } from "@/lib/supabase"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle, AlertCircle } from "lucide-react"

export default function MakeAdminPage() {
  const [userId, setUserId] = useState("")
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const { toast } = useToast()
  const supabase = getSupabaseBrowserClient()

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession()
      if (data.session) {
        setCurrentUser(data.session.user)
      }
    }

    checkSession()
  }, [supabase.auth])

  const handleMakeAdmin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setSuccess(null)
    setError(null)

    try {
      // First, try to find the user by email if provided
      if (email) {
        const { data: userData, error: userError } = await supabase
          .from("profiles")
          .select("id")
          .eq("email", email)
          .single()

        if (userError) {
          throw new Error(`User with email ${email} not found`)
        }

        if (userData) {
          setUserId(userData.id)
        }
      }

      // Update the user's role to admin
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ role: "admin" })
        .eq("id", userId || currentUser?.id)

      if (updateError) {
        throw updateError
      }

      setSuccess(`User has been successfully made an admin`)
      toast({
        title: "Success",
        description: "User role updated to admin",
      })
    } catch (error: any) {
      console.error("Error making admin:", error)
      setError(error.message || "An error occurred")
      toast({
        title: "Error",
        description: error.message || "Failed to update user role",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleMakeSelfAdmin = async () => {
    if (!currentUser) {
      setError("You must be logged in")
      return
    }

    setLoading(true)
    setSuccess(null)
    setError(null)

    try {
      // Update the current user's role to admin
      const { error: updateError } = await supabase.from("profiles").update({ role: "admin" }).eq("id", currentUser.id)

      if (updateError) {
        throw updateError
      }

      setSuccess("Your account has been successfully made an admin")
      toast({
        title: "Success",
        description: "Your role has been updated to admin",
      })
    } catch (error: any) {
      console.error("Error making self admin:", error)
      setError(error.message || "An error occurred")
      toast({
        title: "Error",
        description: error.message || "Failed to update your role",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-6">Make Admin</h1>

      {success && (
        <Alert className="mb-6">
          <CheckCircle className="h-4 w-4" />
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Make Yourself Admin</CardTitle>
            <CardDescription>Update your own account to have admin privileges</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              This will update your current account to have administrator privileges, allowing you to access all admin
              features.
            </p>
            <Button onClick={handleMakeSelfAdmin} disabled={loading}>
              {loading ? "Updating..." : "Make Me Admin"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Make Another User Admin</CardTitle>
            <CardDescription>Update another user's account to have admin privileges</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleMakeAdmin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="userId">User ID (UUID)</Label>
                <Input
                  id="userId"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  placeholder="User's UUID"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Or Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="user@example.com"
                />
              </div>

              <Button type="submit" disabled={loading || (!userId && !email)}>
                {loading ? "Updating..." : "Make Admin"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
