import mongoose from "mongoose";

const chatSchema = new mongoose.Schema(
  {
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    receiverId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    // Optional field for admin-global chat
    receiverType: { type: String, enum: ["user", "admin"], default: "user" },

    message: { type: String, required: true },
    seen: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const ChatModel = mongoose.model("Chat", chatSchema);
