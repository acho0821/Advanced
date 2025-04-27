import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Building, Users, Phone, Mail, MapPin, Calendar } from "lucide-react"

export default function BuildingInfoPage() {
  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-6">Building Information</h1>

      <div className="grid md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Oceanview Apartments</CardTitle>
            <CardDescription>General building information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <Building className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <h3 className="font-medium">Building Details</h3>
                <p className="text-sm text-muted-foreground">
                  A modern 8-story residential building with 24 units, completed in 2015.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <h3 className="font-medium">Location</h3>
                <p className="text-sm text-muted-foreground">123 Ocean Drive, Sydney NSW 2000</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Users className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <h3 className="font-medium">Strata Plan</h3>
                <p className="text-sm text-muted-foreground">SP12345</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <h3 className="font-medium">Building Manager</h3>
                <p className="text-sm text-muted-foreground">Robert Chen: 0456 789 012</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <h3 className="font-medium">Contact Email</h3>
                <p className="text-sm text-muted-foreground">info@oceanviewapartments.com.au</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <h3 className="font-medium">Next AGM</h3>
                <p className="text-sm text-muted-foreground">15 March 2024, 6:00 PM</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Strata Committee</CardTitle>
            <CardDescription>Current committee members</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Position</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Unit</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">Chairperson</TableCell>
                  <TableCell>John Smith</TableCell>
                  <TableCell>101</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Secretary</TableCell>
                  <TableCell>Sarah Johnson</TableCell>
                  <TableCell>102</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Treasurer</TableCell>
                  <TableCell>Michael Wong</TableCell>
                  <TableCell>201</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Member</TableCell>
                  <TableCell>Emma Davis</TableCell>
                  <TableCell>202</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Member</TableCell>
                  <TableCell>Robert Chen</TableCell>
                  <TableCell>301</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Building Amenities</CardTitle>
            <CardDescription>Facilities available to residents</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-slate-50 p-4 rounded-md">
                <h3 className="font-medium mb-2">Swimming Pool</h3>
                <p className="text-sm text-muted-foreground">Open 6:00 AM - 10:00 PM daily</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-md">
                <h3 className="font-medium mb-2">Gym</h3>
                <p className="text-sm text-muted-foreground">24/7 access with security fob</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-md">
                <h3 className="font-medium mb-2">BBQ Area</h3>
                <p className="text-sm text-muted-foreground">Bookings required via building manager</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-md">
                <h3 className="font-medium mb-2">Visitor Parking</h3>
                <p className="text-sm text-muted-foreground">5 spaces available, 48-hour maximum</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-md">
                <h3 className="font-medium mb-2">Rooftop Garden</h3>
                <p className="text-sm text-muted-foreground">Open to all residents 8:00 AM - 8:00 PM</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-md">
                <h3 className="font-medium mb-2">Storage Units</h3>
                <p className="text-sm text-muted-foreground">One per apartment in basement level</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
