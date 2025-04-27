"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { CreditCard, Download, Calendar, DollarSign } from "lucide-react"

interface Levy {
  id: number
  unit: string
  owner: string
  amount: number
  dueDate: string
  period: string
  status: "paid" | "pending" | "overdue"
  paidDate?: string
}

interface Owner {
  id: number
  unit: string
  name: string
  email: string
  entitlements: number
}

export default function LeviesPage() {
  const [levies, setLevies] = useState<Levy[]>([])
  const [owners, setOwners] = useState<Owner[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedUnit, setSelectedUnit] = useState("")
  const [amount, setAmount] = useState("")
  const [dueDate, setDueDate] = useState("")
  const [period, setPeriod] = useState("")
  const { toast } = useToast()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      // In a real app, these would be API calls
      await new Promise((resolve) => setTimeout(resolve, 500))

      // Mock data
      const mockLevies: Levy[] = [
        {
          id: 1,
          unit: "101",
          owner: "John Smith",
          amount: 850,
          dueDate: "2023-07-15",
          period: "Q3 2023",
          status: "paid",
          paidDate: "2023-07-10",
        },
        {
          id: 2,
          unit: "102",
          owner: "Sarah Johnson",
          amount: 920,
          dueDate: "2023-07-15",
          period: "Q3 2023",
          status: "paid",
          paidDate: "2023-07-12",
        },
        {
          id: 3,
          unit: "201",
          owner: "Michael Wong",
          amount: 1050,
          dueDate: "2023-07-15",
          period: "Q3 2023",
          status: "pending",
        },
        {
          id: 4,
          unit: "202",
          owner: "Emma Davis",
          amount: 1050,
          dueDate: "2023-07-15",
          period: "Q3 2023",
          status: "overdue",
        },
        {
          id: 5,
          unit: "301",
          owner: "Robert Chen",
          amount: 1200,
          dueDate: "2023-07-15",
          period: "Q3 2023",
          status: "paid",
          paidDate: "2023-07-05",
        },
      ]

      const mockOwners: Owner[] = [
        {
          id: 1,
          unit: "101",
          name: "John Smith",
          email: "john.smith@example.com",
          entitlements: 10,
        },
        {
          id: 2,
          unit: "102",
          name: "Sarah Johnson",
          email: "sarah.j@example.com",
          entitlements: 12,
        },
        {
          id: 3,
          unit: "201",
          name: "Michael Wong",
          email: "m.wong@example.com",
          entitlements: 15,
        },
        {
          id: 4,
          unit: "202",
          name: "Emma Davis",
          email: "emma.d@example.com",
          entitlements: 15,
        },
        {
          id: 5,
          unit: "301",
          name: "Robert Chen",
          email: "r.chen@example.com",
          entitlements: 18,
        },
      ]

      setLevies(mockLevies)
      setOwners(mockOwners)
    } catch (error) {
      console.error("Error fetching data:", error)
      toast({
        title: "Error",
        description: "Failed to load levy data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateLevy = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedUnit || !amount || !dueDate || !period) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      })
      return
    }

    try {
      // Find the owner for the selected unit
      const owner = owners.find((o) => o.unit === selectedUnit)

      if (!owner) {
        toast({
          title: "Error",
          description: "Owner not found for the selected unit",
          variant: "destructive",
        })
        return
      }

      // In a real app, this would be an API call to create a new levy
      await new Promise((resolve) => setTimeout(resolve, 500))

      // Create a new levy
      const newLevy: Levy = {
        id: levies.length + 1,
        unit: selectedUnit,
        owner: owner.name,
        amount: Number.parseFloat(amount),
        dueDate,
        period,
        status: "pending",
      }

      // Add the new levy to the list
      setLevies([newLevy, ...levies])

      // Reset form
      setSelectedUnit("")
      setAmount("")
      setDueDate("")
      setPeriod("")

      // Show success message
      toast({
        title: "Success",
        description: "Levy notice generated successfully",
      })
    } catch (error) {
      console.error("Error generating levy:", error)
      toast({
        title: "Error",
        description: "Failed to generate levy notice",
        variant: "destructive",
      })
    }
  }

  const handleMarkAsPaid = (id: number) => {
    setLevies(
      levies.map((levy) =>
        levy.id === id
          ? {
              ...levy,
              status: "paid",
              paidDate: new Date().toISOString().split("T")[0],
            }
          : levy,
      ),
    )

    toast({
      title: "Success",
      description: "Levy marked as paid",
    })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            Paid
          </Badge>
        )
      case "pending":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            Pending
          </Badge>
        )
      case "overdue":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            Overdue
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("en-AU", { style: "currency", currency: "AUD" }).format(amount)
  }

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    return date.toLocaleDateString()
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-6">Levy Notices</h1>

      <Tabs defaultValue="view" className="mb-8">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="view">View Levies</TabsTrigger>
          <TabsTrigger value="generate">Generate Levy</TabsTrigger>
        </TabsList>

        <TabsContent value="view" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Levy Notices</CardTitle>
              <CardDescription>View and manage levy notices for unit owners</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-4">Loading levy data...</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Unit</TableHead>
                      <TableHead>Owner</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Period</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Paid Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {levies.length > 0 ? (
                      levies.map((levy) => (
                        <TableRow key={levy.id}>
                          <TableCell>{levy.unit}</TableCell>
                          <TableCell>{levy.owner}</TableCell>
                          <TableCell>{formatCurrency(levy.amount)}</TableCell>
                          <TableCell>{formatDate(levy.dueDate)}</TableCell>
                          <TableCell>{levy.period}</TableCell>
                          <TableCell>{getStatusBadge(levy.status)}</TableCell>
                          <TableCell>{levy.paidDate ? formatDate(levy.paidDate) : "-"}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="ghost" size="icon" title="Download Notice">
                                <Download className="h-4 w-4" />
                              </Button>
                              {levy.status !== "paid" && (
                                <Button variant="ghost" size="sm" onClick={() => handleMarkAsPaid(levy.id)}>
                                  Mark as Paid
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center">
                          No levy notices found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="generate" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Generate Levy Notice</CardTitle>
              <CardDescription>Create a new levy notice for a unit owner</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleGenerateLevy} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="unit">Unit</Label>
                  <select
                    id="unit"
                    value={selectedUnit}
                    onChange={(e) => setSelectedUnit(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    required
                  >
                    <option value="">Select a unit</option>
                    {owners.map((owner) => (
                      <option key={owner.id} value={owner.unit}>
                        Unit {owner.unit} - {owner.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amount">Amount (AUD)</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      min="0"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="pl-9"
                      placeholder="0.00"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dueDate">Due Date</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="dueDate"
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="pl-9"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="period">Period</Label>
                  <Input
                    id="period"
                    value={period}
                    onChange={(e) => setPeriod(e.target.value)}
                    placeholder="e.g., Q3 2023"
                    required
                  />
                </div>

                <Button type="submit" className="w-full">
                  <CreditCard className="h-4 w-4 mr-2" />
                  Generate Levy Notice
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>Levy Information</CardTitle>
          <CardDescription>Understanding strata levies</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            Strata levies are fees paid by unit owners to cover the costs of maintaining and managing the building.
            These fees are typically divided into two funds:
          </p>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-slate-50 p-4 rounded-md">
              <h3 className="font-medium mb-2">Administration Fund</h3>
              <p className="text-sm text-muted-foreground">
                Covers day-to-day expenses such as insurance, cleaning, gardening, and administrative costs.
              </p>
            </div>
            <div className="bg-slate-50 p-4 rounded-md">
              <h3 className="font-medium mb-2">Capital Works Fund</h3>
              <p className="text-sm text-muted-foreground">
                Saves for future major repairs and improvements to the building, such as painting, roof repairs, or lift
                replacement.
              </p>
            </div>
          </div>

          <p>
            Levies are calculated based on unit entitlements, which represent each owner's share of the building. Owners
            with larger units or more valuable properties typically have higher entitlements and pay proportionally
            higher levies.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
