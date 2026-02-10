import { model, Schema } from "mongoose";

const mainServiceSchema = new Schema(
  {
    name: {
      type: String,
      enum: [
        "Blood test & Sample collection",
        "Nurse care and infusion therapy",
        "Nurse Care & Elderly Support",
        "Medical massage & Physio therapy",
      ],
      required: true,
    },
  },
  { timestamps: true }
);

export const MainService_Model = model("MainService", mainServiceSchema);
