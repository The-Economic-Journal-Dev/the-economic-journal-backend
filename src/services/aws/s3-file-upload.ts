import { Upload } from "@aws-sdk/lib-storage";
import { S3Client, PutObjectCommandInput } from "@aws-sdk/client-s3";
import { Readable } from "stream";

// Define the upload options interface
export interface UploadOptions {
  Bucket: string; // The name of the S3 bucket
  Key: string; // The key (path) where the file will be stored in the bucket
  Body: Buffer | Uint8Array | Blob | string | ReadableStream | Readable; // The content to be uploaded
  ContentType?: string; // Optional: The MIME type of the file
}

/**
 * Uploads a file to an S3 bucket.
 *
 * @param config - The upload options, including bucket name, key, and body.
 * @param s3Client - The S3 client instance.
 * @returns Promise<void> - A promise that resolves when the upload is complete.
 * @throws Will throw an error if the upload fails.
 */
const uploadFileToS3Service = async (
  config: UploadOptions,
  s3Client: S3Client,
): Promise<void> => {
  // Create the upload parameters
  const uploadParams: PutObjectCommandInput = {
    Bucket: config.Bucket,
    Key: config.Key,
    Body: config.Body,
  };

  try {
    // Create a new upload instance and start the upload
    const parallelUploads3 = new Upload({
      client: s3Client,
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

export default uploadFileToS3Service;
