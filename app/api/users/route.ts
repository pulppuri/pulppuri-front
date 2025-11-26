import { type NextRequest, NextResponse } from "next/server"

// Mock API route for testing - generates a random user ID
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Generate a random user ID for testing
    const userid = `user_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`

    console.log("[v0] Mock API - User created:", { userid, ...body })

    return NextResponse.json({
      userid,
      ...body,
      createdAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error("[v0] Mock API error:", error)
    return NextResponse.json({ error: "사용자 생성 실패" }, { status: 500 })
  }
}
