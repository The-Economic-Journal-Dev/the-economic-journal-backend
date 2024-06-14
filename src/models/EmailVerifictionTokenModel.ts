import mongoose, { Document, Schema, Model } from "mongoose";

// TypeScript interface to define the schema fields
interface IEmailVerificationToken extends Document {
  userId: mongoose.Types.ObjectId;
  token: string;
  code: string;
  createdAt: Date;
}

const EmailVerificationTokenSchema: Schema<IEmailVerificationToken> =
  new Schema<IEmailVerificationToken>({
    userId: {
      type: mongoose.Types.ObjectId,
      required: true,
      ref: "User", // Reference to User model
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
    "EmailVerificationToken",
    EmailVerificationTokenSchema,
  );

export { EmailVerificationTokenModel, IEmailVerificationToken };
