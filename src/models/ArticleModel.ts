import mongoose, { Document, Schema, Model, Types } from "mongoose";
import { CommentModel, IComment } from "./CommentModel";
import sanitize from "sanitize-html";

// TypeScript interface to define the schema fields for Article
interface IArticle extends Document {
  authorUid: Schema.Types.ObjectId;
  title: string;
  metaTitle: string;
  datePublished: Date;
  lastUpdated: Date;
  imageUrl?: string;
  summary?: string;
  articleBody: string;
  articleText: string;
  category: "Finance" | "Economic" | "Business" | "Entrepreneurship";
  likedBy: Types.Array<Types.ObjectId>;
  likesCount: number;
}

const ArticleSchema: Schema<IArticle> = new Schema<IArticle>({
  authorUid: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
    unique: true,
    minlength: 1,
    maxlength: 128,
  },
  metaTitle: {
    type: String,
    required: true,
    unique: true,
    minlength: 1,
    maxlength: 64,
  },
  datePublished: {
    type: Date,
    default: new Date(),
  },
  lastUpdated: {
    type: Date,
    default: new Date(),
  },
  position: {
    type: Number,
    default: 5,
    min: 1,
    max: 10,
  },
  imageUrl: {
    type: String,
  },
  summary: {
    type: String,
  },
  articleBody: {
    type: String,
    required: true,
    select: false,
    minlength: 1,
    maxlength: 2000,
  },
  articleText: {
    type: String,
    select: false,
    minlength: 1,
    maxlength: 2000,
  },
  category: {
    type: String,
    enum: ["Finance", "Economic", "Business", "Entrepreneurship"], // Add your desired categories
    required: true,
  },
  likedBy: {
    type: [{ type: Schema.Types.ObjectId, ref: "Users" }],
    default: [],
    select: false, // Do not include this field in the response by default
  },
  likesCount: {
    type: Number,
    default: 0,
  },
});

ArticleSchema.index({ category: 1, datePublished: -1 });

// Pre-save hook to update likesCount
ArticleSchema.pre("save", async function (next) {
  this.lastUpdated = new Date();

  this.articleText = sanitize(this.articleBody, {
    allowedTags: [],
    allowedAttributes: {},
  });

  if (this.isModified("likedBy")) {
    this.likesCount = this.likedBy.length;
  }
  next();
});

ArticleSchema.pre<IComment>("remove", async function (next) {
  try {
    // Delete all child comments
    await ArticleModel.deleteMany({ articleId: this._id });
    next();
  } catch (error) {
    next(error as Error);
  }
});

const ArticleModel: Model<IArticle> = mongoose.model<IArticle>(
  "Articles",
  ArticleSchema,
);

export { ArticleModel, IArticle, IComment };
