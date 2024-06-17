import { Request, Response } from "express";
import createS3Client, { S3Config } from "../services/aws/clients/s3";
import uploadFileToS3SerVice, {
  UploadOptions,
} from "../services/aws/s3-file-upload";
import { S3Client } from "@aws-sdk/client-s3";
import path from "path";

// Define the S3 configuration
const s3Config: S3Config = {
  region: process.env.AWS_S3_REGION!,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
};

// Create an S3 client
const s3Client: S3Client = createS3Client(s3Config);

/**
 * Generates a unique filename based on an identifier.
 *
 * @param identifier - The identifier to include in the filename.
 * @returns The generated unique filename.
 */
const generateUniqueFilename = (identifier: string): string => {
  const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
  return `${identifier}-${uniqueSuffix}`;
};

/**
 * Uploads a file to an S3 bucket.
 *
 * @param file - The file to be uploaded.
 * @returns A promise that resolves to the URL of the uploaded file.
 * @throws Will throw an error if no file is uploaded or if the upload fails.
 */
const uploadFileToS3 = async (file: Express.Multer.File): Promise<string> => {
  if (!file) {
    throw new Error("No file uploaded");
  }

  try {
    console.log(`Processing file: ${file.originalname}`);

    const fileName = generateUniqueFilename(file.fieldname);

    // Create the upload parameters
    const uploadParams: UploadOptions = {
      Bucket: process.env.AWS_S3_BUCKET_NAME!,
      Key: fileName,
      Body: file.buffer,
    };

    // Upload the file to S3
    await uploadFileToS3SerVice(uploadParams, s3Client);

    return path.join(process.env.CLOUDFRONT_URI!, fileName);
  } catch (error) {
    console.log("An error has occurred while uploading file" + error);
    throw error;
  }
};

export default uploadFileToS3;
