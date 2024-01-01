import mongoose, { Schema, Document } from "mongoose";

export interface IChat extends Document {
  message: Schema.Types.ObjectId[];
  post: Schema.Types.ObjectId;
  applicant: string;
  author: string;
  status: "매칭전" | "매칭완료";
  leaveRoom: string[];
}

const krCurrentTime = 9 * 60 * 60 * 1000;

const chatSchema = new Schema<IChat>(
  {
    message: [{ type: Schema.Types.ObjectId, ref: "Message" }],
    post: { type: Schema.Types.ObjectId, ref: "Post" },
    applicant: { type: String, required: true },
    author: { type: String, required: true },
    status: { type: String, required: true, enum: ["매칭전", "매칭완료"] },
    leaveRoom: [{ type: String }],
  },
  {
    timestamps: {
      currentTime: () => new Date(Date.now() + krCurrentTime),
    },
  },
);

export const ChatModel = mongoose.model<IChat>("Chat", chatSchema);
