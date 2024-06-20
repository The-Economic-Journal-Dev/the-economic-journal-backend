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

/**
 * Custom validation function to check if a given type is valid.
 *
 * @param type - The type to be validated. Should be one of "Paragraph", "Header", or "Quote".
 * @returns A boolean indicating whether the type is valid.
 *
 * @example
 * ```typescript
 * const isValid = contentTypeValidator("Paragraph"); // true
 * const isValid = contentTypeValidator("InvalidType"); // false
 * ```
 */
const contentTypeValidator = function (type: string): boolean {
  const fields = ["Paragraph", "Header", "Quote"];
  return fields.includes(type);
};

/**
 * Custom validation function to check if a given input is an array and if it has elements.
 *
 * @param input - The input to be validated.
 * @returns A boolean indicating whether the input is a non-empty array.
 *
 * @example
 * ```typescript
 * const isValid = contentTypeValidator(["item1", "item2"]); // true
 * const isValid = contentTypeValidator([]); // false
 * const isValid = contentTypeValidator("Not an array"); // false
 * ```
 */
const postBodyValidator = function (input: any): boolean {
  return Array.isArray(input) && input.length > 0;
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
    validate: {
      validator: postBodyValidator,
      message: "Post body must be an array with at least one element.",
    },
  },
});

const PostModel: Model<IPost> = mongoose.model<IPost>("Post", PostSchema);

export { PostModel, IPost };
