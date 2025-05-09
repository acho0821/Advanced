"use client"

import { CardFooter } from "@/components/ui/card"

import type React from "react"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileText, Users, CreditCard, BarChart3, Wrench, Building, Settings } from "lucide-react"
import { getSupabaseBrowserClient } from "@/lib/supabase"

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = getSupabaseBrowserClient()

  useEffect(() => {
    const checkSession = async () => {
      try {
        setLoading(true)
        const { data, error } = await supabase.auth.getSession()

        if (error) {
          throw error
        }

        if (!data.session) {
          router.push("/login")
          return
        }

        // Get user profile data
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", data.session.user.id)
          .single()

        if (profileError && profileError.code !== "PGRST116") {
          console.error("Error fetching profile:", profileError)
        }

        setUser({
          ...data.session.user,
          profile: profileData || {},
        })
      } catch (error) {
        console.error("Session error:", error)
        router.push("/login")
      } finally {
        setLoading(false)
      }
    }

    checkSession()
  }, [router, supabase])

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut()

      if (error) {
        throw error
      }

      router.push("/login")
      router.refresh()
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  if (loading) {
    return <div className="container mx-auto p-8 text-center">Loading...</div>
  }

  if (!user) {
    return <div className="container mx-auto p-8 text-center">Redirecting to login...</div>
  }

  const displayName = user.profile?.name || user.email
  const userRole = user.profile?.role || "user"
  const isAdmin = userRole === "admin"

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {displayName}</p>
          <p className="text-sm text-muted-foreground">Role: {userRole === "admin" ? "Administrator" : "User"}</p>
        </div>
        <div className="flex gap-2">
          {isAdmin && (
            <Button variant="outline" asChild>
              <Link href="/admin/storage-diagnostic">
                <Settings className="h-4 w-4 mr-2" />
                Storage Diagnostic
              </Link>
            </Button>
          )}
          <Button variant="outline" onClick={handleLogout}>
            Logout
          </Button>
        </div>
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
              description={isAdmin ? "Upload and manage documents" : "View and download documents"}
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
              description="Submit and track maintenance requests"
              href="/maintenance"
            />
            <DashboardCard
              icon={<Building className="h-6 w-6" />}
              title="Building Info"
              description="View building details and amenities"
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
              <p>View the documents page to access building documents.</p>
              {isAdmin && (
                <p className="text-muted-foreground mt-2">As an administrator, you can upload and manage documents.</p>
              )}
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
              <p>Submit and track maintenance requests for your unit.</p>
              <p className="text-muted-foreground mt-2">
                All requests are stored in the database and can be tracked through their lifecycle.
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
