import { Request, Response } from "express";
import { PostModel, IPost } from "../models/PostModel";
import { validatePost } from "../utils/post-validator";
import uploadFileToS3 from "../utils/upload-file-to-s3";
import { StatusCodes } from "http-status-codes";
import upload from "../config/multer-config";
import authGuard from "../middleware/auth-guard";

// Define the types for files
interface MulterFiles {
  [fieldname: string]: Express.Multer.File[];
}

/**
 * Checks if the mimetype is one of the accepted image types (gif, jpg, jpeg, png).
 * @param {string} mimetype - The mimetype to check.
 * @returns {boolean} True if the mimetype is an accepted image type, false otherwise.
 */
function isAcceptedMimetype(mimetype: string): boolean {
  const acceptedImagePattern = /^image\/(gif|jpg|jpeg|png)$/;
  return acceptedImagePattern.test(mimetype);
}

const createNewPost = [
  authGuard,
  upload.fields([
    {
      name: "image",
      maxCount: 1,
    },
  ]),
  async (req: Request, res: Response) => {
    const { title, summary, postBody } = req.body;

    const files = req.files as MulterFiles;

    if (
      !req.user ||
      (req.user as any).role !== "admin" ||
      (req.user as any).role !== "writer"
    ) {
      return throwError(
        "User not logged in or without the valid permission",
        StatusCodes.UNAUTHORIZED,
      );
    }
    const authorId = (req.user as any)._id; // req.user as any because the fucking type declaration won't work

    let imageUrl = "";
    const image = files["image"][0];
    if (image) {
      if (!isAcceptedMimetype(image.mimetype)) {
        throwError(
          `Invalid mimetype for file ${image.filename}.`,
          StatusCodes.BAD_REQUEST,
        );
      }
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

      res.status(201).json({
        success: true,
        msg: "Post created successfully",
        post: newPost,
      });
    } catch (error) {
      throwError(error as Error);
    }
  },
];

const getPosts = async (req: Request, res: Response) => {
  try {
    const options = req.body;
    const { pageNumber = 1, count = 20, includeBody = false } = options;

    // Calculate how many documents to skip
    const skipCount = (pageNumber - 1) * count;

    let query = PostModel.find()
      .sort({ datePublished: -1 }) // Sort by datePublished descending (latest first)
      .skip(skipCount) // Skip documents to implement pagination
      .limit(count); // Limit the number of documents returned per page;

    // Optionally select postBody field based on includeBody flag
    if (includeBody) {
      query = query.select("postBody");
    }

    const posts: IPost[] = await query.exec();

    res.json({
      success: true,
      msg: "Posts fetched successfully",
      posts,
    });
  } catch (error) {
    throwError(error as Error);
  }
};

const getSinglePost = async (req: Request, res: Response) => {
  const { id: postId } = req.params;

  try {
    // Find the post by id
    const post = await PostModel.findById(postId);

    // Check if the post exists
    if (!post) {
      throwError("Post not found", 404);
    }

    // Return the post
    return res.status(200).json({
      success: true,
      msg: "Post fetched successfully",
      post,
    });
  } catch (error) {
    throwError(error as Error);
  }
};

const editPost = [
  authGuard,
  upload.fields([
    {
      name: "image",
      maxCount: 1,
    },
  ]),
  async (req: Request, res: Response) => {
    const { title, summary, postBody } = req.body;
    const { id: postId } = req.params;

    const files = req.files as MulterFiles;

    if (
      !req.user ||
      (req.user as any).role !== "admin" ||
      (req.user as any).role !== "writer"
    ) {
      return throwError(
        "User not logged in or without the valid permission",
        StatusCodes.UNAUTHORIZED,
      );
    }
    const editorId = (req.user as any)._id; // req.user as any because the fucking type declaration won't work

    if (!editorId) {
      throwError("The request doesn't have an id", StatusCodes.BAD_REQUEST);
    }

    // TODO: Make replacement iamge replace the image in the s3 bucket
    let imageUrl = "";
    if ((req.files as MulterFiles)["image"]) {
      const image = files["image"][0];
      if (image) {
        if (!isAcceptedMimetype(image.mimetype)) {
          throwError(
            `Invalid mimetype for file ${image.filename}.`,
            StatusCodes.BAD_REQUEST,
          );
        }
        imageUrl = await uploadFileToS3(image);
      }
    }

    try {
      // Find the post by id
      const post = await PostModel.findById(postId);

      // Check if the post exists
      if (post) {
        const postValidationResult = validatePost({
          title,
          imageUrl,
          summary,
          postBody,
        });

        if (!postValidationResult.success) {
          throwError(postValidationResult.msg, postValidationResult.status);
        }

        if (imageUrl !== "") {
          post.imageUrl = imageUrl;
        }

        post.postBody = postBody;
        post.summary = summary;
        post.title = title;

        await post.save();
      } else {
        throwError(`No post with id: ${postId} found.`, 404);
      }

      res.status(201).json({
        success: true,
        msg: `Post with id: ${postId} edited successfully.`,
        post: post,
      });
    } catch (error) {
      throwError(error as Error);
    }
  },
];

// TODO: Only flag the post as deleted and remove it from the db after a week
const deletePost = [
  async (req: Request, res: Response) => {
    try {
      const { id: postId } = req.params;

      if (
        !req.user ||
        (req.user as any).role !== "admin" ||
        (req.user as any).role !== "writer"
      ) {
        return throwError(
          "User not logged in or without the valid permission",
          StatusCodes.UNAUTHORIZED,
        );
      }

      const task = await PostModel.findOneAndDelete({ _id: postId });

      if (!task) {
        return res
          .status(404)
          .json({ success: false, msg: `No post with id: ${postId} found.` });
      }

      return res.status(200).json({
        success: true,
        msg: `Post with id: ${postId} deleted.`,
        post: null,
      });
    } catch (error) {
      throwError(error as Error);
    }
  },
];

export { createNewPost, getPosts, getSinglePost, editPost, deletePost };
