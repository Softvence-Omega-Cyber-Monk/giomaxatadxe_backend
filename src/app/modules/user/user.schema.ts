import { model, Schema } from "mongoose";
import { TUser } from "./user.interface";

const user_schema = new Schema<TUser>(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["patient", "solo_nurse", "clinic", "admin"],
      required: true,
    },
    comfirmPassword: { type: String, required: true },
    nationality: { type: String, required: false },
    NationalIdNumber: { type: String, required: false },
    certificate: { type: String, required: false },
    isVerified: { type: Boolean, default: false },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

export const User_Model = model("user", user_schema);
