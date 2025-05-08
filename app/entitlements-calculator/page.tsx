"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface CommitteeMember {
  name: string
  role: string
  unit: string
  entitlements: number
}

export default function EntitlementsCalculatorPage() {
  const [buildingName, setBuildingName] = useState("Oceanview Apartments")
  const [unitsCount, setUnitsCount] = useState(24)
  const [committeeMembers, setCommitteeMembers] = useState<CommitteeMember[]>([
    { name: "John Smith", role: "Chairperson", unit: "101", entitlements: 10 },
    { name: "Sarah Johnson", role: "Secretary", unit: "102", entitlements: 12 },
    { name: "Michael Wong", role: "Treasurer", unit: "201", entitlements: 15 },
    { name: "Emma Davis", role: "Member", unit: "202", entitlements: 15 },
    { name: "Robert Chen", role: "Member", unit: "301", entitlements: 18 },
  ])
  const [loading, setLoading] = useState(false)
  const [phpOutput, setPhpOutput] = useState<string>("")
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const handleMemberChange = (index: number, field: keyof CommitteeMember, value: string | number) => {
    const updatedMembers = [...committeeMembers]
    updatedMembers[index] = { ...updatedMembers[index], [field]: value }
    setCommitteeMembers(updatedMembers)
  }

  const handleAddMember = () => {
    setCommitteeMembers([...committeeMembers, { name: "", role: "Member", unit: "", entitlements: 0 }])
  }

  const handleRemoveMember = (index: number) => {
    const updatedMembers = committeeMembers.filter((_, i) => i !== index)
    setCommitteeMembers(updatedMembers)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setPhpOutput("")

    try {
      // Validate data before sending
      const validatedMembers = committeeMembers.map((member) => ({
        ...member,
        entitlements: Number(member.entitlements) || 0,
      }))

      const response = await fetch("/api/entitlements-calculator", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          buildingName,
          unitsCount: Number(unitsCount) || 0,
          committeeMembers: validatedMembers,
        }),
      })

      const contentType = response.headers.get("content-type")

      if (contentType && contentType.includes("application/json")) {
        // Handle JSON error response
        const errorData = await response.json()
        throw new Error(errorData.error || "Unknown error occurred")
      } else {
        // Handle HTML success response
        const html = await response.text()
        setPhpOutput(html)
        toast({
          title: "Success",
          description: "Entitlements calculated successfully",
        })
      }
    } catch (error) {
      console.error("Error:", error)
      setError(error instanceof Error ? error.message : "An unknown error occurred")
      toast({
        title: "Error",
        description: "Failed to calculate entitlements",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Calculate total entitlements for display
  const totalEntitlements = committeeMembers.reduce((sum, member) => sum + (Number(member.entitlements) || 0), 0)

  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-6">Strata Entitlements Calculator</h1>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Building Information</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="buildingName">Building Name</Label>
                  <Input
                    id="buildingName"
                    value={buildingName}
                    onChange={(e) => setBuildingName(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="unitsCount">Number of Units</Label>
                  <Input
                    id="unitsCount"
                    type="number"
                    min="1"
                    value={unitsCount}
                    onChange={(e) => setUnitsCount(Number.parseInt(e.target.value) || 0)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label>Committee Members</Label>
                    <span className="text-sm text-muted-foreground">Total Entitlements: {totalEntitlements}</span>
                  </div>
                  <div className="space-y-4">
                    {committeeMembers.map((member, index) => (
                      <div key={index} className="grid grid-cols-12 gap-2 items-center">
                        <div className="col-span-3">
                          <Input
                            placeholder="Name"
                            value={member.name}
                            onChange={(e) => handleMemberChange(index, "name", e.target.value)}
                            required
                          />
                        </div>
                        <div className="col-span-3">
                          <select
                            value={member.role}
                            onChange={(e) => handleMemberChange(index, "role", e.target.value)}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <option value="Chairperson">Chairperson</option>
                            <option value="Secretary">Secretary</option>
                            <option value="Treasurer">Treasurer</option>
                            <option value="Member">Member</option>
                          </select>
                        </div>
                        <div className="col-span-2">
                          <Input
                            placeholder="Unit"
                            value={member.unit}
                            onChange={(e) => handleMemberChange(index, "unit", e.target.value)}
                            required
                          />
                        </div>
                        <div className="col-span-3">
                          <Input
                            placeholder="Entitlements"
                            type="number"
                            min="0"
                            value={member.entitlements}
                            onChange={(e) =>
                              handleMemberChange(index, "entitlements", Number.parseInt(e.target.value) || 0)
                            }
                            required
                          />
                        </div>
                        <div className="col-span-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveMember(index)}
                            disabled={committeeMembers.length <= 1}
                          >
                            ✕
                          </Button>
                        </div>
                      </div>
                    ))}
                    <Button type="button" variant="outline" onClick={handleAddMember}>
                      Add Member
                    </Button>
                  </div>
                </div>

                <Button type="submit" disabled={loading}>
                  {loading ? "Calculating..." : "Calculate Entitlements"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="bg-white">
            <CardHeader>
              <CardTitle>Calculation Results</CardTitle>
            </CardHeader>
            <CardContent>
              {phpOutput ? (
                <div
                  className="bg-white border rounded-md p-4 min-h-[400px] overflow-auto"
                  dangerouslySetInnerHTML={{ __html: phpOutput }}
                />
              ) : (
                <div className="bg-slate-50 border rounded-md p-4 min-h-[400px] flex items-center justify-center">
                  <p className="text-muted-foreground">
                    Fill in the form and click "Calculate Entitlements" to see the results
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
