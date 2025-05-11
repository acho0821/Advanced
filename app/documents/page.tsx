"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { FileText, Download, Upload, Trash2, Bug } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { getSupabaseBrowserClient } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import InitializeStorage from "./init-storage"

interface Document {
  id: string
  name: string
  type: string
  file_path: string
  file_size: number
  uploaded_by: string
  created_at: string
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [documentName, setDocumentName] = useState("")
  const [documentType, setDocumentType] = useState("insurance")
  const [showDebug, setShowDebug] = useState(false)
  const [debugInfo, setDebugInfo] = useState<any>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
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
    fetchDocuments()
  }, [router, supabase])

  const fetchDocuments = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase.from("documents").select("*").order("created_at", { ascending: false })

      if (error) {
        throw error
      }

      setDocuments(data || [])
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

  const checkBucketExists = async () => {
    try {
      // Check if bucket exists
      const { data: buckets, error } = await supabase.storage.listBuckets()

      if (error) {
        throw error
      }

      const bucket = buckets.find((b) => b.name === "strata-documents")

      if (!bucket) {
        // Create bucket if it doesn't exist
        await initializeBucket()
      }

      return true
    } catch (error) {
      console.error("Error checking bucket:", error)
      return false
    }
  }

  const initializeBucket = async () => {
    try {
      const response = await fetch("/api/storage/init-bucket", {
        method: "POST",
      })

      if (!response.ok) {
        throw new Error("Failed to initialize storage bucket")
      }

      return true
    } catch (error) {
      console.error("Error initializing bucket:", error)
      return false
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

    if (!isAdmin) {
      toast({
        title: "Error",
        description: "Only administrators can upload documents",
        variant: "destructive",
      })
      return
    }

    try {
      setUploading(true)
      setDebugInfo(null)

      // Make sure bucket exists
      const bucketExists = await checkBucketExists()

      if (!bucketExists) {
        throw new Error("Storage bucket not available. Please try initializing it again.")
      }

      // Create a unique file path to avoid conflicts
      const timestamp = Date.now()
      const filePath = `${timestamp}_${selectedFile.name.replace(/\s+/g, "_")}`

      if (showDebug) {
        console.log("Uploading file:", filePath, "Size:", selectedFile.size, "Type:", selectedFile.type)
      }

      // Upload file to Supabase Storage with upsert enabled
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("strata-documents")
        .upload(filePath, selectedFile, {
          cacheControl: "3600",
          upsert: true,
        })

      if (uploadError) {
        if (showDebug) {
          setDebugInfo({ uploadError })
        }
        throw uploadError
      }

      if (showDebug) {
        console.log("Upload successful:", uploadData)
      }

      // Add document record to the database
      const { error: dbError } = await supabase.from("documents").insert({
        name: documentName || selectedFile.name,
        type: documentType,
        file_path: filePath,
        file_size: selectedFile.size,
        uploaded_by: user.id,
      })

      if (dbError) {
        if (showDebug) {
          setDebugInfo({ dbError })
        }
        throw dbError
      }

      // Reset form
      setSelectedFile(null)
      setDocumentName("")
      setDocumentType("insurance")
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }

      // Show success message
      toast({
        title: "Success",
        description: "Document uploaded successfully",
      })

      // Refresh documents list
      fetchDocuments()
    } catch (error: any) {
      console.error("Error uploading document:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to upload document",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
    }
  }

  const runDiagnostics = async () => {
    try {
      setDebugInfo(null)

      // Check bucket exists
      const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()

      const diagnostics: any = {
        buckets: {
          success: !bucketsError,
          data: buckets,
          error: bucketsError?.message,
        },
      }

      const bucket = buckets?.find((b) => b.name === "strata-documents")
      diagnostics.bucketExists = !!bucket

      if (bucket) {
        // Try to upload a test file
        const testBlob = new Blob(["test content"], { type: "text/plain" })
        const testFile = `test-${Date.now()}.txt`

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("strata-documents")
          .upload(testFile, testBlob, { upsert: true })

        diagnostics.testUpload = {
          success: !uploadError,
          data: uploadData,
          error: uploadError?.message,
        }

        if (!uploadError) {
          // Try to delete the test file
          const { error: deleteError } = await supabase.storage.from("strata-documents").remove([testFile])

          diagnostics.testDelete = {
            success: !deleteError,
            error: deleteError?.message,
          }
        }
      }

      // Check user permissions
      const { data: session } = await supabase.auth.getSession()
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", session?.session?.user?.id)
        .single()

      diagnostics.user = {
        id: session?.session?.user?.id,
        role: profile?.role,
        isAdmin: profile?.role === "admin",
      }

      setDebugInfo(diagnostics)

      if (diagnostics.testUpload?.success) {
        toast({
          title: "Diagnostics",
          description: "Storage system appears to be working correctly",
        })
      } else {
        toast({
          title: "Diagnostics",
          description: "Issues detected with storage system",
          variant: "destructive",
        })
      }
    } catch (error: any) {
      console.error("Error running diagnostics:", error)
      setDebugInfo({ error: error.message })
    }
  }

  const handleDownload = async (document: Document) => {
    try {
      const { data, error } = await supabase.storage.from("strata-documents").download(document.file_path)

      if (error) {
        throw error
      }

      // Create a download link
      const url = URL.createObjectURL(data)
      const a = document.createElement("a")
      a.href = url
      a.download = document.name
      document.body.appendChild(a)
      a.click()
      URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error: any) {
      console.error("Error downloading document:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to download document",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async (id: string, filePath: string) => {
    if (!isAdmin) {
      toast({
        title: "Error",
        description: "Only administrators can delete documents",
        variant: "destructive",
      })
      return
    }

    try {
      // Delete file from storage
      const { error: storageError } = await supabase.storage.from("strata-documents").remove([filePath])

      if (storageError) {
        console.error("Error deleting file from storage:", storageError)
      }

      // Delete record from database
      const { error: dbError } = await supabase.from("documents").delete().eq("id", id)

      if (dbError) {
        throw dbError
      }

      toast({
        title: "Success",
        description: "Document deleted successfully",
      })

      // Refresh documents list
      fetchDocuments()
    } catch (error: any) {
      console.error("Error deleting document:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to delete document",
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

      {isAdmin && (
        <div className="mb-6 flex justify-between items-center">
          <InitializeStorage />
          <Button variant="outline" onClick={() => setShowDebug(!showDebug)}>
            <Bug className="h-4 w-4 mr-2" />
            {showDebug ? "Hide Debug" : "Debug Tools"}
          </Button>
        </div>
      )}

      {isAdmin && showDebug && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Storage Diagnostics</CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={runDiagnostics} className="mb-4">
              Run Diagnostics
            </Button>

            {debugInfo && (
              <div className="bg-slate-100 p-4 rounded-md overflow-auto max-h-96">
                <pre className="text-xs">{JSON.stringify(debugInfo, null, 2)}</pre>
              </div>
            )}
          </CardContent>
        </Card>
      )}

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
                          <TableCell>{formatFileSize(doc.file_size)}</TableCell>
                          <TableCell>{formatDate(doc.created_at)}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="ghost" size="icon" title="Download" onClick={() => handleDownload(doc)}>
                                <Download className="h-4 w-4" />
                              </Button>
                              {isAdmin && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  title="Delete"
                                  onClick={() => handleDelete(doc.id, doc.file_path)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center">
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

        {isAdmin && (
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
                    <Input id="file" type="file" ref={fileInputRef} onChange={handleFileChange} />
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

                  <Button type="submit" className="w-full" disabled={uploading || !selectedFile}>
                    <Upload className="h-4 w-4 mr-2" />
                    {uploading ? "Uploading..." : "Upload Document"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
