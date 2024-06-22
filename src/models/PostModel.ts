import mongoose, { Document, Schema, Model } from "mongoose";

// TypeScript interface to define the schema fields for Post
interface IPost extends Document {
  authorId: mongoose.Types.ObjectId;
  title: string;
  datePublished: Date;
  imageUrl: string;
  summary: string;
  postBodyUrl: string;
}

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
  },
});

const PostModel: Model<IPost> = mongoose.model<IPost>("Post", PostSchema);

export { PostModel, IPost };
