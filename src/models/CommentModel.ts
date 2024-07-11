import { required } from "joi";
import mongoose, { Document, Schema, Model, SchemaType } from "mongoose";

// Interface for comments
interface IComment extends Document {
  postId: Schema.Types.ObjectId;
  parentCommentId?: Schema.Types.ObjectId;
  userId: Schema.Types.ObjectId;
  content: string;
  createdAt: Date;
}

const CommentSchema: Schema<IComment> = new Schema<IComment>({
  postId: {
    type: Schema.Types.ObjectId,
    ref: "Posts",
    required: true,
    index: true,
  },
  parentCommentId: {
    type: Schema.Types.ObjectId,
    ref: "Comments",
    required: false,
  },
  userId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "Users", // Reference to User model
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

CommentSchema.pre<IComment>("remove", async function (next) {
  try {
    // Delete all child comments
    await CommentModel.deleteMany({ parentCommentId: this._id });
    next();
  } catch (error) {
    next(error as Error);
  }
});

const CommentModel = mongoose.model("Comments", CommentSchema);

export { IComment, CommentModel };
