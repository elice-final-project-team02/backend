import mongoose, { Schema, Document } from "mongoose";

export interface ICareInformation extends Document {
  postId: Schema.Types.ObjectId;
  area: Schema.Types.ObjectId;
  careTarget: "아동" | "노인" | "장애인";
  targetFeatures?: string | null;
  cautionNotes?: string | null;
  preferredmateAge: Array<"20대" | "30대" | "40대" | "50대" | "60대 이상" | "나이 무관">;
  preferredmateGender: "여성" | "남성" | "성별 무관";
  careUser?: string | null;
}

const careInformationSchema = new Schema<ICareInformation>({
  postId: { type: Schema.Types.ObjectId, ref: "Post", required: true },
  area: { type: Schema.Types.ObjectId, ref: "Area", required: true },
  careTarget: { type: String, enum: ["아동", "노인", "장애인"], required: true },
  targetFeatures: { type: String, default: null },
  cautionNotes: { type: String, default: null },
  preferredmateAge: [
    { type: String, enum: ["20대", "30대", "40대", "50대", "60대 이상", "나이 무관"], required: true },
  ],
  preferredmateGender: { type: String, enum: ["여성", "남성", "성별 무관"], required: true },
  careUser: [{ type: String, default: null }], // 매칭유저Id, 이름
});

export const CareInformationModel = mongoose.model<ICareInformation>("CareInformation", careInformationSchema);
