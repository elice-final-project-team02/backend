import mongoose, { Schema, Document } from "mongoose";

export interface IPost extends Document {
  postNumber: number;
  author: string;
  title: string;
  content: string;
  applicantsCount: number;
  reservation: Schema.Types.ObjectId;
  careInformation: Schema.Types.ObjectId;
}

const krCurrentTime = 9 * 60 * 60 * 1000;

const postSchema = new Schema<IPost>(
  {
    postNumber: { type: Number, required: true, unique: true, index: true },
    author: { type: String, required: true },
    title: { type: String, required: true },
    content: { type: String, required: true },
    applicantsCount: { type: Number, required: true, default: 0 },
    reservation: { type: Schema.Types.ObjectId, ref: "Reservation" },
    careInformation: { type: Schema.Types.ObjectId, ref: "CareInformation" },
  },
  {
    timestamps: {
      currentTime: () => new Date(Date.now() + krCurrentTime),
    },
  },
);

export const PostModel = mongoose.model<IPost>("Post", postSchema);
