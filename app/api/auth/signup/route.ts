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

    // Check if user already exists
    const existingUser = await usersCollection.findOne({ username })
    if (existingUser) {
      return NextResponse.json({ error: "Username already exists" }, { status: 409 })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user
    const userId = uuidv4()
    const user = {
      _id: userId,
      username,
      password: hashedPassword,
      createdAt: new Date(),
    }

    await usersCollection.insertOne(user)

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
      userId,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + oneWeek),
    })

    return NextResponse.json({
      id: userId,
      username,
    })
  } catch (error) {
    console.error("Signup error:", error)
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 })
  }
}
