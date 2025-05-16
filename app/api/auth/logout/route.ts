import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import clientPromise from "@/lib/mongodb"

export async function POST() {
  try {
    const sessionId = cookies().get("session")?.value

    if (sessionId) {
      // Delete session from database
      const client = await clientPromise
      const db = client.db("finance-tracker")
      await db.collection("sessions").deleteOne({ sessionId })

      // Clear cookie
      cookies().delete("session")
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Logout error:", error)
    return NextResponse.json({ error: "Failed to logout" }, { status: 500 })
  }
}
