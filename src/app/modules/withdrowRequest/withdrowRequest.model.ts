import { Schema, model } from "mongoose";

const withdrawRequestSchema = new Schema(
  {
    walletId: {
      type: Schema.Types.ObjectId,
      ref: "Wallet",
      required: true,
    },
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true,
      index: true,
    },

    ownerType: {
      type: String,
      enum: ["CLINIC", "SOLO_NURSE"],
      required: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 1,
    },

    status: {
      type: String,
      enum: ["PENDING",  "REJECTED", "PAID"],
      default: "PENDING",
    },

  },
  {
    timestamps: true,
  }
);

export const WithdrawRequest_Model = model(
  "WithdrawRequest",
  withdrawRequestSchema
);
