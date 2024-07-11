import { Request, Response } from "express";
import { PostModel, IPost } from "../models/PostModel";
import { validatePost } from "../utils/post-validator";
import {
  uploadFileToS3,
  deleteFileFromS3,
} from "../services/aws/s3-file-manager";
import { StatusCodes } from "http-status-codes";
import authGuard from "../middleware/auth-guard";
import upload from "../config/multer-config";

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
      throwError(postValidationResult.message, postValidationResult.status);
    }

    const newPost = new PostModel({
      authorId,
      title,
      imageUrl,
      summary,
      postBody,
    });

    await newPost.save();

    res.status(201).json({
      success: true,
      message: "Post created successfully",
      post: newPost,
    });
  },
];

// TODO: change the includeComments to use document.populate() for getting the comments instead
const getPosts = async (req: Request, res: Response) => {
  const options = req.body;
  const {
    pageNumber = 1,
    count = 20,
    includeBody = false,
    includeComments = false,
  } = options;

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

  if (includeComments) {
    query = query.select("comments").populate({
      path: "comments.userId",
      select: "username -_id", // Select only the username field and exclude _id
      model: "User", // Assuming your User model is named 'User'
    });
  }

  const posts: IPost[] = await query.exec();

  res.json({
    success: true,
    message: "Posts fetched successfully",
    posts,
  });
};

const getSinglePost = async (req: Request, res: Response) => {
  const { id: postId } = req.params;

  // Find the post by id
  const post = await PostModel.findById(postId);

  // Check if the post exists
  if (!post) {
    throwError("Post not found", 404);
  }

  // Return the post
  return res.status(200).json({
    success: true,
    message: "Post fetched successfully",
    post,
  });
};

/**
 * Extracts the image name from the given URL.
 * @param url - The full URL of the image.
 * @returns The image name extracted from the URL, or undefined if the URL is not valid.
 */
function extractImageName(url?: string): string | undefined {
  const prefix = process.env.CLOUDFRONT_URI + "/";
  console.log(prefix);
  if (prefix) {
    if (url?.startsWith(prefix)) {
      return url.replace(prefix, "");
    }
  } else {
    throwError(
      "No CloudFront URL found. Please set the CLOUDFRONT_URI environment variable.",
    );
  }
  return undefined;
}

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

    try {
      // Find the post by id
      const post = await PostModel.findById(postId);

      // Check if the post exists
      if (post) {
        let imageUrl = "";
        if ((req.files as MulterFiles)["image"]) {
          const image = files["image"][0];
          if (image) {
            if (!isAcceptedMimetype(image.mimetype)) {
              throwError(
                `Invalid mimetype for file ${image.fieldname}.`,
                StatusCodes.BAD_REQUEST,
              );
            }

            let url = post?.imageUrl;

            // Replace the old image with the new one in the S3 bucket
            imageUrl = await uploadFileToS3(image, extractImageName(url));
          }
        }
        const postValidationResult = validatePost({
          title,
          imageUrl,
          summary,
          postBody,
        });

        if (!postValidationResult.success) {
          throwError(postValidationResult.message, postValidationResult.status);
        }

        if (imageUrl !== "") {
          post.imageUrl = imageUrl;
        }

        const newPost = { title, summary, postBody };

        Object.keys(newPost).forEach((key) => {
          (post as any)[key] = (newPost as any)[key];
        });

        await post.save();
      } else {
        throwError(`No post with id: ${postId} found.`, 404);
      }

      res.status(201).json({
        success: true,
        message: `Post with id: ${postId} edited successfully.`,
        post: post,
      });
    } catch (error) {
      throwError(error as Error);
    }
  },
];

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
        throwError(`No post with id: ${postId} found.`, StatusCodes.NOT_FOUND);
      }

      // Delete the image associated with the post from the S3 bucket
      const url = task.imageUrl;
      if (url) {
        const key = extractImageName(url);
        if (key) {
          await deleteFileFromS3(key);
        } else {
          throwError(
            "Invalid CloudFront URL or image key",
            StatusCodes.INTERNAL_SERVER_ERROR,
          );
        }
      }

      return res.status(200).json({
        success: true,
        message: `Post with id: ${postId} deleted.`,
        post: null,
      });
    } catch (error) {
      throwError(error as Error);
    }
  },
];

const likePost = [
  authGuard,
  async (req: Request, res: Response) => {
    const postId = req.params.postId;
    const userId = (req.user as any)._id; // Assuming you have user authentication middleware

    if (!userId) {
      throwError("User might not be logged in", StatusCodes.BAD_REQUEST);
    }

    const post = await PostModel.findById(postId);
    if (!post) {
      return throwError("Post not found", StatusCodes.NOT_FOUND);
    }

    // Check if the user has already liked the post
    if (post.likedBy.includes(userId)) {
      throwError("You have already liked this post", StatusCodes.BAD_REQUEST);
    }

    // Add the user to the likedBy array
    post.likedBy.push(userId);

    await post.save();

    res.status(200).json({
      success: true,
      message: "Post liked successfully",
      likes: post.likesCount,
    });
  },
];

const unlikePost = [
  authGuard,
  async (req: Request, res: Response) => {
    const postId = req.params.postId;
    const userId = (req.user as any)._id; // Assuming you have user authentication middleware

    if (!userId) {
      throwError("User might not be logged in", StatusCodes.BAD_REQUEST);
    }

    const post = await PostModel.findById(postId);
    if (!post) {
      return throwError("Post not found", StatusCodes.NOT_FOUND);
    }

    // Check if the user has already liked the post
    if (!post.likedBy.includes(userId)) {
      throwError("You have not liked the post", StatusCodes.BAD_REQUEST);
    }

    // Remove the user from the likedBy array
    post.likedBy.pull({ _id: userId });

    await post.save();

    res.status(200).json({
      success: true,
      message: "Post unliked successfully",
      likes: post.likesCount,
    });
  },
];

export { createNewPost, getPosts, getSinglePost, editPost, deletePost };
