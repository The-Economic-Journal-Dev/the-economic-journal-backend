import { PostModel, IPost } from "../models/PostModel";
import { Request, Response } from "express";

const getAllPosts = async (req: Request, res: Response) => {
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

    const posts = await query.exec();

    res.json({
      success: true,
      msg: "Posts fetched successfully",
      posts,
    });
  } catch (error) {
    throwError(error as Error);
  }
};

export default getAllPosts;
