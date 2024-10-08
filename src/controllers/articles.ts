import { NextFunction, Request, Response } from "express";
import { ArticleModel } from "../models/ArticleModel";
import { validateArticle } from "../utils/article-validator";
import { deleteFileFromS3 } from "../services/aws/s3-file-manager";
import { StatusCodes } from "http-status-codes";
import sanitizeHtml from "sanitize-html";

const createNewArticle = [
  async (req: Request, res: Response) => {
    const { title, metaTitle, category, summary, articleBody, position, imageUrl, authorName } =
      req.body;

    const authorUid = req.user?.uid;

    const articleValidationResult = validateArticle({
      title,
      metaTitle,
      summary,
      articleBody,
      imageUrl,
      authorName
    });

    if (!articleValidationResult.success) {
      return res
        .status(articleValidationResult.status)
        .json({ success: false, message: articleValidationResult.message });
    }

    // Sanitize the title and other fields to prevent XSS attacks
    const sanitizedTitle = sanitizeHtml(title, {
      allowedTags: [],
      allowedAttributes: {},
    });
    const sanitizedSummary = sanitizeHtml(summary);
    const sanitizedArticleBody = sanitizeHtml(articleBody, {
      allowedTags: sanitizeHtml.defaults.allowedTags.concat([ 'img' ])
    });
    const sanitizedMetaTitle = sanitizeHtml(metaTitle, {
      allowedTags: [],
      allowedAttributes: {},
    })
      .replace(/[\s_]+/g, "-") // Replace spaces and underscores with hyphens
      .replace(/[^a-zA-Z0-9-]/g, ""); // Remove all characters except alphanumeric, hyphens, and underscores,
    const sanitizeCategory = sanitizeHtml(category, {
      allowedTags: [],
      allowedAttributes: {},
    });

    const newArticle = new ArticleModel({
      authorUid: authorUid,
      title: sanitizedTitle,
      metaTitle: sanitizedMetaTitle,
      category: sanitizeCategory,
      imageUrl,
      summary: sanitizedSummary,
      articleBody: sanitizedArticleBody,
      position,
      authorName
    });

    await newArticle.save();

    res.status(201).json({
      success: true,
      message: "Article created successfully",
      article: newArticle,
    });
  },
];

interface GetArticleQuery {
  page?: string;
  count?: string;
  category?: string;
  includeHTML?: string;
  includeTrending?: string;
}

const retrieveArticles = async (skipCount: number, validatedCount: number, category: string | undefined, includeHTML: boolean, includeTrending: boolean) => {
  const pipeline = [];

  // Match stage for category filtering
  if (category) {
    pipeline.push({ $match: { category: category } });
  }

  // Prepare the projection object
  const projection = {
    authorUid: 1,
    title: 1,
    metaTitle: 1,
    datePublished: 1,
    lastUpdated: 1,
    imageUrl: 1,
    summary: 1,
    category: 1,
    views: 1,
    likesCount: 1,
  };

  if (includeHTML){
    // @ts-ignore
    projection.articleBody = 1;
  }

  // Add the projection stage
  pipeline.push({ $project: projection });

  // Facet stage for sorting
  const facetStage = {
    $facet: {
      sortedByDate: [
        { $sort: { datePublished: -1 } },
        { $skip: skipCount },
        { $limit: validatedCount }
      ]
    }
  };

  // Conditionally add sortedByViews to the facet stage
  if (includeTrending) {
    // @ts-ignore
    facetStage.$facet.sortedByLikes = [
      { $sort: { likesCount: -1 } },
      { $skip: skipCount },
      { $limit: validatedCount }
    ];
  }

  pipeline.push(facetStage);

  const result = await ArticleModel.aggregate(pipeline);

  // The result is an array with one element
  return result[0];
};

const getArticles = async (
  req: Request<{}, {}, {}, GetArticleQuery>,
  res: Response,
) => {
  const { query } = req;
  const page = parseInt(query.page || "1");
  const count = parseInt(query.count || "20");
  const category = query.category;
  const includeHTML = query.includeHTML === "true";
  const includeTrending = query.includeTrending === "true";

  // Ensure positive integers for pageNumber and count
  const validatedPageNumber = Math.max(1, Math.floor(page));
  const validatedCount = Math.max(1, Math.floor(count));

  const skipCount = (validatedPageNumber - 1) * validatedCount;

  const result = await retrieveArticles(skipCount, validatedCount, category, includeHTML, includeTrending);
  // Destructure the result to get both sorted arrays
  const { sortedByDate, sortedByLikes } = result;

  res.json({
    success: true,
    message: "Articles fetched successfully",
    articles: sortedByDate,
    trending: sortedByLikes,
  });
};

const getSingleArticle = [
  async (req: Request, res: Response, next: NextFunction) => {
    res.append("Cache-Control", "public, max-age=3600, stale-while-revalidate");
    next();
  },
  async (req: Request, res: Response) => {
    const { id } = req.params;

    // Find the article by id
    const article = await ArticleModel.findOne({ metaTitle: id }).select(
      "+articleBody -likedBy -articleText",
    );

    // Check if the article exists
    if (!article) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: "Article not found",
      });
    }

    // Return the article
    return res.status(StatusCodes.OK).json({
      success: true,
      message: "Article fetched successfully",
      article,
    });
  },
];

/**
 * Extracts the image name from the given URL.
 * @param url - The full URL of the image.
 * @returns The image name extracted from the URL, or undefined if the URL is not valid.
 */
function extractImageName(url?: string): string | undefined {
  const prefix = process.env.CLOUDFRONT_URI + "/";

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
  async (req: Request, res: Response) => {
    const { title, metaTitle, summary, articleBody, imageUrl } = req.body;
    const { id: articleId } = req.params;

    const editorId = req.user?.uid;

    if (!editorId) {
      res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ success: false, message: "The request doesn't have an id" });
    }

    try {
      // Find the article by id
      const article = await ArticleModel.findById(articleId);

      // Check if the article exists
      if (article) {
        const articleValidationResult = validateArticle({
          title,
          metaTitle,
          imageUrl,
          summary,
          articleBody,
        });

        if (!articleValidationResult.success) {
          return res
            .status(articleValidationResult.status)
            .json({ success: false, message: articleValidationResult.message });
        }

        article.imageUrl = imageUrl;

        // Sanitize the title and other fields to prevent XSS attacks
        const sanitizedTitle = sanitizeHtml(title, {
          allowedTags: [],
          allowedAttributes: {},
        });
        const sanitizedSummary = sanitizeHtml(summary);
        const sanitizedArticleBody = sanitizeHtml(articleBody, {
          allowedTags: sanitizeHtml.defaults.allowedTags.concat([ 'img' ]),
          allowedAttributes: {
            '*': ['style'], // Allow style attribute on all tags
          },
          allowedStyles: {
            '*': {
              // Allow only specific CSS properties and their valid formats
              'color': [/^#(0x)?[0-9a-f]{3,6}$/i, /^rgb\(/],  // Hex and RGB color formats
              'float': [/^left$|^right$|^none$/],  // Allow float with specific values
              'width': [/^\d+(?:px|%)$/],  // Allow width in px or percent
              'height': [/^\d+(?:px|%)$/],  // Allow height in px or percent
              'margin': [/^\d+(?:px|%)$/],  // Allow margin with px or percent units
              'margin-top': [/^\d+(?:px|%)$/],  // Allow specific margin sides
              'margin-right': [/^\d+(?:px|%)$/],
              'margin-bottom': [/^\d+(?:px|%)$/],
              'margin-left': [/^\d+(?:px|%)$/],
              'display': [/^block$|^inline$|^inline-block$|^flex$|^grid$/],  // Allow display with specific values
              // Disallow potentially dangerous properties
              '!important': [],  // Disallow !important
            }
          }
        });
        const sanitizedMetaTitle = sanitizeHtml(metaTitle, {
          allowedTags: [],
          allowedAttributes: {},
        })
          .replace(/[\s_]+/g, "-") // Replace spaces and underscores with hyphens
          .replace(/[^a-zA-Z0-9-]/g, ""); // Remove all characters except alphanumeric, hyphens, and underscores,

        article.title = sanitizedTitle;
        article.metaTitle = sanitizedMetaTitle;
        article.summary = sanitizedSummary;
        article.articleBody = sanitizedArticleBody;

        await article.save();
      } else {
        return res.status(StatusCodes.NOT_FOUND).json({
          success: false,
          message: `No article with meta title: ${articleId} found.`,
        });
      }

      res.status(201).json({
        success: true,
        message: `Article with id: ${articleId} edited successfully.`,
        article: article,
      });
    } catch (error) {
      logger.error("Error while editing article:", error);
      res
        .status(StatusCodes.BAD_REQUEST)
        .json({ success: false, message: (error as Error).message });
    }
  },
];

// TODO: Make this use sessions in case that the delete fails the article doesn't delete
const deleteArticle = [
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const article = await ArticleModel.findOneAndDelete({ metaTitle: id });

      if (!article) {
        return res.status(StatusCodes.NOT_FOUND).json({
          success: false,
          message: `No article with meta title: ${id} found.`,
        });
      }

      // Delete the image associated with the article from the S3 bucket
      const url = article.imageUrl;
      logger.info(`deleting image: ${url}`)
      if (url) {
        const key = extractImageName(url);
        if (key) {
          await deleteFileFromS3(key);
        } else {
          logger.info("Invalid CloudFront URL or image key")
        }
      }

      return res.status(200).json({
        success: true,
        message: `Article with id: ${id} deleted.`,
        article: null,
      });
    } catch (error) {
      logger.error((error as Error).message)
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({success: false, message: "Error deleting article" });
    }
  },
];

const likeArticle = async (req: Request, res: Response) => {
  const articleId = req.params.id;
  const userId = req.user?.uid; // Assuming you have user authentication middleware

  if (!userId) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      success: true,
      message: "User might not be logged in",
    });
  }

  const article = await ArticleModel.findOne(
    { metaTitle: articleId },
    "likedBy likesCount",
  );

  if (!article) {
    return res.status(StatusCodes.NOT_FOUND).json({
      success: true,
      message: "Article not found",
    });
  }

  // Check if the user has already liked the article
  if (article.likedBy.includes(userId)) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      success: true,
      message: "Article already liked",
      likes: article.likesCount,
    });
  }

  // Add the user to the likedBy array
  article.likedBy.push(userId);

  await article.save();

  return res.status(200).json({
    success: true,
    message: "Article liked successfully",
    likes: article.likesCount,
  });
};

const unlikeArticle = async (req: Request, res: Response) => {
  const articleId = req.params.id;
  const userId = req.user?.uid; // Assuming you have user authentication middleware

  if (!userId) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      success: true,
      message: "User might not be logged in",
    });
  }

  const article = await ArticleModel.findOne(
    { metaTitle: articleId },
    "likedBy likesCount",
  );

  if (!article) {
    return res.status(StatusCodes.NOT_FOUND).json({
      success: true,
      message: "Article not found",
    });
  }

  // Check if the user has already not liked the article
  if (!article.likedBy.includes(userId)) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      success: true,
      message: "Article already not liked",
      likes: article.likesCount,
    });
  }

  // Remove the user from the likedBy array
  const index = article.likedBy.indexOf(userId);
  article.likedBy.splice(index, 1);

  await article.save();

  return res.status(200).json({
    success: true,
    message: "Article unliked successfully",
    likes: article.likesCount,
  });
};

function isValidISOString(dateString: string) {
  const date = new Date(dateString);
  return date.toISOString() === dateString;
}

interface SearchArticlesQuery {
  page?: string;
  count?: string;
  search?: string;
  category?: string;
  categories?: string;
  startDate?: string;
  endDate?: string;
}

const searchArticles = async (
  req: Request<{}, {}, {}, SearchArticlesQuery>,
  res: Response,
) => {
  const { query } = req;
  const { search, category, categories, startDate, endDate } = query;

  if (startDate) {
    if (!isValidISOString(startDate)) {
      logger.error("Invalid start date format was provided.");
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ success: false, message: "Invalid start date format" });
    }
  }

  if (endDate) {
    if (!isValidISOString(endDate)) {
      logger.error("Invalid end date format was provided.");
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ success: false, message: "Invalid end date format" });
    }
  }

  const page = parseInt(query.page || "1");
  const count = parseInt(query.count || "20");

  // Ensure positive integers for pageNumber and count
  const validatedPageNumber = Math.max(1, Math.floor(page));
  const validatedCount = Math.max(1, Math.floor(count));

  const searchAggregation: any[] = [
    {
      $search: {
        index: "article-search",
        compound: {
          should: [
            {
              autocomplete: {
                query: search,
                path: "title",
                fuzzy: {
                  maxEdits: 2,
                  prefixLength: 0,
                  maxExpansions: 50,
                },
              },
            },

            {
              autocomplete: {
                query: search,
                path: "articleText",
                fuzzy: {
                  maxEdits: 2,
                  prefixLength: 0,
                  maxExpansions: 50,
                },
              },
            },

            {
              autocomplete: {
                query: search,
                path: "summary",
                fuzzy: {
                  maxEdits: 2,
                  prefixLength: 0,
                  maxExpansions: 50,
                },
              },
            },
          ],
          minimumShouldMatch: 1,
        },
      },
    },
    // Pagination stage
    {
      $skip: validatedPageNumber - 1, // Number of documents to skip (pagination offset)
    },
    {
      $limit: validatedCount, // Number of documents to return (pagination limit)
    },
  ];

  // Ensure `compound` exists before modifying it
  const compound = searchAggregation[0]?.$search?.compound;

  if (compound) {
    if (categories) {
      // Handle multiple categories (comma-separated)
      const categoryList = Array.isArray(categories)
        ? categories
        : categories.split(",");

      compound.must = [
        {
          in: {
            path: "category",
            value: categoryList,
          },
        },
      ];
    } else if (category) {
      // Handle single category
      compound.must = [
        {
          in: {
            path: "category",
            value: [category],
          },
        },
      ];
    }
  }

  if (startDate) {
    searchAggregation.unshift(
      // Match stage for date range search
      {
        $match: {
          datePublished: {
            $gte: new Date(startDate), // Start date
            $lte: endDate ? new Date(endDate) : new Date(), // End date
          },
        },
      },
    );
  }

  try {
    const articles = await ArticleModel.aggregate(searchAggregation);

    res.json({
      success: true,
      message: "Articles searched and fetched successfully",
      articles,
    });
  } catch (error) {
    if (error instanceof Error) {
      logger.error(`Error while searching articles: ${error.message}`);
      throwError("Error while searching articles");
    }
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
  searchArticles,
};
