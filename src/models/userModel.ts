import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  role: Schema.Types.ObjectId;
  area: Schema.Types.ObjectId;
  email: string;
  password: string;
  name: string;
  gender: "남자" | "여자";
  age: "20대" | "30대" | "40대" | "50대" | "60대";
  phoneNumber: string;
  profileUrl?: string | null;
  introduction?: string | null;
  bookmarks?: string[] | null;
  deletedAt?: Date | null;
}

const krCurrentTime = 9 * 60 * 60 * 1000;

const userSchema = new Schema<IUser>(
  {
    role: { type: Schema.Types.ObjectId, required: true, ref: "Role" },
    area: { type: Schema.Types.ObjectId, required: true, ref: "Area" },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    gender: { type: String, required: true, enum: ["남자", "여자"] },
    age: { type: String, required: true, enum: ["20대", "30대", "40대", "50대", "60대"] },
    phoneNumber: { type: String, required: true },
    profileUrl: { type: String, default: null },
    introduction: { type: String, default: null },
    bookmarks: [{ type: String }],
    deletedAt: { type: Date, default: null },
  },
  {
    timestamps: {
      currentTime: () => new Date(Date.now() + krCurrentTime),
    },
  },
);

export const UserModel = mongoose.model<IUser>("User", userSchema);
