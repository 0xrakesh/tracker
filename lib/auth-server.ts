import clientPromise from "./mongodb"
import { ObjectId } from "mongodb"

export async function getAuthUser(sessionId: string) {
  try {
    const client = await clientPromise
    const db = client.db("finance-tracker")

    const session = await db.collection("sessions").findOne({
      sessionId,
      expiresAt: { $gt: new Date() },
    })

    if (!session) {
      return null
    }

    const user = await db.collection("users").findOne({
      _id: new ObjectId(session.userId),
    })

    return user
  } catch (error) {
    console.error("Error getting auth user:", error)
    return null
  }
}
