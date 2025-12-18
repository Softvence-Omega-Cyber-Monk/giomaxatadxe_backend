import mongoose, { Schema, Model } from "mongoose";
import { ICall } from "./AgoraVideoCall.interface";

const callSchema = new Schema<ICall>(
  {
    callId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    channelName: {
      type: String,
      required: true,
    },
    callerId: {
      type: String,
      required: true,
    },
    receiverId: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["ringing", "accepted", "ended", "missed"],
      default: "ringing",
    },
    startedAt: {
      type: Date,
    },
    endedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

export const videoCall_model = mongoose.model<ICall>("videoCall", callSchema);
