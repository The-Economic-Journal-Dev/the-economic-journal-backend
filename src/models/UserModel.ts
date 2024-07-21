import mongoose, { Document, Schema, Model } from "mongoose";

// TypeScript interface to define the schema fields
interface IUser extends Document {
  uid: string;
}

const UserSchema: Schema<IUser> = new Schema<IUser>({
  uid: {
    type: String,
    required: [true, "A value of email is required."],
    unique: true,
  },
});

const UserModel: Model<IUser> = mongoose.model<IUser>("Users", UserSchema);

export { UserModel, IUser };
