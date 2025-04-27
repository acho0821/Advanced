"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { FileText, Download, Upload, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Document {
  id: number
  name: string
  type: string
  size: string
  uploadedBy: string
  uploadedAt: string
  url: string
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [documentName, setDocumentName] = useState("")
  const [documentType, setDocumentType] = useState("insurance")
  const { toast } = useToast()

  useEffect(() => {
    fetchDocuments()
  }, [])

  const fetchDocuments = async () => {
    try {
      setLoading(true)
      // In a real app, this would be an API call
      await new Promise((resolve) => setTimeout(resolve, 500))

      // Mock data
      const mockDocuments: Document[] = [
        {
          id: 1,
          name: "Building Insurance Certificate",
          type: "insurance",
          size: "1.2 MB",
          uploadedBy: "John Smith",
          uploadedAt: "2023-05-10T14:30:00Z",
          url: "#",
        },
        {
          id: 2,
          name: "Annual Financial Report 2023",
          type: "financial",
          size: "3.5 MB",
          uploadedBy: "Sarah Johnson",
          uploadedAt: "2023-04-15T09:45:00Z",
          url: "#",
        },
        {
          id: 3,
          name: "Building Bylaws",
          type: "legal",
          size: "0.8 MB",
          uploadedBy: "Michael Wong",
          uploadedAt: "2023-03-22T11:20:00Z",
          url: "#",
        },
        {
          id: 4,
          name: "AGM Minutes - March 2023",
          type: "minutes",
          size: "1.5 MB",
          uploadedBy: "Emma Davis",
          uploadedAt: "2023-03-15T16:10:00Z",
          url: "#",
        },
        {
          id: 5,
          name: "Fire Safety Compliance Certificate",
          type: "compliance",
          size: "0.6 MB",
          uploadedBy: "John Smith",
          uploadedAt: "2023-02-28T13:40:00Z",
          url: "#",
        },
      ]

      setDocuments(mockDocuments)
    } catch (error) {
      console.error("Error fetching documents:", error)
      toast({
        title: "Error",
        description: "Failed to load documents",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setSelectedFile(file)
      if (!documentName) {
        setDocumentName(file.name)
      }
    }
  }

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedFile) {
      toast({
        title: "Error",
        description: "Please select a file to upload",
        variant: "destructive",
      })
      return
    }

    try {
      // In a real app, this would be an API call to upload the file
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Create a new document object
      const newDocument: Document = {
        id: documents.length + 1,
        name: documentName || selectedFile.name,
        type: documentType,
        size: formatFileSize(selectedFile.size),
        uploadedBy: "Current User", // In a real app, this would be the logged-in user
        uploadedAt: new Date().toISOString(),
        url: "#",
      }

      // Add the new document to the list
      setDocuments([newDocument, ...documents])

      // Reset form
      setSelectedFile(null)
      setDocumentName("")
      setDocumentType("insurance")

      // Show success message
      toast({
        title: "Success",
        description: "Document uploaded successfully",
      })
    } catch (error) {
      console.error("Error uploading document:", error)
      toast({
        title: "Error",
        description: "Failed to upload document",
        variant: "destructive",
      })
    }
  }

  const handleDelete = (id: number) => {
    // In a real app, this would be an API call to delete the document
    setDocuments(documents.filter((doc) => doc.id !== id))
    toast({
      title: "Success",
      description: "Document deleted successfully",
    })
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

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Building Documents</CardTitle>
              <CardDescription>Access and manage important building documents</CardDescription>
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
                      <TableHead>Uploaded By</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {documents.length > 0 ? (
                      documents.map((doc) => (
                        <TableRow key={doc.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4 text-muted-foreground" />
                              {doc.name}
                            </div>
                          </TableCell>
                          <TableCell>{getDocumentTypeLabel(doc.type)}</TableCell>
                          <TableCell>{doc.size}</TableCell>
                          <TableCell>{doc.uploadedBy}</TableCell>
                          <TableCell>{formatDate(doc.uploadedAt)}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="ghost" size="icon" title="Download">
                                <Download className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" title="Delete" onClick={() => handleDelete(doc.id)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center">
                          No documents found
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
              <CardTitle>Upload Document</CardTitle>
              <CardDescription>Add a new document to the repository</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpload} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="file">Select File</Label>
                  <Input id="file" type="file" onChange={handleFileChange} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name">Document Name</Label>
                  <Input
                    id="name"
                    value={documentName}
                    onChange={(e) => setDocumentName(e.target.value)}
                    placeholder="Enter document name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">Document Type</Label>
                  <select
                    id="type"
                    value={documentType}
                    onChange={(e) => setDocumentType(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="insurance">Insurance</option>
                    <option value="financial">Financial</option>
                    <option value="legal">Legal</option>
                    <option value="minutes">Meeting Minutes</option>
                    <option value="compliance">Compliance</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <Button type="submit" className="w-full" disabled={!selectedFile}>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Document
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
