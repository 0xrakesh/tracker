import { MongoClient } from "mongodb"
import mongoose from "mongoose"

if (!process.env.MONGODB_URI) {
  throw new Error("Please add your MongoDB URI to .env.local")
}

const uri = process.env.MONGODB_URI

/* -------------------------------------------------------------------------- */
/* Native MongoDB driver (kept for legacy code that still relies on it)       */
/* -------------------------------------------------------------------------- */
let client: MongoClient
let clientPromise: Promise<MongoClient>

if (process.env.NODE_ENV === "development") {
  const globalWithMongo = global as typeof global & {
    _mongoClientPromise?: Promise<MongoClient>
  }

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri)
    globalWithMongo._mongoClientPromise = client.connect()
  }
  clientPromise = globalWithMongo._mongoClientPromise
} else {
  client = new MongoClient(uri)
  clientPromise = client.connect()
}

export default clientPromise

/* -------------------------------------------------------------------------- */
/* Mongoose connection (newer code relies on this)                            */
/* -------------------------------------------------------------------------- */
let cachedMongooseConn: typeof mongoose | null = null

export async function connectToDatabase() {
  if (cachedMongooseConn) return cachedMongooseConn

  // Prevent Mongoose from re-creating models on hot-reload
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(uri, {
      dbName: "finance-tracker",
    })
  }

  cachedMongooseConn = mongoose
  return mongoose
}
