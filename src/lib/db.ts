import mongoose from "mongoose";

const globalForMongoose = global as typeof globalThis & { mongoose?: { connection: typeof mongoose | null; promise: Promise<typeof mongoose> | null } };
const cached = globalForMongoose.mongoose ?? { connection: null, promise: null };
globalForMongoose.mongoose = cached;

export async function connectDb() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is not configured.");
  if (cached.connection) return cached.connection;
  if (!cached.promise) {
    cached.promise = mongoose.connect(uri, { bufferCommands: false, serverSelectionTimeoutMS: 5000 });
  }
  try {
    cached.connection = await cached.promise;
    return cached.connection;
  } catch (error) {
    cached.promise = null;
    throw error;
  }
}
