import { request, Request, Response } from "express";
import { PostModel, IPost } from "../models/PostModel";
import validatePost from "../utils/post-validator";
import uploadFileToS3 from "../utils/upload-file-to-s3";
import { StatusCodes } from "http-status-codes";

const createNewPost = async (req: Request, res: Response) => {
  const { title, summary, postBody } = req.body;

  let imageUrl;
  if (req.file) {
    imageUrl = uploadFileToS3(req.file);
  }

  let authorId;
  if (req.user) {
    authorId = (req.user as any)._id; // req.user as any because the fucking type declaration won't work
  } else {
    return throwError("User not logged in", StatusCodes.UNAUTHORIZED);
  }

  const postValidationResult = validatePost({
    authorId,
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
    throw error;
  }
};

export default createNewPost;
