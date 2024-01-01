import mongoose, { Schema, Document } from "mongoose";

export interface IRole extends Document {
  role: "user" | "careUser" | "admin";
}

const roleSchema = new Schema<IRole>({
  role: { type: String, enum: ["user", "careUser", "admin"] },
});

export const RoleModel = mongoose.model<IRole>("Role", roleSchema);
