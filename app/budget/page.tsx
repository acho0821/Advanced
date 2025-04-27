"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { DollarSign, PlusCircle, Trash2 } from "lucide-react"

interface BudgetItem {
  id: number
  category: string
  description: string
  amount: number
  type: "income" | "expense"
  fund: "admin" | "capital"
}

export default function BudgetPage() {
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([])
  const [loading, setLoading] = useState(true)
  const [newItem, setNewItem] = useState({
    category: "",
    description: "",
    amount: "",
    type: "expense",
    fund: "admin",
  })
  const { toast } = useToast()

  useEffect(() => {
    fetchBudgetItems()
  }, [])

  const fetchBudgetItems = async () => {
    try {
      setLoading(true)
      // In a real app, this would be an API call
      await new Promise((resolve) => setTimeout(resolve, 500))

      // Mock data
      const mockBudgetItems: BudgetItem[] = [
        {
          id: 1,
          category: "Levy Income",
          description: "Quarterly levies from unit owners",
          amount: 45000,
          type: "income",
          fund: "admin",
        },
        {
          id: 2,
          category: "Special Levy",
          description: "One-time special levy for lobby renovation",
          amount: 15000,
          type: "income",
          fund: "capital",
        },
        {
          id: 3,
          category: "Insurance",
          description: "Annual building insurance premium",
          amount: 12500,
          type: "expense",
          fund: "admin",
        },
        {
          id: 4,
          category: "Cleaning",
          description: "Regular cleaning of common areas",
          amount: 8000,
          type: "expense",
          fund: "admin",
        },
        {
          id: 5,
          category: "Gardening",
          description: "Maintenance of gardens and landscaping",
          amount: 5000,
          type: "expense",
          fund: "admin",
        },
        {
          id: 6,
          category: "Repairs",
          description: "General repairs and maintenance",
          amount: 7500,
          type: "expense",
          fund: "admin",
        },
        {
          id: 7,
          category: "Lobby Renovation",
          description: "Renovation of building lobby",
          amount: 20000,
          type: "expense",
          fund: "capital",
        },
        {
          id: 8,
          category: "Interest Income",
          description: "Interest earned on capital works fund",
          amount: 1200,
          type: "income",
          fund: "capital",
        },
      ]

      setBudgetItems(mockBudgetItems)
    } catch (error) {
      console.error("Error fetching budget items:", error)
      toast({
        title: "Error",
        description: "Failed to load budget data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setNewItem((prev) => ({ ...prev, [name]: value }))
  }

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newItem.category || !newItem.description || !newItem.amount) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      })
      return
    }

    try {
      // In a real app, this would be an API call
      await new Promise((resolve) => setTimeout(resolve, 500))

      // Create a new budget item
      const newBudgetItem: BudgetItem = {
        id: budgetItems.length + 1,
        category: newItem.category,
        description: newItem.description,
        amount: Number.parseFloat(newItem.amount),
        type: newItem.type as "income" | "expense",
        fund: newItem.fund as "admin" | "capital",
      }

      // Add the new item to the list
      setBudgetItems([...budgetItems, newBudgetItem])

      // Reset form
      setNewItem({
        category: "",
        description: "",
        amount: "",
        type: "expense",
        fund: "admin",
      })

      // Show success message
      toast({
        title: "Success",
        description: "Budget item added successfully",
      })
    } catch (error) {
      console.error("Error adding budget item:", error)
      toast({
        title: "Error",
        description: "Failed to add budget item",
        variant: "destructive",
      })
    }
  }

  const handleDeleteItem = (id: number) => {
    setBudgetItems(budgetItems.filter((item) => item.id !== id))
    toast({
      title: "Success",
      description: "Budget item deleted successfully",
    })
  }

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("en-AU", { style: "currency", currency: "AUD" }).format(amount)
  }

  const calculateTotals = () => {
    const adminIncome = budgetItems
      .filter((item) => item.type === "income" && item.fund === "admin")
      .reduce((sum, item) => sum + item.amount, 0)

    const adminExpenses = budgetItems
      .filter((item) => item.type === "expense" && item.fund === "admin")
      .reduce((sum, item) => sum + item.amount, 0)

    const capitalIncome = budgetItems
      .filter((item) => item.type === "income" && item.fund === "capital")
      .reduce((sum, item) => sum + item.amount, 0)

    const capitalExpenses = budgetItems
      .filter((item) => item.type === "expense" && item.fund === "capital")
      .reduce((sum, item) => sum + item.amount, 0)

    return {
      adminIncome,
      adminExpenses,
      adminBalance: adminIncome - adminExpenses,
      capitalIncome,
      capitalExpenses,
      capitalBalance: capitalIncome - capitalExpenses,
      totalIncome: adminIncome + capitalIncome,
      totalExpenses: adminExpenses + capitalExpenses,
      totalBalance: adminIncome + capitalIncome - adminExpenses - capitalExpenses,
    }
  }

  const totals = calculateTotals()

  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-6">Budget Management</h1>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Administration Fund</CardTitle>
            <CardDescription>Day-to-day operating expenses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Income:</span>
                <span className="font-medium">{formatCurrency(totals.adminIncome)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Expenses:</span>
                <span className="font-medium">{formatCurrency(totals.adminExpenses)}</span>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span className="font-medium">Balance:</span>
                <span className={`font-bold ${totals.adminBalance >= 0 ? "text-green-600" : "text-red-600"}`}>
                  {formatCurrency(totals.adminBalance)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Capital Works Fund</CardTitle>
            <CardDescription>Long-term maintenance and improvements</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Income:</span>
                <span className="font-medium">{formatCurrency(totals.capitalIncome)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Expenses:</span>
                <span className="font-medium">{formatCurrency(totals.capitalExpenses)}</span>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span className="font-medium">Balance:</span>
                <span className={`font-bold ${totals.capitalBalance >= 0 ? "text-green-600" : "text-red-600"}`}>
                  {formatCurrency(totals.capitalBalance)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Total Budget</CardTitle>
            <CardDescription>Combined funds summary</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Income:</span>
                <span className="font-medium">{formatCurrency(totals.totalIncome)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Expenses:</span>
                <span className="font-medium">{formatCurrency(totals.totalExpenses)}</span>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span className="font-medium">Overall Balance:</span>
                <span className={`font-bold ${totals.totalBalance >= 0 ? "text-green-600" : "text-red-600"}`}>
                  {formatCurrency(totals.totalBalance)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all" className="mb-8">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All Items</TabsTrigger>
          <TabsTrigger value="admin">Administration</TabsTrigger>
          <TabsTrigger value="capital">Capital Works</TabsTrigger>
          <TabsTrigger value="add">Add Item</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>All Budget Items</CardTitle>
              <CardDescription>View all income and expenses across both funds</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-4">Loading budget data...</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Category</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Fund</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {budgetItems.length > 0 ? (
                      budgetItems.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.category}</TableCell>
                          <TableCell>{item.description}</TableCell>
                          <TableCell className="capitalize">{item.fund}</TableCell>
                          <TableCell className="capitalize">{item.type}</TableCell>
                          <TableCell
                            className={`text-right ${item.type === "income" ? "text-green-600" : "text-red-600"}`}
                          >
                            {item.type === "income" ? "+" : "-"}
                            {formatCurrency(item.amount)}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteItem(item.id)}
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center">
                          No budget items found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="admin" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Administration Fund</CardTitle>
              <CardDescription>Day-to-day operating expenses</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Category</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {budgetItems
                    .filter((item) => item.fund === "admin")
                    .map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.category}</TableCell>
                        <TableCell>{item.description}</TableCell>
                        <TableCell className="capitalize">{item.type}</TableCell>
                        <TableCell
                          className={`text-right ${item.type === "income" ? "text-green-600" : "text-red-600"}`}
                        >
                          {item.type === "income" ? "+" : "-"}
                          {formatCurrency(item.amount)}
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="capital" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Capital Works Fund</CardTitle>
              <CardDescription>Long-term maintenance and improvements</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Category</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {budgetItems
                    .filter((item) => item.fund === "capital")
                    .map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.category}</TableCell>
                        <TableCell>{item.description}</TableCell>
                        <TableCell className="capitalize">{item.type}</TableCell>
                        <TableCell
                          className={`text-right ${item.type === "income" ? "text-green-600" : "text-red-600"}`}
                        >
                          {item.type === "income" ? "+" : "-"}
                          {formatCurrency(item.amount)}
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="add" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Add Budget Item</CardTitle>
              <CardDescription>Add a new income or expense item to the budget</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddItem} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="type">Type</Label>
                    <select
                      id="type"
                      name="type"
                      value={newItem.type}
                      onChange={handleInputChange}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="income">Income</option>
                      <option value="expense">Expense</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fund">Fund</Label>
                    <select
                      id="fund"
                      name="fund"
                      value={newItem.fund}
                      onChange={handleInputChange}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="admin">Administration</option>
                      <option value="capital">Capital Works</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    name="category"
                    value={newItem.category}
                    onChange={handleInputChange}
                    placeholder="e.g., Insurance, Cleaning, Levy Income"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    name="description"
                    value={newItem.description}
                    onChange={handleInputChange}
                    placeholder="Brief description of the budget item"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amount">Amount (AUD)</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="amount"
                      name="amount"
                      type="number"
                      step="0.01"
                      min="0"
                      value={newItem.amount}
                      onChange={handleInputChange}
                      className="pl-9"
                      placeholder="0.00"
                      required
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full">
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Add Budget Item
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
