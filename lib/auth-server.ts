import { cookies } from "next/headers"
import clientPromise from "./mongodb"

export async function getAuthUser() {
  try {
    const sessionId = cookies().get("session")?.value

    if (!sessionId) {
      return null
    }

    const client = await clientPromise
    const db = client.db("finance-tracker")

    // Find session
    const session = await db.collection("sessions").findOne({
      sessionId,
      expiresAt: { $gt: new Date() },
    })

    if (!session) {
      return null
    }

    // Find user
    const user = await db.collection("users").findOne({
      _id: session.userId,
    })

    if (!user) {
      return null
    }

    return {
      id: user._id.toString(),
      username: user.username,
      email: user.email,
    }
  } catch (error) {
    console.error("Error getting auth user:", error)
    return null
  }
}
