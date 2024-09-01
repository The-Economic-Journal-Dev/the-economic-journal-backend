import createS3Client, { S3Config } from "./clients/s3";
import { DeleteObjectCommand, DeleteObjectCommandInput, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// Define the S3 configuration
const s3Config: S3Config = {
  region: "auto",
  accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  endpoint: process.env.AWS_S3_API_ENDPOINT!,
};

// Create an S3 client
const s3Client = createS3Client(s3Config);

/**
 * Generates a unique filename based on an identifier.
 *
 * @param identifier - The identifier to include in the filename.
 * @returns The generated unique filename.
 */
const generateUniqueImageName = (
  identifier: string,
): string => {
  const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
  return `${identifier}-${uniqueSuffix}`;
};

/**
 * A record that maps MIME types to file extensions for various image and HTML formats.
 */
const mimeTypeToExtension: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/gif": "gif",
  "image/bmp": "bmp",
  "image/webp": "webp",
  "image/tiff": "tiff",
  "image/svg+xml": "svg",
  "text/html": "html",
};

function getExtensionFromMimeType(mimeType: string): string | undefined {
  const extension = mimeTypeToExtension[mimeType];

  if (!extension) {
    console.log("Invalid file type")
    return undefined;
  }

  return extension;
}

const getUploadPresignedUrl = async (info: {mimeType: string, prefix: string}) => {
  const ext = getExtensionFromMimeType(info.mimeType)
  if (!ext) throw new Error("Invalid mimeType");
  const key = `${generateUniqueImageName(info.prefix)}.${ext}`

  const url = await getSignedUrl(
    s3Client,
    new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: key,
    }),
    { expiresIn: 3600 }
  );

  return { url, key };
}

const deleteFileFromS3Service = async (
  config: DeleteObjectCommandInput,
  s3Client: S3Client,
) => {
  const deleteObjectCommand = new DeleteObjectCommand({
    Bucket: config.Bucket,
    Key: config.Key,
  });

  try {
    await s3Client.send(deleteObjectCommand)
  } catch (error) {
    logger.error("Error deleting file from s3")
    logger.error(error);
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

export { deleteFileFromS3, getUploadPresignedUrl };
