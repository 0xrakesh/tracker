import { cookies } from "next/headers"
import clientPromise from "./mongodb"
import { ObjectId } from "mongodb"

export interface User {
  _id: ObjectId
  username: string
  email: string
}

export async function getAuthUser(): Promise<User | null> {
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
      _id: new ObjectId(session.userId),
    })

    if (!user) {
      return null
    }

    return {
      _id: user._id,
      username: user.username,
      email: user.email,
    }
  } catch (error) {
    console.error("Error getting auth user:", error)
    return null
  }
}
