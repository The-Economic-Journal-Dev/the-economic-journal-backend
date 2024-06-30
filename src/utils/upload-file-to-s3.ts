import { Request, Response } from "express";
import createS3Client, { S3Config } from "../services/aws/clients/s3";
import uploadFileToS3SerVice, {
  UploadOptions,
} from "../services/aws/s3-file-upload";
import { S3Client } from "@aws-sdk/client-s3";
import path from "path";
import { StatusCodes } from "http-status-codes";

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
const generateUniqueImageName = (
  identifier: string,
  extension: string,
): string => {
  const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
  return `${identifier}-${uniqueSuffix}.${extension}`;
};

/**
 * Hashmap mapping MIME types to file extensions for common image formats and HTML.
 */
const mimeTypeToExtension: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/gif": "gif",
  "text/html": "html",
};

function getExtensionFromMimeType(mimeType: string): string {
  const extension = mimeTypeToExtension[mimeType];

  if (!extension) {
    throwError("Invalid MIME type", StatusCodes.BAD_REQUEST);
  }

  return extension;
}

/**
 * Uploads a file to an S3 bucket.
 *
 * @param file - The file to be uploaded.
 * @param filename - (optional) The name of the file to be uploaded
 * @returns A promise that resolves to the URL of the uploaded file.
 * @throws Will throw an error if no file is uploaded or if the upload fails.
 */
const uploadFileToS3 = async (
  file: Express.Multer.File,
  filename: string | undefined = undefined,
): Promise<string> => {
  if (!file) {
    throw new Error("No file uploaded");
  }

  try {
    console.log(`Processing file: ${file.originalname}`);

    const ext: string = getExtensionFromMimeType(file.mimetype);

    // Generate a unique filename if one is not provided
    if (filename) {
      console.log(`File name: ${filename} detected`);
    }
    let fileName = filename || generateUniqueImageName(file.fieldname, ext);

    // Create the upload parameters
    const uploadParams: UploadOptions = {
      Bucket: process.env.AWS_S3_BUCKET_NAME!,
      Key: fileName,
      Body: file.buffer,
      ContentType: file.mimetype,
    };

    // Upload the file to S3
    await uploadFileToS3SerVice(uploadParams, s3Client);

    return `${process.env.CLOUDFRONT_URI!}/${fileName}`;
  } catch (error) {
    console.log("An error has occurred while uploading file" + error);
    throw error;
  }
};

export default uploadFileToS3;
