import { Schema, model } from "mongoose";

const soloNurseAppoinmentSchema = new Schema(
  {
    patientId: {
      type: Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
    },
    soloNurseId: {
      type: Schema.Types.ObjectId,
      ref: "soloNurse",
      required: true,
    },
    homeAddress: {
      type: String,
    },
    visitingType: {
      type: String,
      enum: ["fristVisit", "followUp"],
      default: "fristVisit",
    },
    followUpDetails: {
      type: String,
      default: "",
    },
    reasonForVisit: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "completed", "rejected",'cancelled'],
      default: "pending",
    },
    prefarenceDate: {
      type: Date,
      required: true,
    },
    prefarenceTime: {
      type: String,
      required: true,
    },
    subService: {
      type: String,
      required: true,
    },
    appointmentFee: {
      type: Number,
      required: true,
    },
    isRefunded: {
      type: String,
      enum: ['refund-requested', 'refunded', 'no-refund', 'refund-rejected'],
      default: 'no-refund',
    },
  },
  {
    timestamps: true,
  }
);

// Format date in response
soloNurseAppoinmentSchema.set("toJSON", {
  transform: function (doc, ret: any) {
    if (ret.prefarenceDate) {
      ret.prefarenceDate = ret.prefarenceDate.toISOString().split("T")[0];
    }
    return ret;
  },
});

export const soloNurseAppoinment_Model = model(
  "soloNurseAppoinment",
  soloNurseAppoinmentSchema
);
