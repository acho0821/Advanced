"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { FileText, Download, Upload, Trash2, Bug, RefreshCw, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { getSupabaseBrowserClient } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import InitializeStorage from "./init-storage"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

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
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()
  const supabase = getSupabaseBrowserClient()
  const router = useRouter()

  const checkAndHandleBucketStatus = async () => {
    try {
      setError(null)

      // Check if bucket exists
      const { data: buckets, error } = await supabase.storage.listBuckets()

      if (error) {
        setError("Error checking storage buckets: " + error.message)
        return false
      }

      const bucket = buckets.find((b) => b.name === "strata-documents")

      if (!bucket) {
        setError(
          "Storage bucket 'strata-documents' not found. Please initialize it first or create it manually in the Supabase dashboard.",
        )
        return false
      }

      return true
    } catch (error: any) {
      console.error("Error checking bucket status:", error)
      setError("Error checking bucket status: " + error.message)
      return false
    }
  }

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
    checkAndHandleBucketStatus() // Add this line
  }, [router, supabase])

  const fetchDocuments = async () => {
    try {
      setLoading(true)
      setError(null)
      const { data, error } = await supabase.from("documents").select("*").order("created_at", { ascending: false })

      if (error) {
        throw error
      }

      setDocuments(data || [])
    } catch (error: any) {
      console.error("Error fetching documents:", error)
      setError("Failed to load documents: " + error.message)
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
      setError(null)
      // Check if bucket exists
      const { data: buckets, error } = await supabase.storage.listBuckets()

      if (error) {
        setError("Error checking buckets: " + error.message)
        return false
      }

      // Check for both possible bucket names (with and without hyphen)
      const bucket = buckets.find(
        (b) => b.name === "strata-documents" || b.name === "strata_documents" || b.name === "stratadocuments",
      )

      if (bucket && showDebug) {
        console.log("Found bucket:", bucket.name)
      }

      return !!bucket
    } catch (error: any) {
      console.error("Error checking bucket:", error)
      setError("Error checking bucket: " + error.message)
      return false
    }
  }

  // Add this function at the top of the component
  const getBucketName = (buckets: any[]) => {
    // Check for both possible bucket names
    const bucket = buckets.find(
      (b) => b.name === "strata-documents" || b.name === "strata_documents" || b.name === "stratadocuments",
    )

    return bucket ? bucket.name : "strata-documents"
  }

  // Then update the handleUpload function to use this
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
      setError(null)

      // Check if bucket exists and get the correct name
      const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()

      if (bucketsError) {
        throw new Error("Error checking buckets: " + bucketsError.message)
      }

      const bucketName = getBucketName(buckets)

      if (!bucketName) {
        throw new Error("Storage bucket not found. Please initialize it first.")
      }

      // Create a unique file path to avoid conflicts
      const timestamp = Date.now()
      const filePath = `${timestamp}_${selectedFile.name.replace(/\s+/g, "_")}`

      if (showDebug) {
        console.log("Uploading file to bucket:", bucketName)
        console.log("File path:", filePath)
      }

      // Upload file to Supabase Storage with upsert enabled
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(bucketName)
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
      setError("Upload failed: " + error.message)
      toast({
        title: "Error",
        description: error.message || "Failed to upload document",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
    }
  }

  // Also update the handleDownload function
  const handleDownload = async (document: Document) => {
    try {
      setError(null)

      // Get the correct bucket name
      const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()

      if (bucketsError) {
        throw new Error("Error checking buckets: " + bucketsError.message)
      }

      const bucketName = getBucketName(buckets)

      if (!bucketName) {
        throw new Error("Storage bucket not found.")
      }

      const { data, error } = await supabase.storage.from(bucketName).download(document.file_path)

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
      setError("Download failed: " + error.message)
      toast({
        title: "Error",
        description: error.message || "Failed to download document",
        variant: "destructive",
      })
    }
  }

  const runDiagnostics = async () => {
    try {
      setDebugInfo(null)
      setError(null)

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
      setError("Diagnostics failed: " + error.message)
      setDebugInfo({ error: error.message })
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
      setError(null)
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
      setError("Delete failed: " + error.message)
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

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {isAdmin && (
        <div className="mb-6 flex justify-between items-center">
          <div className="flex gap-2">
            <InitializeStorage />
            <Button variant="outline" onClick={fetchDocuments}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
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
