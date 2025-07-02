import { cookies } from "next/headers"

/**
 * VERY light wrapper — replace with your real authentication lookup.
 * Returns the user object stored in cookies (if any) or `null`.
 */
export function getAuthUser() {
  const encoded = cookies().get("auth")?.value
  if (!encoded) return null

  try {
    return JSON.parse(Buffer.from(encoded, "base64url").toString()) as {
      _id: string
      email: string
      username: string // Assuming username is also part of the user object
    }
  } catch {
    return null
  }
}
