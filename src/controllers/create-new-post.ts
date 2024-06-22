import { Request, Response } from "express";
import { PostModel, IPost } from "../models/PostModel";
import validatePost from "../utils/post-validator";
import uploadFileToS3 from "../utils/upload-file-to-s3";
import { StatusCodes } from "http-status-codes";

// Define the types for files
interface MulterFiles {
  [fieldname: string]: Express.Multer.File[];
}

const createNewPost = async (req: Request, res: Response) => {
  const { title, summary, postBody } = req.body;

  const files = req.files as MulterFiles;

  let authorId = (req.user as any)._id;
  if (req.user) {
    authorId = (req.user as any)._id; // req.user as any because the fucking type declaration won't work
  } else {
    return throwError(
      "User not logged in or without the valid permission",
      StatusCodes.UNAUTHORIZED,
    );
  }

  let imageUrl;
  const image = files["image"][0];
  if (image) {
    imageUrl = await uploadFileToS3(image);
  }

  const postValidationResult = validatePost({
    title,
    imageUrl,
    summary,
    postBody,
  });

  if (!postValidationResult.success) {
    throwError(postValidationResult.msg, postValidationResult.status);
  }

  try {
    const newPost: IPost = new PostModel({
      authorId,
      title,
      imageUrl,
      summary,
      postBody,
    });

    await newPost.save();

    res
      .status(201)
      .json({ success: true, msg: "Post created successfully", post: newPost });
  } catch (error) {
    throwError(error as Error);
  }
};

export default createNewPost;
