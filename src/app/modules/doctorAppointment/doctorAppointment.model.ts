import { Schema, model } from "mongoose";

const appointmentSchema = new Schema(
  {
    patientId: {
      type: Schema.Types.ObjectId,
      ref: "patient",
      required: true,
    },
    doctorId: {
      type: Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },
    serviceType: {
      type: String,
      enum: ["inClinic", "online", "both"],
      required: true,
    },
    visitingType: {
      type: String,
      enum: ["fristVisit", "followUp"],
      required: true,
    },
    followUpDetails: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "completed", "rejected"],
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
  },
  {
    timestamps: true,
  }
);

// Format date in response
appointmentSchema.set("toJSON", {
  transform: function (doc, ret: any) {
    if (ret.prefarenceDate) {
      ret.prefarenceDate = ret.prefarenceDate.toISOString().split("T")[0];
    }
    return ret;
  },
});

export const doctorAppointment_Model = model(
  "doctorAppointment",
  appointmentSchema
);
