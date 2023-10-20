import { MongoClient, ServerApiVersion } from "mongodb";

const MONGODB_URL = process.env.MONGODB_URL;

if (!MONGODB_URL) {
  throw Error("MongoDB URL was not found! Please provide the MongoDB URL.");
}

const client = new MongoClient(MONGODB_URL, {
  serverApi: {
    version: ServerApiVersion.v1,
    deprecationErrors: true,
  },
});

export const clientPromise = client.connect().then(client => {
  console.log("Successfully connected to MongoDB");
  return client;
});
