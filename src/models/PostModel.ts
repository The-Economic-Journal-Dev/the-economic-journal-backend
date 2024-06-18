import mongoose, { Document, Schema, Model } from "mongoose";

// TypeScript interface to define the schema fields for Post
interface IPost extends Document {
  authorId: mongoose.Types.ObjectId;
  title: string;
  datePublished: Date;
  imageUrl: string;
  summary: string;
  postBody: Object;
}

interface IPostBody extends Document {}

// Custom validation function to ensure only one of the fields is present
const contentTypeValidator = function (type: string) {
  const fields = ["Paragraph", "Header", "Quote"];
  return fields.includes(type);
};

// Define the schema with optional fields and custom validation
const ContentSchema = new Schema({
  type: {
    type: String,
    required: true,
    validate: {
      validator: contentTypeValidator,
      message: "{VALUE} is not a valid content type.",
    },
  },
  content: {
    type: String,
    required: true,
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
    type: [ContentSchema],
    required: true,
  },
});

const PostModel: Model<IPost> = mongoose.model<IPost>("Post", PostSchema);

export { PostModel, IPost };
