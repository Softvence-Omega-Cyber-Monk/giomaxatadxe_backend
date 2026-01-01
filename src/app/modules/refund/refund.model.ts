import { Schema, model } from "mongoose";
import { TRefund } from "./refund.interface";

const refundSchema = new Schema<TRefund>(
  {
    appointmentId: {
      type: String,
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    appointmentType: {
      type: String,
      enum: ["doctor", "soloNurse"],
      required: true,
    },
    cardNumber: {
      type: String,
      required: true,
    },
    cardHolderName: {
      type: String,
      required: true,
    },
    expiryDate: {
      type: String,
      required: true,
    },
    cvv: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Refund = model<TRefund>("Refund", refundSchema);
