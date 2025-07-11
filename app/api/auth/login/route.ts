import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { v4 as uuidv4 } from "uuid"
import clientPromise from "@/lib/mongodb"
import bcrypt from "bcryptjs"

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json()

    // Validate input
    if (!username || !password) {
      return NextResponse.json({ error: "Username and password are required" }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db("finance-tracker")
    const usersCollection = db.collection("users")

    // Find user
    const user = await usersCollection.findOne({ username })
    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // Set session cookie
    const sessionId = uuidv4()
    const oneWeek = 7 * 24 * 60 * 60 * 1000
    cookies().set("session", sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: oneWeek,
      path: "/",
    })

    // Store session
    await db.collection("sessions").insertOne({
      sessionId,
      userId: user._id,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + oneWeek),
    })

    return NextResponse.json({
      id: user._id,
      username: user.username,
    })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Failed to login" }, { status: 500 })
  }
}
