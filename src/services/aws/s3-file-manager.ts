import { Upload } from "@aws-sdk/lib-storage";
import {
  S3Client,
  PutObjectCommandInput,
  DeleteObjectCommand,
  DeleteObjectCommandInput,
  S3ServiceException,
} from "@aws-sdk/client-s3";
import { Readable } from "stream";
import { StatusCodes } from "http-status-codes";
import createS3Client, { S3Config } from "./clients/s3";

// Define the S3 configuration
const s3Config: S3Config = {
  region: "auto",
  accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  endpoint: process.env.AWS_S3_API_ENDPOINT!,
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
 * @param config - The upload options, including bucket name, key, body and content type.
 * @param s3Client - The S3 client instance.
 * @returns Promise<void> - A promise that resolves when the upload is complete.
 * @throws Will throw an error if the upload fails.
 */
const uploadFileToS3Service = async (
  config: PutObjectCommandInput,
  s3Client: S3Client,
): Promise<void> => {
  // Create the upload parameters
  const uploadParams = {
    Bucket: config.Bucket,
    Key: config.Key,
    Body: config.Body,
    ContentType: config.ContentType || "application/octet-stream",
  };

  try {
    // Create a new upload instance and start the upload
    const parallelUploads3 = new Upload({
      client: s3Client,
      leavePartsOnError: false, // optional manually handle dropped parts
      params: uploadParams,
    });

    // Listen to the upload progress event
    parallelUploads3.on("httpUploadProgress", (progress) => {
      console.log(progress);
    });

    // Await the completion of the upload
    await parallelUploads3.done();
    console.log(`File uploaded successfully to ${config.Bucket}/${config.Key}`);
  } catch (error) {
    console.error("Error uploading file:", error);
    throw error;
  }
};

const deleteFileFromS3Service = async (
  config: DeleteObjectCommandInput,
  s3Client: S3Client,
) => {
  const deleteObjectCommand = new DeleteObjectCommand({
    Bucket: config.Bucket,
    Key: config.Key,
  });

  await s3Client.send(deleteObjectCommand, (error, data) => {
    if (error) {
      console.log("Error deleting file:", error);
      throwError(error, StatusCodes.BAD_REQUEST);
    }
    console.log("Success. Object deleted.", data);
    return data;
  });
};

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
    const uploadParams: PutObjectCommandInput = {
      Bucket: process.env.AWS_S3_BUCKET_NAME!,
      Key: fileName,
      Body: file.buffer,
      ContentType: file.mimetype,
    };

    // Upload the file to S3
    await uploadFileToS3Service(uploadParams, s3Client);

    return `${process.env.CLOUDFRONT_URI!}/${fileName}`;
  } catch (error) {
    console.log("An error has occurred while uploading file" + error);
    throwError(error as Error);
  }
};

const deleteFileFromS3 = async (filePath: string) => {
  if (filePath === "") {
    throwError("No file path provided");
  }

  const deleteParams: DeleteObjectCommandInput = {
    Bucket: process.env.AWS_S3_BUCKET_NAME!,
    Key: filePath,
  };

  await deleteFileFromS3Service(deleteParams, s3Client);
};

export { uploadFileToS3, deleteFileFromS3 };
