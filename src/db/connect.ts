import mongoose from "mongoose";
import type { MongoClient } from "mongodb";

// Function to connect to MongoDB
const connectToDB = async (url: string) => {
  try {
    const connection = await mongoose.connect(url, {
      useNewUrlParser: true,
      useCreateIndex: true,
      useFindAndModify: false,
      useUnifiedTopology: true,
    });
    logger.info("MongoDB connected");
  } catch (error) {
    logger.error("MongoDB connection error:", error);
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

export default connectToDB;
