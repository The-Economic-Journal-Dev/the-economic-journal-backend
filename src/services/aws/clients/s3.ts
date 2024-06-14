// awsConfig.ts
import { S3Client } from "@aws-sdk/client-s3";

// Define the configuration options for the S3 client
export interface S3Config {
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
}

// Function to create and return an S3 client
const createS3Client = (config: S3Config): S3Client => {
  return new S3Client({
    region: config.region,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
  });
};

export default createS3Client;
