import mongoose, { Document, Schema, Model } from "mongoose";

// TypeScript interface to define the schema fields for Post
interface IPost {
  authorId: mongoose.Types.ObjectId;
  title: string;
  datePublished: Date;
  imageUrl?: string;
  summary?: string;
  postBody: string;
  category: "Technology" | "Science" | "Health" | "Business" | "Other";
  comments: IComment[];
  likes: number;
}

// Interface for comments
interface IComment {
  userId: mongoose.Types.ObjectId;
  content: string;
  createdAt: Date;
}

const CommentSchema: Schema<IComment> = new Schema<IComment>({
  userId: {
    type: mongoose.Types.ObjectId,
    required: true,
    ref: "User", // Reference to User model
  },
  content: {
    type: String,
    required: true,
    maxlength: 500,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const PostSchema: Schema<IPost> = new Schema<IPost>({
  authorId: {
    type: mongoose.Types.ObjectId,
    required: true,
    ref: "User", // Reference to User model
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
  comments: { type: [CommentSchema], select: false },
  likes: {
    type: Number,
    default: 0,
  },
});

PostSchema.index({ category: 1, datePublished: -1 });

const PostModel: Model<IPost> = mongoose.model<IPost>("Post", PostSchema);

export { PostModel, IPost, IComment };
