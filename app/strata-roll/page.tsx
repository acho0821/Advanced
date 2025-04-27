"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"

interface Owner {
  id: number
  unit: string
  name: string
  email: string
  phone: string
  entitlements: number
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
  const { toast } = useToast()

  useEffect(() => {
    fetchOwners()
  }, [])

  const fetchOwners = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/strata-roll")
      const data = await response.json()

      if (data.owners) {
        setOwners(data.owners)
      }
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const response = await fetch("/api/strata-roll", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...newOwner,
          entitlements: Number.parseInt(newOwner.entitlements) || 0,
        }),
      })

      const data = await response.json()

      if (data.success) {
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
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to add owner",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error adding owner:", error)
      toast({
        title: "Error",
        description: "Failed to add owner",
        variant: "destructive",
      })
    }
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
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center">
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
      </div>
    </div>
  )
}
