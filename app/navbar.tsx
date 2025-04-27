import Link from "next/link"

export default function Navbar() {
  return (
    <nav className="bg-slate-800 text-white p-4">
      <div className="container mx-auto flex flex-wrap items-center justify-between">
        <Link href="/" className="text-xl font-bold">
          Strata Management
        </Link>
        <div className="flex flex-wrap gap-4">
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
          <Link href="/login" className="hover:text-slate-300">
            Login
          </Link>
        </div>
      </div>
    </nav>
  )
}
