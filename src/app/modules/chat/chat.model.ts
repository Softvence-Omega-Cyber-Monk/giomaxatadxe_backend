import mongoose from "mongoose";

const chatSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    receiverId: { type: mongoose.Schema.Types.ObjectId, ref: "user" },

    // Optional field for admin-global chat
    receiverType: { type: String, enum: ["user", "admin"], default: "user" },
    chatType: {
      type: String,
      enum: ["doctor_patient", "nurse_patient", "user_admin"],
      required: true,
    },
    message: { type: String, required: true },
    seen: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const ChatModel = mongoose.model("Chat", chatSchema);
