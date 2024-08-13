import { StatusCodes } from "http-status-codes";
import { CommentModel, IComment } from "../models/CommentModel";
import { Request, Response } from "express";
import { ArticleModel, IArticle } from "../models/ArticleModel";
import { authenticateFirebaseId } from "../auth/authenticate-firebase-cred";

const createNewComment = [
  authenticateFirebaseId,
  async (req: Request, res: Response) => {
    const articleId = req.params.articleId;
    const { content, targetId } = req.body;
    const userId = (req.user as any)._id;

    if (!userId) {
      throwError("User might not be logged in", StatusCodes.BAD_REQUEST);
    }

    if (!content) {
      throwError("Comment content is required", StatusCodes.BAD_REQUEST);
    }

    const articleExists = await ArticleModel.exists({ _id: articleId });

    if (!articleExists) {
      throwError("Article not found", StatusCodes.NOT_FOUND);
    }

    const newComment: IComment = new CommentModel({
      articleId: articleId,
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
