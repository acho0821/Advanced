"use client"

import { CardFooter } from "@/components/ui/card"

import type React from "react"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileText, Users, CreditCard, BarChart3, Wrench, Building } from "lucide-react"

export default function DashboardPage() {
  const [user, setUser] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    // Check for user cookie
    const cookies = document.cookie.split(";")
    const userCookie = cookies.find((cookie) => cookie.trim().startsWith("user="))

    if (userCookie) {
      const userEmail = userCookie.split("=")[1]
      setUser(userEmail)
    } else {
      // Redirect to login if no user cookie found
      router.push("/login")
    }
  }, [router])

  const handleLogout = () => {
    // Clear the user cookie
    document.cookie = "user=; path=/; max-age=0"
    router.push("/login")
  }

  if (!user) {
    return <div className="container mx-auto p-8 text-center">Loading...</div>
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {user}</p>
        </div>
        <Button variant="outline" onClick={handleLogout}>
          Logout
        </Button>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid grid-cols-3 md:grid-cols-6 mb-8">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="strata-roll">Strata Roll</TabsTrigger>
          <TabsTrigger value="levies">Levies</TabsTrigger>
          <TabsTrigger value="budget">Budget</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <DashboardCard
              icon={<FileText className="h-6 w-6" />}
              title="Documents"
              description="5 new documents uploaded"
              href="/documents"
            />
            <DashboardCard
              icon={<Users className="h-6 w-6" />}
              title="Strata Roll"
              description="24 unit owners registered"
              href="/strata-roll"
            />
            <DashboardCard
              icon={<CreditCard className="h-6 w-6" />}
              title="Levy Notices"
              description="Next levy due in 14 days"
              href="/levies"
            />
            <DashboardCard
              icon={<BarChart3 className="h-6 w-6" />}
              title="Budget"
              description="$45,000 in administration fund"
              href="/budget"
            />
            <DashboardCard
              icon={<Wrench className="h-6 w-6" />}
              title="Maintenance"
              description="3 pending maintenance requests"
              href="/maintenance"
            />
            <DashboardCard
              icon={<Building className="h-6 w-6" />}
              title="Building Info"
              description="Last updated 7 days ago"
              href="/building-info"
            />
          </div>
        </TabsContent>

        <TabsContent value="documents">
          <Card>
            <CardHeader>
              <CardTitle>Documents</CardTitle>
              <CardDescription>Access and manage building documents</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Document management functionality will be implemented here.</p>
              <p className="text-muted-foreground mt-2">
                This will connect to the database to store and retrieve documents.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="strata-roll">
          <Card>
            <CardHeader>
              <CardTitle>Strata Roll</CardTitle>
              <CardDescription>View and manage unit owner details</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Strata roll management functionality will be implemented here.</p>
              <p className="text-muted-foreground mt-2">
                This will connect to the database to store and retrieve owner information.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="levies">
          <Card>
            <CardHeader>
              <CardTitle>Levy Notices</CardTitle>
              <CardDescription>Generate and track levy payments</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Levy management functionality will be implemented here.</p>
              <p className="text-muted-foreground mt-2">
                This will connect to the database to store and retrieve levy information.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="budget">
          <Card>
            <CardHeader>
              <CardTitle>Budget</CardTitle>
              <CardDescription>Manage building finances</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Budget management functionality will be implemented here.</p>
              <p className="text-muted-foreground mt-2">
                This will connect to the database to store and retrieve financial information.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="maintenance">
          <Card>
            <CardHeader>
              <CardTitle>Maintenance</CardTitle>
              <CardDescription>Track maintenance requests and work orders</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Maintenance management functionality will be implemented here.</p>
              <p className="text-muted-foreground mt-2">
                This will connect to the database to store and retrieve maintenance information.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function DashboardCard({
  icon,
  title,
  description,
  href,
}: {
  icon: React.ReactNode
  title: string
  description: string
  href: string
}) {
  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="text-primary">{icon}</div>
      </CardHeader>
      <CardContent>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
      <CardFooter>
        <Button asChild variant="ghost" size="sm" className="w-full">
          <Link href={href}>View Details</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
