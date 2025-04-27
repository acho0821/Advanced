import { NextResponse } from "next/server"

// Mock database for maintenance requests
const mockRequests = [
  {
    id: 1,
    unit: "101",
    title: "Leaking Faucet",
    description: "The kitchen faucet is leaking and needs repair.",
    status: "pending",
    createdAt: "2023-04-15T10:30:00Z",
    updatedAt: "2023-04-15T10:30:00Z",
  },
  {
    id: 2,
    unit: "203",
    title: "Broken Light Fixture",
    description: "The hallway light fixture is broken and needs replacement.",
    status: "in-progress",
    createdAt: "2023-04-10T14:45:00Z",
    updatedAt: "2023-04-12T09:15:00Z",
  },
  {
    id: 3,
    unit: "302",
    title: "AC Not Working",
    description: "The air conditioning unit is not cooling properly.",
    status: "completed",
    createdAt: "2023-04-05T08:20:00Z",
    updatedAt: "2023-04-08T16:30:00Z",
  },
]

export async function GET() {
  try {
    // Simulate database latency
    await new Promise((resolve) => setTimeout(resolve, 500))

    return NextResponse.json({ requests: mockRequests })
  } catch (error) {
    console.error("Error fetching maintenance requests:", error)
    return NextResponse.json({ error: "Failed to fetch maintenance requests" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()

    // Validate required fields
    if (!data.unit || !data.title || !data.description) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Create new maintenance request
    const newRequest = {
      id: mockRequests.length + 1,
      unit: data.unit,
      title: data.title,
      description: data.description,
      status: "pending",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    // In a real implementation, this would insert into your database

    // Simulate database latency
    await new Promise((resolve) => setTimeout(resolve, 500))

    // Return success response
    return NextResponse.json({
      success: true,
      message: "Maintenance request created successfully",
      request: newRequest,
    })
  } catch (error) {
    console.error("Error creating maintenance request:", error)
    return NextResponse.json({ error: "Failed to create maintenance request" }, { status: 500 })
  }
}
