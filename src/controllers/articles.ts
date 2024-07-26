import { Request, Response } from "express";
import { ArticleModel, IArticle } from "../models/ArticleModel";
import { validateArticle } from "../utils/article-validator";
import {
  uploadFileToS3,
  deleteFileFromS3,
} from "../services/aws/s3-file-manager";
import { StatusCodes } from "http-status-codes";
import upload from "../config/multer-config";
import axios from "axios";
import ejs from "ejs";
import sanitizeHtml from "sanitize-html";
import path from "path";

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

// VerifyRole has been defined as a middleware before this so req.user is populated
const createNewArticle = [
  upload.fields([
    {
      name: "image",
      maxCount: 1,
    },
  ]),
  async (req: Request, res: Response) => {
    const { title, summary, articleBody, metaTitle, category, position } =
      req.body;

    const files = req.files as MulterFiles;
    logger.info(files);

    const authorUid =
      process.env.NODE_ENV === "development" ? "00000000000001" : req.user!.uid;

    const articleValidationResult = validateArticle({
      title,
      metaTitle,
      summary,
      articleBody,
    });

    if (!articleValidationResult.success) {
      throwError(
        articleValidationResult.message,
        articleValidationResult.status,
      );
    }

    let imageUrl = "";
    const images = files["image"];
    console.log(images);
    if (images) {
      const image = images[0];
      if (!isAcceptedMimetype(image.mimetype)) {
        throwError(
          `Invalid mimetype for file ${image.filename}.`,
          StatusCodes.BAD_REQUEST,
        );
      }
      imageUrl = await uploadFileToS3(image);
    }

    const newArticle = new ArticleModel({
      authorUid,
      title,
      metaTitle,
      category,
      imageUrl,
      summary,
      articleBody,
      position,
    });

    // Sanitize the title and other fields to prevent XSS attacks
    const sanitizedTitle = sanitizeHtml(title, {
      allowedTags: [],
      allowedAttributes: {},
    });
    const sanitizedSummary = sanitizeHtml(summary);
    const sanitizedArticleBody = sanitizeHtml(articleBody);
    const sanitizedMetaTitle = encodeURIComponent(
      sanitizeHtml(metaTitle, {
        allowedTags: [],
        allowedAttributes: {},
      }),
    );
    const sanitizeCategory = sanitizeHtml(category, {
      allowedTags: [],
      allowedAttributes: {},
    });

    const data = {
      article: {
        title: sanitizedTitle,
        authorUid,
        metaTitle: sanitizedMetaTitle,
        imageUrl,
        summary: sanitizedSummary,
        articleBody: sanitizedArticleBody,
        category: sanitizeCategory,
        datePublished: newArticle.datePublished,
      },
    };

    // Render the article HTML using EJS template
    const html = await ejs.renderFile(
      path.resolve(__dirname, "../templates/article.ejs"),
      data,
    );

    await newArticle.save();

    res.status(201).json({
      success: true,
      message: "Article created successfully",
      article: newArticle,
    });
  },
];

// TODO: add comments support
const getArticles = async (req: Request, res: Response) => {
  const options = req.body;
  const { pageNumber = 1, count = 20, includeBody = false } = options;

  // Calculate how many documents to skip
  const skipCount = (pageNumber - 1) * count;

  let query = ArticleModel.find()
    .sort({ datePublished: -1 }) // Sort by datePublished descending (latest first)
    .skip(skipCount) // Skip documents to implement pagination
    .limit(count); // Limit the number of documents returned per page;

  // Optionally select articleBody field based on includeBody flag
  if (includeBody) {
    query = query.select("articleBody");
  }

  const articles: IArticle[] = await query.exec();

  res.json({
    success: true,
    message: "Articles fetched successfully",
    articles,
  });
};

const getSingleArticle = async (req: Request, res: Response) => {
  const { metaTitle } = req.params;

  // Find the article by id
  const article = await ArticleModel.findOne({ metaTitle: metaTitle });

  // Check if the article exists
  if (!article) {
    throwError("Article not found", 404);
  }

  // Return the article
  return res.status(200).json({
    success: true,
    message: "Article fetched successfully",
    article,
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

const editArticle = [
  upload.fields([
    {
      name: "image",
      maxCount: 1,
    },
  ]),
  async (req: Request, res: Response) => {
    const { title, summary, articleBody } = req.body;
    const { id: articleId } = req.params;

    const files = req.files as MulterFiles;

    const editorId = (req.user as any)._id; // req.user as any because the fucking type declaration won't work

    if (!editorId) {
      throwError("The request doesn't have an id", StatusCodes.BAD_REQUEST);
    }

    try {
      // Find the article by id
      const article = await ArticleModel.findById(articleId);

      // Check if the article exists
      if (article) {
        purgeCloudflareArticlesCache(article._id);

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

            let url = article?.imageUrl;

            // Replace the old image with the new one in the S3 bucket
            imageUrl = await uploadFileToS3(image, extractImageName(url));
          }
        }
        const articleValidationResult = validateArticle({
          title,
          imageUrl,
          summary,
          articleBody,
        });

        if (!articleValidationResult.success) {
          throwError(
            articleValidationResult.message,
            articleValidationResult.status,
          );
        }

        if (imageUrl !== "") {
          article.imageUrl = imageUrl;
        }

        const newArticle = { title, summary, articleBody };

        Object.keys(newArticle).forEach((key) => {
          (article as any)[key] = (newArticle as any)[key];
        });

        await article.save();
      } else {
        throwError(`No article with id: ${articleId} found.`, 404);
      }

      res.status(201).json({
        success: true,
        message: `Article with id: ${articleId} edited successfully.`,
        article: article,
      });
    } catch (error) {
      throwError(error as Error);
    }
  },
];

const deleteArticle = [
  async (req: Request, res: Response) => {
    try {
      const { id: articleId } = req.params;

      const article = await ArticleModel.findOneAndDelete({ _id: articleId });

      if (!article) {
        throwError(
          `No article with id: ${articleId} found.`,
          StatusCodes.NOT_FOUND,
        );
      }

      // Delete the image associated with the article from the S3 bucket
      const url = article.imageUrl;
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

      purgeCloudflareArticlesCache(article._id);

      return res.status(200).json({
        success: true,
        message: `Article with id: ${articleId} deleted.`,
        article: null,
      });
    } catch (error) {
      throwError(error as Error);
    }
  },
];

const likeArticle = async (req: Request, res: Response) => {
  const articleId = req.params.articleId;
  const userId = (req.user as any)._id; // Assuming you have user authentication middleware

  if (!userId) {
    throwError("User might not be logged in", StatusCodes.BAD_REQUEST);
  }

  const article = await ArticleModel.findById(articleId);
  if (!article) {
    return throwError("Article not found", StatusCodes.NOT_FOUND);
  }

  // Check if the user has already liked the article
  if (article.likedBy.includes(userId)) {
    throwError("You have already liked this article", StatusCodes.BAD_REQUEST);
  }

  // Add the user to the likedBy array
  article.likedBy.push(userId);

  await article.save();

  res.status(200).json({
    success: true,
    message: "Article liked successfully",
    likes: article.likesCount,
  });
};

const unlikeArticle = async (req: Request, res: Response) => {
  const articleId = req.params.articleId;
  const userId = (req.user as any)._id; // Assuming you have user authentication middleware

  if (!userId) {
    throwError("User might not be logged in", StatusCodes.BAD_REQUEST);
  }

  const article = await ArticleModel.findById(articleId);
  if (!article) {
    return throwError("Article not found", StatusCodes.NOT_FOUND);
  }

  // Check if the user has already liked the article
  if (!article.likedBy.includes(userId)) {
    throwError("You have not liked the article", StatusCodes.BAD_REQUEST);
  }

  // Remove the user from the likedBy array
  article.likedBy.pull({ _id: userId });

  await article.save();

  res.status(200).json({
    success: true,
    message: "Article unliked successfully",
    likes: article.likesCount,
  });
};

/**
 * Represents the result of a cache purge request to Cloudflare.
 */
interface PurgeCacheResponse {
  errors: any[]; // Array of error messages, if any
  messages: any[]; // Array of messages, if any
  success: boolean; // Indicates whether the request was successful
  result: {
    id: string; // The ID of the purge request
  };
}

const purgeCloudflareArticlesCache = async (articleKey: String) => {
  if (
    !process.env.CLOUDFLARE_ZONE_ID ||
    !process.env.CLOUDFLARE_CACHE_PURGE_API_TOKEN
  ) {
    logger.error(
      "Missing Cloudflare credentials: CLOUDFLARE_ZONE_ID or CLOUDFLARE_CACHE_PURGE_API_TOKEN",
    );
    throwError();
  }

  // Define the Cloudflare API endpoint and headers
  const url = `https://api.cloudflare.com/client/v4/zones/${process.env.CLOUDFLARE_ZONE_ID}/purge_cache`;
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${process.env.CLOUDFLARE_CACHE_PURGE_API_TOKEN}`,
  };
  const data = {
    prefixes: [
      `www.derpdevstuffs.org/articles${articleKey ? `/${articleKey}` : ""}`,
    ],
  };
  const response: PurgeCacheResponse = await axios.post(url, data, {
    headers,
  });

  if (response.success) {
    logger.info("Cloudflare cache purged successfully");
    return response;
  } else {
    logger.error(
      `Failed to purge Cloudflare cache: ${JSON.stringify(response.errors)}`,
    );
    throwError();
  }
};

export {
  createNewArticle,
  getArticles,
  getSingleArticle,
  editArticle,
  deleteArticle,
  likeArticle,
  unlikeArticle,
};
