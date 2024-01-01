import mongoose, { Schema, Document } from "mongoose";

export interface IArea extends Document {
  region: string;
  subRegion: string;
}

const areaSchema = new Schema<IArea>({
  region: { type: String, required: true },
  subRegion: { type: String, required: true },
});

export const AreaModel = mongoose.model<IArea>("Area", areaSchema);
