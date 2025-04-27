import type React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Building, FileText, Users, CreditCard, BarChart3, Wrench } from "lucide-react"

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-12 text-center">
        <h1 className="text-4xl font-bold mb-4">Strata Management Portal</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          A comprehensive platform for managing your strata-titled apartment building in accordance with the Strata
          Schemes Management Act (2015).
        </p>
      </header>

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Building Management Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <FeatureCard
            icon={<FileText className="h-8 w-8" />}
            title="Document Storage"
            description="Access important building documents including insurance certificates and financial reports."
            href="/documents"
          />
          <FeatureCard
            icon={<Users className="h-8 w-8" />}
            title="Strata Roll"
            description="View contact details for unit owners and their unit entitlements."
            href="/strata-roll"
          />
          <FeatureCard
            icon={<CreditCard className="h-8 w-8" />}
            title="Levy Notices"
            description="Generate and view levy notices for unit owners."
            href="/levies"
          />
          <FeatureCard
            icon={<BarChart3 className="h-8 w-8" />}
            title="Budget Management"
            description="Track and manage the building's administration and capital works funds."
            href="/budget"
          />
          <FeatureCard
            icon={<Wrench className="h-8 w-8" />}
            title="Maintenance Requests"
            description="Submit and track maintenance requests and work orders."
            href="/maintenance"
          />
          <FeatureCard
            icon={<Building className="h-8 w-8" />}
            title="Building Information"
            description="View general information about the building for the public."
            href="/building-info"
          />
        </div>
      </section>

      <section className="mb-12 bg-slate-50 p-8 rounded-lg">
        <h2 className="text-2xl font-bold mb-4">About Strata Management</h2>
        <p className="mb-4">
          In New South Wales, strata-titled apartment buildings are governed by the Strata Schemes Management Act
          (2015). Each building is subdivided into units, or lots, and are collectively part of the Owners Corporation
          (aka body corporate) which is responsible for things like the maintenance of common areas, and insurance for
          the building.
        </p>
        <p>
          The act sets out the responsibilities of the Strata Committee, which are elected representatives of the
          owners, responsible for managing the body corporate. There must be a Treasurer, Secretary and Chairperson, and
          it can have other members, up to a maximum of 9.
        </p>
      </section>

      <section className="text-center">
        <h2 className="text-2xl font-bold mb-6">Get Started</h2>
        <div className="flex justify-center gap-4">
          <Button asChild>
            <Link href="/login">Login</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/register">Register</Link>
          </Button>
        </div>
      </section>
    </div>
  )
}

function FeatureCard({
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
      <CardHeader>
        <div className="mb-2 text-primary">{icon}</div>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardFooter>
        <Button asChild variant="outline" className="w-full">
          <Link href={href}>View Details</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
