import mongoose, { Document, Schema, Model, Types } from "mongoose";
import { CommentModel, IComment } from "./CommentModel";

// TypeScript interface to define the schema fields for Post
interface IPost extends Document {
  authorId: Schema.Types.ObjectId;
  title: string;
  datePublished: Date;
  imageUrl?: string;
  summary?: string;
  postBody: string;
  category: "Technology" | "Science" | "Health" | "Business" | "Other";
  likedBy: Types.Array<Types.ObjectId>;
  likesCount: number;
}

const PostSchema: Schema<IPost> = new Schema<IPost>({
  authorId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "Users", // Reference to User model
  },
  title: {
    type: String,
    required: true,
    unique: true,
    minlength: 1,
    maxlength: 128,
  },
  datePublished: {
    type: Date,
    default: Date.now(),
  },
  imageUrl: {
    type: String,
  },
  summary: {
    type: String,
  },
  postBody: {
    type: String,
    required: true,
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

PostSchema.index({ category: 1, datePublished: -1 });

// Pre-save hook to update likesCount
PostSchema.pre("save", async function (next) {
  if (this.isModified("likedBy")) {
    this.likesCount = this.likedBy.length;
  }
  next();
});

PostSchema.pre<IComment>("remove", async function (next) {
  try {
    // Delete all child comments
    await PostModel.deleteMany({ postId: this._id });
    next();
  } catch (error) {
    next(error as Error);
  }
});

const PostModel: Model<IPost> = mongoose.model<IPost>("Posts", PostSchema);

export { PostModel, IPost, IComment };
