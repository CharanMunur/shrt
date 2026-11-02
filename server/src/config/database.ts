import mongoose from "mongoose";
import { env } from "./env.js";

let memoryServer: any = null;

export async function connectDatabase(): Promise<string> {
  const uri = env.MONGODB_URI;

  if (uri && uri.trim() !== "") {
    try {
      console.log(`Connecting to MongoDB at: ${uri.replace(/\/\/([^:]+):([^@]+)@/, "//$1:****@")}`);
      await mongoose.connect(uri);
      console.log("Connected to MongoDB successfully.");
      return uri;
    } catch (err: any) {
      console.warn("Failed to connect to provided MONGODB_URI:", err.message);
      console.log("Falling back to in-memory MongoDB for local development...");
    }
  } else {
    console.log("No MONGODB_URI specified. Initializing in-memory MongoDB instance...");
  }

  try {
    const { MongoMemoryServer } = await import("mongodb-memory-server");
    memoryServer = await MongoMemoryServer.create();
    const memoryUri = memoryServer.getUri();
    await mongoose.connect(memoryUri);
    console.log(`Connected to in-memory MongoDB at: ${memoryUri}`);
    return memoryUri;
  } catch (err: any) {
    console.error("Critical: Failed to start in-memory MongoDB:", err.message);
    throw err;
  }
}

export async function disconnectDatabase(): Promise<void> {
  try {
    await mongoose.disconnect();
    if (memoryServer) {
      await memoryServer.stop();
    }
    console.log("Database disconnected gracefully.");
  } catch (err: any) {
    console.error("Error disconnecting database:", err.message);
  }
}
