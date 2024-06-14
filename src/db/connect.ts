import mongoose, { Mongoose } from "mongoose";
import type { MongoClient } from "mongodb";
import MongoStore from "connect-mongo";
import { error } from "console";

// Function to connect to MongoDB
const connectToDB = async (url: string) => {
  try {
    const connection = await mongoose.connect(url, {
      useNewUrlParser: true,
      useCreateIndex: true,
      useFindAndModify: false,
      useUnifiedTopology: true,
    });
    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};

const getMongooseClient = (): Promise<MongoClient> => {
  return new Promise((resolve, reject) => {
    mongoose.connection.once("connected", () => {
      try {
        const client: MongoClient = mongoose.connection.getClient();
        resolve(client);
      } catch (error) {
        reject(error);
      }
    });

    mongoose.connection.on("error", (error) => {
      reject(error);
    });

    if (mongoose.connection.readyState === 1) {
      // Already connected
      try {
        const client: MongoClient = mongoose.connection.getClient();
        resolve(client);
      } catch (error) {
        reject(error);
      }
    }
  });
};

//MongoDB session
const sessionStorage = new MongoStore({
  clientPromise: getMongooseClient(),
  collectionName: "sessions",
  ttl: 60 * 60 * 24 * 14, // 2 week
  autoRemove: "native",
});

sessionStorage.on("connected", () => {
  console.log("MongoDB session storage connected");
});

sessionStorage.on("error", (error) => {
  console.log(
    "An error occurred while connecting to MongoDB session storage: " + error,
  );
  throw error;
});

export { sessionStorage };
export default connectToDB;
