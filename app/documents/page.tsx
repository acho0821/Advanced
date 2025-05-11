"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { FileText, Download } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { getSupabaseBrowserClient } from "@/lib/supabase"
import { useRouter } from "next/navigation"

// Example documents data
const exampleDocuments = [
  {
    id: "1",
    name: "Building Insurance Policy.pdf",
    type: "insurance",
    size: 2500000,
    date: "2023-05-15T10:30:00Z",
    url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
  },
  {
    id: "2",
    name: "Annual Financial Report.pdf",
    type: "financial",
    size: 1800000,
    date: "2023-04-20T14:15:00Z",
    url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
  },
  {
    id: "3",
    name: "Strata Bylaws.pdf",
    type: "legal",
    size: 3200000,
    date: "2023-03-10T09:45:00Z",
    url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
  },
  {
    id: "4",
    name: "AGM Minutes 2023.pdf",
    type: "minutes",
    size: 1500000,
    date: "2023-06-05T16:20:00Z",
    url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
  },
  {
    id: "5",
    name: "Fire Safety Compliance Certificate.pdf",
    type: "compliance",
    size: 950000,
    date: "2023-02-28T11:10:00Z",
    url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
  },
]

interface Document {
  id: string
  name: string
  type: string
  size: number
  date: string
  url: string
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [isAdmin, setIsAdmin] = useState(false)
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
      } catch (error) {
        console.error("Session error:", error)
        router.push("/login")
      }
    }

    checkSession()

    // Load example documents
    setDocuments(exampleDocuments)
    setLoading(false)
  }, [router, supabase])

  const handleDownload = (document: Document) => {
    try {
      // Create a download link
      const a = document.createElement("a")
      a.href = document.url
      a.download = document.name
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)

      toast({
        title: "Download Started",
        description: `Downloading ${document.name}`,
      })
    } catch (error: any) {
      console.error("Error downloading document:", error)
      toast({
        title: "Error",
        description: "Failed to download document",
        variant: "destructive",
      })
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i]
  }

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    return date.toLocaleDateString() + " " + date.toLocaleTimeString()
  }

  const getDocumentTypeLabel = (type: string): string => {
    const types: { [key: string]: string } = {
      insurance: "Insurance",
      financial: "Financial",
      legal: "Legal",
      minutes: "Minutes",
      compliance: "Compliance",
      other: "Other",
    }
    return types[type] || "Other"
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-6">Document Storage</h1>

      <Card>
        <CardHeader>
          <CardTitle>Building Documents</CardTitle>
          <CardDescription>Access important building documents</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-4">Loading documents...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {documents.map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        {doc.name}
                      </div>
                    </TableCell>
                    <TableCell>{getDocumentTypeLabel(doc.type)}</TableCell>
                    <TableCell>{formatFileSize(doc.size)}</TableCell>
                    <TableCell>{formatDate(doc.date)}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" title="Download" onClick={() => handleDownload(doc)}>
                        <Download className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
