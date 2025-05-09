"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"
import { getSupabaseBrowserClient } from "@/lib/supabase"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Pencil, Trash2 } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface Owner {
  id: string
  unit: string
  name: string
  email: string
  phone: string
  entitlements: number
  created_at: string
  updated_at: string
}

export default function StrataRollPage() {
  const [owners, setOwners] = useState<Owner[]>([])
  const [loading, setLoading] = useState(true)
  const [newOwner, setNewOwner] = useState({
    unit: "",
    name: "",
    email: "",
    phone: "",
    entitlements: "",
  })
  const [editingOwner, setEditingOwner] = useState<Owner | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const { toast } = useToast()
  const supabase = getSupabaseBrowserClient()

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession()

        if (error || !data.session) {
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
      } catch (error) {
        console.error("Session error:", error)
      }
    }

    checkSession()
    fetchOwners()
  }, [supabase])

  const fetchOwners = async () => {
    try {
      setLoading(true)

      // Get owners from the strata_roll table
      const { data, error } = await supabase.from("strata_roll").select("*").order("unit", { ascending: true })

      if (error) {
        throw error
      }

      setOwners(data || [])
    } catch (error) {
      console.error("Error fetching owners:", error)
      toast({
        title: "Error",
        description: "Failed to load strata roll data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setNewOwner((prev) => ({ ...prev, [name]: value }))
  }

  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setEditingOwner((prev) => (prev ? { ...prev, [name]: value } : null))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isAdmin) {
      toast({
        title: "Error",
        description: "Only administrators can add owners",
        variant: "destructive",
      })
      return
    }

    try {
      // Insert new owner into the strata_roll table
      const { error } = await supabase.from("strata_roll").insert({
        unit: newOwner.unit,
        name: newOwner.name,
        email: newOwner.email,
        phone: newOwner.phone,
        entitlements: Number.parseInt(newOwner.entitlements) || 0,
      })

      if (error) {
        throw error
      }

      toast({
        title: "Success",
        description: "Owner added successfully",
      })

      // Reset form
      setNewOwner({
        unit: "",
        name: "",
        email: "",
        phone: "",
        entitlements: "",
      })

      // Refresh owners list
      fetchOwners()
    } catch (error: any) {
      console.error("Error adding owner:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to add owner",
        variant: "destructive",
      })
    }
  }

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!editingOwner) return

    if (!isAdmin) {
      toast({
        title: "Error",
        description: "Only administrators can edit owners",
        variant: "destructive",
      })
      return
    }

    try {
      // Update owner in the strata_roll table
      const { error } = await supabase
        .from("strata_roll")
        .update({
          unit: editingOwner.unit,
          name: editingOwner.name,
          email: editingOwner.email,
          phone: editingOwner.phone,
          entitlements: editingOwner.entitlements,
          updated_at: new Date().toISOString(),
        })
        .eq("id", editingOwner.id)

      if (error) {
        throw error
      }

      toast({
        title: "Success",
        description: "Owner updated successfully",
      })

      // Close dialog and reset editing state
      setIsEditing(false)
      setEditingOwner(null)

      // Refresh owners list
      fetchOwners()
    } catch (error: any) {
      console.error("Error updating owner:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to update owner",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async (id: string) => {
    if (!isAdmin) {
      toast({
        title: "Error",
        description: "Only administrators can delete owners",
        variant: "destructive",
      })
      return
    }

    try {
      // Delete owner from the strata_roll table
      const { error } = await supabase.from("strata_roll").delete().eq("id", id)

      if (error) {
        throw error
      }

      toast({
        title: "Success",
        description: "Owner deleted successfully",
      })

      // Refresh owners list
      fetchOwners()
    } catch (error: any) {
      console.error("Error deleting owner:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to delete owner",
        variant: "destructive",
      })
    } finally {
      setDeletingId(null)
      setIsDeleteDialogOpen(false)
    }
  }

  const handleEdit = (owner: Owner) => {
    setEditingOwner(owner)
    setIsEditing(true)
  }

  const confirmDelete = (id: string) => {
    setDeletingId(id)
    setIsDeleteDialogOpen(true)
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-6">Strata Roll</h1>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Unit Owners</CardTitle>
              <CardDescription>View and manage unit owner details and entitlements</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-4">Loading strata roll data...</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Unit</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Entitlements</TableHead>
                      {isAdmin && <TableHead>Actions</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {owners.length > 0 ? (
                      owners.map((owner) => (
                        <TableRow key={owner.id}>
                          <TableCell>{owner.unit}</TableCell>
                          <TableCell>{owner.name}</TableCell>
                          <TableCell>{owner.email}</TableCell>
                          <TableCell>{owner.phone}</TableCell>
                          <TableCell>{owner.entitlements}</TableCell>
                          {isAdmin && (
                            <TableCell>
                              <div className="flex gap-2">
                                <Button variant="ghost" size="sm" onClick={() => handleEdit(owner)}>
                                  <Pencil className="h-4 w-4 mr-2" />
                                  Edit
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => confirmDelete(owner.id)}>
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </Button>
                              </div>
                            </TableCell>
                          )}
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={isAdmin ? 6 : 5} className="text-center">
                          No owners found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>

        {isAdmin && (
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Add New Owner</CardTitle>
                <CardDescription>Enter details to add a new unit owner</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="unit">Unit Number</Label>
                    <Input id="unit" name="unit" value={newOwner.unit} onChange={handleInputChange} required />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="name">Owner Name</Label>
                    <Input id="name" name="name" value={newOwner.name} onChange={handleInputChange} required />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={newOwner.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input id="phone" name="phone" value={newOwner.phone} onChange={handleInputChange} />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="entitlements">Entitlements</Label>
                    <Input
                      id="entitlements"
                      name="entitlements"
                      type="number"
                      value={newOwner.entitlements}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <Button type="submit" className="w-full">
                    Add Owner
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Edit Owner Dialog */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Owner</DialogTitle>
            <DialogDescription>Update the owner's information</DialogDescription>
          </DialogHeader>
          {editingOwner && (
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-unit">Unit Number</Label>
                <Input id="edit-unit" name="unit" value={editingOwner.unit} onChange={handleEditInputChange} required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-name">Owner Name</Label>
                <Input id="edit-name" name="name" value={editingOwner.name} onChange={handleEditInputChange} required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  name="email"
                  type="email"
                  value={editingOwner.email}
                  onChange={handleEditInputChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-phone">Phone</Label>
                <Input id="edit-phone" name="phone" value={editingOwner.phone} onChange={handleEditInputChange} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-entitlements">Entitlements</Label>
                <Input
                  id="edit-entitlements"
                  name="entitlements"
                  type="number"
                  value={editingOwner.entitlements}
                  onChange={handleEditInputChange}
                  required
                />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
                <Button type="submit">Save Changes</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this owner from the strata roll. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeletingId(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deletingId && handleDelete(deletingId)}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
