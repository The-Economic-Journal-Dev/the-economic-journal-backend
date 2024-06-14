import { Upload } from "@aws-sdk/lib-storage";
import { S3Client, PutObjectCommandInput } from "@aws-sdk/client-s3";
import { Readable } from "stream";
import stream from "stream";

// Define the upload options
export interface UploadOptions {
  Bucket: string;
  Key: string;
  Body: Buffer | Uint8Array | Blob | string | ReadableStream | Readable;
  ContentType?: string;
}

// Function to upload a file to the S3 bucket
const uploadFileToS3SerVice = async (
  config: UploadOptions,
  s3Client: S3Client,
) => {
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

export default uploadFileToS3SerVice;
