import { request, Request, Response } from "express";
import { PostModel, IPost } from "../models/PostModel";
import validatePost from "../utils/post-validator";
import uploadFileToS3 from "../utils/upload-file-to-s3";

const createNewPost = async (req: Request, res: Response) => {
  const { title, summary, postBody } = req.body;

  let imageUrl;
  if (req.file) {
    imageUrl = uploadFileToS3(req.file);
  }

  // TODO: find a way to get the userID though the session or the request
  const authorId = "get from db though session";

  const postValidationResult = validatePost({
    authorId,
    title,
    imageUrl,
    summary,
    postBody,
  });

  if (!postValidationResult.success) {
    return res
      .status(postValidationResult.status)
      .json({ success: false, msg: postValidationResult.msg });
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
  } catch (error) {
    throw error;
  }
};

export default createNewPost;
