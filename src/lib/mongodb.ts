import mongoose from "mongoose";
import dns from "dns";

// WSL2 corporate DNS (pk.folio3.com) fails to resolve MongoDB Atlas SRV records.
// Override to Google DNS so the mongodb+srv:// scheme works in development.
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/shahi-bulawa";

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var mongooseCache: MongooseCache | undefined;
}

const cached: MongooseCache = global.mongooseCache || { conn: null, promise: null };

if (!global.mongooseCache) {
  global.mongooseCache = cached;
}

export async function connectToDatabase() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 8000,
      connectTimeoutMS: 8000,
    }).then((m) => m);
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

export default connectToDatabase;
