"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { getSupabaseBrowserClient } from "@/lib/supabase"
import { Button } from "@/components/ui/button"

export default function Navbar() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const pathname = usePathname()
  const router = useRouter()
  const supabase = getSupabaseBrowserClient()

  useEffect(() => {
    const checkSession = async () => {
      try {
        setLoading(true)
        const { data } = await supabase.auth.getSession()
        setUser(data.session?.user || null)
      } catch (error) {
        console.error("Session error:", error)
      } finally {
        setLoading(false)
      }
    }

    checkSession()

    // Set up auth state change listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase.auth])

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      router.push("/login")
      router.refresh()
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  return (
    <nav className="bg-slate-800 text-white p-4">
      <div className="container mx-auto flex flex-wrap items-center justify-between">
        <Link href="/" className="text-xl font-bold">
          Strata Management
        </Link>
        <div className="flex flex-wrap gap-4 items-center">
          <Link href="/dashboard" className="hover:text-slate-300">
            Dashboard
          </Link>
          <Link href="/strata-roll" className="hover:text-slate-300">
            Strata Roll
          </Link>
          <Link href="/maintenance" className="hover:text-slate-300">
            Maintenance
          </Link>
          <Link href="/documents" className="hover:text-slate-300">
            Documents
          </Link>
          <Link href="/building-info" className="hover:text-slate-300">
            Building Info
          </Link>
          <Link href="/committee-info" className="hover:text-slate-300">
            Committee Info
          </Link>
          <Link href="/entitlements-calculator" className="hover:text-slate-300">
            Entitlements
          </Link>
          <Link href="/levies" className="hover:text-slate-300">
            Levies
          </Link>
          <Link href="/budget" className="hover:text-slate-300">
            Budget
          </Link>
          <Link href="/cookie-demo" className="hover:text-slate-300">
            Preferences
          </Link>

          {!loading && (
            <>
              {user ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="bg-slate-700 hover:bg-slate-600 text-white border-slate-600"
                >
                  Logout
                </Button>
              ) : (
                <Link href="/login" className="hover:text-slate-300">
                  Login
                </Link>
              )}
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
