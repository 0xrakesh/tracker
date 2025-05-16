import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import clientPromise from "@/lib/mongodb"

export async function GET() {
  try {
    const sessionId = cookies().get("session")?.value

    if (!sessionId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const client = await clientPromise
    const db = client.db("finance-tracker")

    // Find session
    const session = await db.collection("sessions").findOne({
      sessionId,
      expiresAt: { $gt: new Date() },
    })

    if (!session) {
      cookies().delete("session")
      return NextResponse.json({ error: "Session expired" }, { status: 401 })
    }

    // Find user
    const user = await db.collection("users").findOne({ _id: session.userId })

    if (!user) {
      cookies().delete("session")
      return NextResponse.json({ error: "User not found" }, { status: 401 })
    }

    return NextResponse.json({
      id: user._id,
      username: user.username,
    })
  } catch (error) {
    console.error("Auth check error:", error)
    return NextResponse.json({ error: "Authentication failed" }, { status: 500 })
  }
}
