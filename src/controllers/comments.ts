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
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ success: false, message: "User might not be logged in" });
    }

    if (!content) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ success: false, message: "Comment content is required" });
    }

    const articleExists = await ArticleModel.exists({ _id: articleId });

    if (!articleExists) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ success: false, message: "Article not found" });
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
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ success: false, message: "Comment not found" });
    }

    res.status(201).json({
      success: true,
      message: "Comment deleted successfully",
      comment: null,
    });
  },
];

export { createNewComment, deleteComment };
