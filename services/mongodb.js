import { MongoClient, ServerApiVersion } from "mongodb";

const MONGODB_URL = process.env.MONGODB_URL;

if (!MONGODB_URL) {
  throw Error("MongoDB URL was not found! Please provide the MongoDB URL.");
}

const client = new MongoClient(MONGODB_URL, {
  connectTimeoutMS: 30000,
  serverApi: {
    version: ServerApiVersion.v1,
    deprecationErrors: true,
  },
});

client
  .connect()
  .then(client => {
    console.log("Successfully connected to MongoDB");
    return client;
  })
  .catch(err => {
    console.error(err);
    return client;
  });

export { client as mongodbClient };
