import mongoose, { Document, Schema, Model } from "mongoose";

// TypeScript interface to define the schema fields
interface IEmailVerificationToken extends Document {
  userId: Schema.Types.ObjectId;
  token: string;
  code: string;
  createdAt: Date;
}

const EmailVerificationTokenSchema: Schema<IEmailVerificationToken> =
  new Schema<IEmailVerificationToken>({
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Users", // Reference to User model
    },
    token: {
      type: String,
      required: true,
      unique: true,
    },
    code: {
      type: String,
      required: true,
      minlength: 6,
      maxlength: 6,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      expires: "6h", // TTL of 6 hours
    },
  });

const EmailVerificationTokenModel: Model<IEmailVerificationToken> =
  mongoose.model<IEmailVerificationToken>(
    "EmailVerificationTokens",
    EmailVerificationTokenSchema,
  );

export { EmailVerificationTokenModel, IEmailVerificationToken };
