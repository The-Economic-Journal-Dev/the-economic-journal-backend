import { StatusCodes } from "http-status-codes";
import { CommentModel, IComment } from "../models/CommentModel";
import { Request, Response } from "express";
import { PostModel, IPost } from "../models/PostModel";
import { authenticateFirebaseId } from "../auth/authenticate-firebase-cred";

// TODO: put all session blocks/guard in a reusesable util function that can accept role restrictions
const createNewComment = [
  authenticateFirebaseId,
  async (req: Request, res: Response) => {
    const postId = req.params.postId;
    const { content, targetId } = req.body;
    const userId = (req.user as any)._id;

    if (!userId) {
      return throwError("User might not be logged in", StatusCodes.BAD_REQUEST);
    }

    if (!content) {
      return throwError("Comment content is required", StatusCodes.BAD_REQUEST);
    }

    const postExists = await PostModel.exists({ _id: postId });

    if (!postExists) {
      return throwError("Post not found", StatusCodes.NOT_FOUND);
    }

    const newComment: IComment = new CommentModel({
      postId: postId,
      userId: userId,
      parentCommentId: targetId,
      content,
      createdAt: Date.now(),
    });

    await newComment.save();

    res.status(201).json({
      success: true,
      message: "Comment added successfully",
      comment: newComment,
    });
  },
];

const deleteComment = [
  authenticateFirebaseId,
  async (req: Request, res: Response) => {
    const { targetId } = req.body;

    const comment = await CommentModel.findOneAndRemove({
      targetId,
      userId: (req.user as any)._id,
    });

    if (comment) {
      throwError("Comment not found", StatusCodes.BAD_REQUEST);
    }

    res.status(201).json({
      success: true,
      message: "Comment deleted successfully",
      comment: null,
    });
  },
];

export { createNewComment, deleteComment };
