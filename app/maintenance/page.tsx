"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { getSupabaseBrowserClient } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { CheckCircle } from "lucide-react"

interface MaintenanceRequest {
  id: string
  unit: string
  title: string
  description: string
  status: "pending" | "in-progress" | "completed"
  created_at: string
  updated_at: string
  user_id: string
}

export default function MaintenancePage() {
  const [requests, setRequests] = useState<MaintenanceRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [newRequest, setNewRequest] = useState({
    unit: "",
    title: "",
    description: "",
  })
  const { toast } = useToast()
  const supabase = getSupabaseBrowserClient()
  const router = useRouter()

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

        // Set default unit from user profile
        if (profileData.unit) {
          setNewRequest((prev) => ({ ...prev, unit: profileData.unit }))
        }
      } catch (error) {
        console.error("Session error:", error)
        router.push("/login")
      }
    }

    checkSession()
    fetchRequests()
  }, [router, supabase])

  const fetchRequests = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from("maintenance_requests")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) {
        throw error
      }

      setRequests(data || [])
    } catch (error) {
      console.error("Error fetching maintenance requests:", error)
      toast({
        title: "Error",
        description: "Failed to load maintenance requests",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setNewRequest((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to submit a maintenance request",
        variant: "destructive",
      })
      return
    }

    try {
      const { data, error } = await supabase
        .from("maintenance_requests")
        .insert({
          user_id: user.id,
          unit: newRequest.unit,
          title: newRequest.title,
          description: newRequest.description,
          status: "pending",
        })
        .select()

      if (error) {
        throw error
      }

      toast({
        title: "Success",
        description: "Maintenance request submitted successfully",
      })

      // Reset form
      setNewRequest({
        unit: user.profile?.unit || "",
        title: "",
        description: "",
      })

      // Refresh requests list
      fetchRequests()
    } catch (error: any) {
      console.error("Error submitting maintenance request:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to submit maintenance request",
        variant: "destructive",
      })
    }
  }

  const handleUpdateStatus = async (id: string, newStatus: "pending" | "in-progress" | "completed") => {
    try {
      const { error } = await supabase
        .from("maintenance_requests")
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq("id", id)

      if (error) {
        throw error
      }

      toast({
        title: "Success",
        description: "Request status updated successfully",
      })

      // Refresh requests list
      fetchRequests()
    } catch (error: any) {
      console.error("Error updating request status:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to update request status",
        variant: "destructive",
      })
    }
  }

  const handleCompleteRequest = async (id: string) => {
    try {
      // Delete the maintenance request from the database
      const { error } = await supabase.from("maintenance_requests").delete().eq("id", id)

      if (error) {
        throw error
      }

      toast({
        title: "Success",
        description: "Maintenance request completed and removed",
      })

      // Refresh requests list
      fetchRequests()
    } catch (error: any) {
      console.error("Error completing maintenance request:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to complete maintenance request",
        variant: "destructive",
      })
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            Pending
          </Badge>
        )
      case "in-progress":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            In Progress
          </Badge>
        )
      case "completed":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            Completed
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString() + " " + date.toLocaleTimeString()
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-6">Maintenance Requests</h1>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Maintenance Requests</CardTitle>
              <CardDescription>View and track maintenance requests and work orders</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-4">Loading maintenance requests...</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Unit</TableHead>
                      <TableHead>Issue</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Updated</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {requests.length > 0 ? (
                      requests.map((request) => (
                        <TableRow key={request.id}>
                          <TableCell>{request.unit}</TableCell>
                          <TableCell>
                            <div className="font-medium">{request.title}</div>
                            <div className="text-sm text-muted-foreground">{request.description}</div>
                          </TableCell>
                          <TableCell>{getStatusBadge(request.status)}</TableCell>
                          <TableCell>{formatDate(request.created_at)}</TableCell>
                          <TableCell>{formatDate(request.updated_at)}</TableCell>
                          <TableCell>
                            <div className="flex flex-col gap-2">
                              {isAdmin && (
                                <>
                                  {request.status === "pending" && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleUpdateStatus(request.id, "in-progress")}
                                    >
                                      Mark In Progress
                                    </Button>
                                  )}
                                  {request.status === "in-progress" && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleUpdateStatus(request.id, "completed")}
                                    >
                                      Mark Completed
                                    </Button>
                                  )}
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100 hover:text-green-800"
                                      >
                                        <CheckCircle className="h-4 w-4 mr-2" />
                                        Complete
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>Complete Maintenance Request</AlertDialogTitle>
                                        <AlertDialogDescription>
                                          This will mark the request as completed and remove it from the system. This
                                          action cannot be undone.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => handleCompleteRequest(request.id)}>
                                          Complete
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                </>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center">
                          No maintenance requests found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Submit New Request</CardTitle>
              <CardDescription>Report a maintenance issue in your unit</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="unit">Unit Number</Label>
                  <Input id="unit" name="unit" value={newRequest.unit} onChange={handleInputChange} required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="title">Issue Title</Label>
                  <Input id="title" name="title" value={newRequest.title} onChange={handleInputChange} required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    rows={4}
                    value={newRequest.description}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <Button type="submit" className="w-full">
                  Submit Request
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
