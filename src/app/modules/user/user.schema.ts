import { model, Schema } from "mongoose";
import { TUser } from "./user.interface";

const user_schema = new Schema<TUser>(
  {
    fullName: { type: String, required: true },
    profileImage: { type: String },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    comfirmPassword: { type: String, required: true },
    role: {
      type: String,
      enum: ["patient", "doctor", "solo_nurse", "clinic", "admin"],
      required: true,
    },
    fcmToken: { type: String, default: null },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

export const User_Model = model("user", user_schema);
