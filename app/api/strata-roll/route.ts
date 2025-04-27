import { NextResponse } from "next/server"

// This would connect to your actual database in production
// For demo purposes, we're using a mock database
const mockOwners = [
  {
    id: 1,
    unit: "101",
    name: "John Smith",
    email: "john.smith@example.com",
    phone: "0412 345 678",
    entitlements: 10,
  },
  {
    id: 2,
    unit: "102",
    name: "Sarah Johnson",
    email: "sarah.j@example.com",
    phone: "0423 456 789",
    entitlements: 12,
  },
  {
    id: 3,
    unit: "201",
    name: "Michael Wong",
    email: "m.wong@example.com",
    phone: "0434 567 890",
    entitlements: 15,
  },
  {
    id: 4,
    unit: "202",
    name: "Emma Davis",
    email: "emma.d@example.com",
    phone: "0445 678 901",
    entitlements: 15,
  },
  {
    id: 5,
    unit: "301",
    name: "Robert Chen",
    email: "r.chen@example.com",
    phone: "0456 789 012",
    entitlements: 18,
  },
]

export async function GET() {
  try {
    // In a real implementation, this would query your database
    // For example: const owners = await db.query('SELECT * FROM owners')

    // Simulate database latency
    await new Promise((resolve) => setTimeout(resolve, 500))

    return NextResponse.json({ owners: mockOwners })
  } catch (error) {
    console.error("Error fetching strata roll:", error)
    return NextResponse.json({ error: "Failed to fetch strata roll" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()

    // Validate required fields
    if (!data.unit || !data.name || !data.email || !data.entitlements) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // In a real implementation, this would insert into your database
    // For example: await db.query('INSERT INTO owners (unit, name, email, phone, entitlements) VALUES (?, ?, ?, ?, ?)',
    //              [data.unit, data.name, data.email, data.phone, data.entitlements])

    // Simulate database latency
    await new Promise((resolve) => setTimeout(resolve, 500))

    // Return success response
    return NextResponse.json({
      success: true,
      message: "Owner added successfully",
      owner: {
        id: mockOwners.length + 1,
        ...data,
      },
    })
  } catch (error) {
    console.error("Error adding owner:", error)
    return NextResponse.json({ error: "Failed to add owner" }, { status: 500 })
  }
}
