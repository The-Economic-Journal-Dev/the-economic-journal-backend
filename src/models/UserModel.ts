import mongoose, { Document, Schema, Model } from "mongoose";
import bcryptjs from "bcryptjs";

// TypeScript interface to define the schema fields
interface IUser extends Document {
  email: string;
  username: string;
  password: string;
  active: boolean;
}

const UserSchema: Schema<IUser> = new Schema<IUser>(
  {
    email: {
      type: String,
      required: [true, "A value of email is required."],
      unique: true,
    },
    username: {
      type: String,
      required: [true, "A value of username is required."],
      trim: true,
    },
    password: {
      type: String,
      required: [true, "A value of password is required."],
      select: false,
    },
    profilePictureUrl: {
      type: String,
      default: "",
    },
    active: {
      type: Boolean,
      default: false, // Default value for "active" attribute
    },
    role: {
      type: String,
      enum: ["reader", "writer", "admin"],
      default: "reader", // Default value for "role" attribute
    },
  },
  { timestamps: true },
);

UserSchema.pre<IUser>("save", async function (next) {
  try {
    if (!this.isModified("password")) {
      return next();
    }
    const salt = await bcryptjs.genSalt(10);
    this.password = await bcryptjs.hash(this.password, salt);
    next();
  } catch (error: Error | any) {
    next(error);
  }
});

const UserModel: Model<IUser> = mongoose.model<IUser>("Users", UserSchema);

export { UserModel, IUser };
