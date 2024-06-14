import { Request, Response } from "express";
import createS3Client, { S3Config } from "../services/aws/clients/s3";
import uploadFileToS3SerVice, {
  UploadOptions,
} from "../services/aws/s3-file-upload";
import { S3Client } from "@aws-sdk/client-s3";

// Define the S3 configuration
const s3Config: S3Config = {
  region: process.env.AWS_S3_REGION!,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
};

// Create an S3 client
const s3Client: S3Client = createS3Client(s3Config);

const generateUniqueFilename = (identifier: string): string => {
  const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
  return `${identifier}-${uniqueSuffix}`;
};

const uploadFileToS3 = async (req: Request, res: Response) => {
  const files = req.files;
  try {
    // Check if files is not undefined
    if (files && Array.isArray(files)) {
      // Loop through each element in the files array
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        console.log(`Processing file: ${file.originalname}`);

        // Create the upload parameters
        const uploadParams: UploadOptions = {
          Bucket: process.env.AWS_S3_BUCKET_NAME!,
          Key: generateUniqueFilename(file.fieldname),
          Body: file.buffer,
        };

        // Upload the file to S3
        await uploadFileToS3SerVice(uploadParams, s3Client);
      }
    }
    res
      .status(200)
      .json({ message: files?.length + " file(s) uploaded successfully" });
  } catch (error) {
    console.log("An error has occurred while uploading file" + error);
    throw error;
  }
};

export default uploadFileToS3;
