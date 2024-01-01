import mongoose, { Schema, Document } from "mongoose";

export interface IMessage extends Document {
  chat: Schema.Types.ObjectId;
  sender: string;
  receiver: string;
  content: string;
  isRead: boolean;
}

const krCurrentTime = 9 * 60 * 60 * 1000;

const messageSchema = new Schema<IMessage>(
  {
    chat: { type: Schema.Types.ObjectId, ref: "Chat" },
    sender: { type: String, required: true },
    receiver: { type: String, required: true },
    content: { type: String, required: true },
    isRead: { type: Boolean, required: true },
  },
  {
    timestamps: {
      currentTime: () => new Date(Date.now() + krCurrentTime),
    },
  },
);

export const MessageModel = mongoose.model<IMessage>("Message", messageSchema);
