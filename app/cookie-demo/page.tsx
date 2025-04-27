"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function CookieDemoPage() {
  const [name, setName] = useState("")
  const [theme, setTheme] = useState("light")
  const [savedCookies, setSavedCookies] = useState<{ [key: string]: string }>({})

  // Load cookies on component mount
  useEffect(() => {
    const cookies = document.cookie.split(";").reduce(
      (acc, cookie) => {
        const [key, value] = cookie.trim().split("=")
        if (key && value) {
          acc[key] = value
        }
        return acc
      },
      {} as { [key: string]: string },
    )

    setSavedCookies(cookies)

    // Set initial values from cookies if they exist
    if (cookies.userName) {
      setName(decodeURIComponent(cookies.userName))
    }

    if (cookies.theme) {
      setTheme(cookies.theme)
    }
  }, [])

  const setCookie = (name: string, value: string, days = 7) => {
    const date = new Date()
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000)
    const expires = "; expires=" + date.toUTCString()
    document.cookie = name + "=" + value + expires + "; path=/"

    // Update saved cookies state
    setSavedCookies((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const deleteCookie = (name: string) => {
    document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"

    // Update saved cookies state
    setSavedCookies((prev) => {
      const newCookies = { ...prev }
      delete newCookies[name]
      return newCookies
    })
  }

  const handleSaveName = () => {
    if (name) {
      setCookie("userName", encodeURIComponent(name))
    }
  }

  const handleSaveTheme = () => {
    setCookie("theme", theme)

    // Apply theme to body (in a real app, you'd use a theme provider)
    if (theme === "dark") {
      document.body.classList.add("dark-theme")
    } else {
      document.body.classList.remove("dark-theme")
    }
  }

  const handleDeleteAllCookies = () => {
    Object.keys(savedCookies).forEach((cookieName) => {
      deleteCookie(cookieName)
    })
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-6">Cookie Management Demo</h1>

      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Cookie Management</CardTitle>
              <CardDescription>
                Learn how cookies work and how they can be used to store user preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="set">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="set">Set Cookies</TabsTrigger>
                  <TabsTrigger value="view">View Cookies</TabsTrigger>
                </TabsList>

                <TabsContent value="set" className="space-y-6 pt-4">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Your Name</Label>
                      <div className="flex gap-2">
                        <Input
                          id="name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Enter your name"
                        />
                        <Button onClick={handleSaveName}>Save</Button>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        This will be saved as a cookie and remembered when you return.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="theme">Theme Preference</Label>
                      <div className="flex gap-2">
                        <select
                          id="theme"
                          value={theme}
                          onChange={(e) => setTheme(e.target.value)}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <option value="light">Light</option>
                          <option value="dark">Dark</option>
                          <option value="system">System</option>
                        </select>
                        <Button onClick={handleSaveTheme}>Save</Button>
                      </div>
                      <p className="text-sm text-muted-foreground">Your theme preference will be saved as a cookie.</p>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="view" className="pt-4">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Current Cookies</h3>

                    {Object.keys(savedCookies).length > 0 ? (
                      <div className="border rounded-md">
                        <div className="grid grid-cols-3 font-medium p-2 border-b bg-muted">
                          <div>Name</div>
                          <div>Value</div>
                          <div></div>
                        </div>
                        {Object.entries(savedCookies).map(([key, value]) => (
                          <div key={key} className="grid grid-cols-3 p-2 border-b last:border-0">
                            <div className="font-medium">{key}</div>
                            <div>{key === "userName" ? decodeURIComponent(value) : value}</div>
                            <div className="text-right">
                              <Button variant="ghost" size="sm" onClick={() => deleteCookie(key)}>
                                Delete
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground">No cookies found.</p>
                    )}

                    {Object.keys(savedCookies).length > 0 && (
                      <Button variant="destructive" size="sm" onClick={handleDeleteAllCookies}>
                        Delete All Cookies
                      </Button>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>About Cookies in Web Development</CardTitle>
              <CardDescription>Understanding how cookies work and their use cases</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-2">What are Cookies?</h3>
                <p>
                  Cookies are small pieces of data stored on the user's browser. They are sent with every request to the
                  server and can be used to maintain state between page loads.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">Common Uses of Cookies</h3>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Session management (keeping users logged in)</li>
                  <li>Storing user preferences</li>
                  <li>Tracking user behavior</li>
                  <li>Implementing shopping carts</li>
                  <li>Remembering form data</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">Cookie Properties</h3>
                <ul className="list-disc pl-5 space-y-1">
                  <li>
                    <strong>Name and Value:</strong> The data stored in the cookie
                  </li>
                  <li>
                    <strong>Expires/Max-Age:</strong> When the cookie should be deleted
                  </li>
                  <li>
                    <strong>Domain:</strong> Which domains can access the cookie
                  </li>
                  <li>
                    <strong>Path:</strong> Which paths on the domain can access the cookie
                  </li>
                  <li>
                    <strong>Secure:</strong> Only sent over HTTPS connections
                  </li>
                  <li>
                    <strong>HttpOnly:</strong> Cannot be accessed by JavaScript
                  </li>
                  <li>
                    <strong>SameSite:</strong> Controls when cookies are sent with cross-site requests
                  </li>
                </ul>
              </div>
            </CardContent>
            <CardFooter>
              <p className="text-sm text-muted-foreground">
                In this demo, we're using cookies to store your name and theme preference. Try setting these values and
                then refreshing the page to see how cookies persist.
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}
