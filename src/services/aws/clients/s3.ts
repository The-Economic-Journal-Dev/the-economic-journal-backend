// awsConfig.ts
import { S3Client } from "@aws-sdk/client-s3";

// Define the configuration options for the S3 client
/**
 * Configuration object for S3 client.
 * @typedef {Object} S3Config
 * @property {string} region - The AWS region.
 * @property {string} accessKeyId - The AWS access key ID.
 * @property {string} secretAccessKey - The AWS secret access key.
 */
export interface S3Config {
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
  endpoint: string;
}

// Function to create and return an S3 client
/**
 * Creates and returns an S3 client.
 *
 * @param {S3Config} config - The configuration for the S3 client.
 * @returns {S3Client} The configured S3 client.
 *
 * @example
 * const config = {
 *   region: 'us-east-1',
 *   accessKeyId: 'your-access-key-id',
 *   secretAccessKey: 'your-secret-access-key'
 * };
 * const s3Client = createS3Client(config);
 */
const createS3Client = (config: S3Config): S3Client => {
  return new S3Client({
    region: config.region,
    endpoint: config.endpoint,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
    logger: {
      debug: () => {}, // No-op function
      info: () => {}, // No-op function
      warn: console.warn.bind(console),
      error: console.error.bind(console),
    },
  });
};

export default createS3Client;
