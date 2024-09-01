import { getUploadPresignedUrl, deleteFileFromS3 } from "../services/aws/s3-file-manager";
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

/**
 * Checks if the mimetype is one of the accepted image types (gif, jpg, jpeg, png).
 * @param {string} mimetype - The mimetype to check.
 * @returns {boolean} True if the mimetype is an accepted image type, false otherwise.
 */
function isAcceptedMimetype(mimetype: string): boolean {
  const acceptedImagePattern = /^image\/(jpg|jpeg|png|bmp|webp|tiff|svg)$/;
  return acceptedImagePattern.test(mimetype);
}

const uploadImage = async (req: Request, res: Response) => {
  if (!req.user) {
    logger.info("User does not exist!");
    res.status(StatusCodes.UNAUTHORIZED).json({
      success: false,
      msg: "User does not exist or unauthorized!"
    });
  }

  const { mimeType, prefix } = req.body;

  if (!isAcceptedMimetype(mimeType)) {
    logger.info("Invalid Mimetype!");
    res.status(StatusCodes.BAD_REQUEST).json({success: false, msg: "Invalid Mimetype!"});
  }

  const { url, key } = await getUploadPresignedUrl({ mimeType, prefix });

  res.status(200).json({ success: true, url, key })
}

const deleteImage = async (req: Request, res: Response) => {
  if (!req.user) {
    logger.info("User does not exist!");
    res.status(StatusCodes.UNAUTHORIZED).json({
      success: false,
      msg: "User does not exist or unauthorized!"
    });
  }

  const { key } = req.params;

  await deleteFileFromS3(key)

  res.status(200).json({ success: true, key })
}

export { uploadImage, deleteImage };
