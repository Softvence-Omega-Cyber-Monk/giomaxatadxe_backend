import { Schema, model } from "mongoose";
import { TClinic } from "./clinic.interface";

const clinicSchema = new Schema<TClinic>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "user",
    },
    phoneNumber: {
      type: String,
    },
    nationality: {
      type: String,
      required: true,
    },
    nationalIdNumber: {
      type: String,
      required: true,
    },
    clinicCertificates: [
      {
        uploadCertificates: { type: String },
        certificateType: { type: String },
        certificateName: { type: String },
      },
    ],
    medicalLicenseNumber: {
      type: String,
      required: false,
    },
    servicesOffered: {
      type: [String],
      required: false,
    },
    clinicDescription: {
      type: String,
      required: false,
    },
    availability: {
      startTime: { type: String },
      endTime: { type: String },
      workingDays: { type: [String] },
      appointmentType: {
        type: String,
        enum: ["inClinic", "online", "both"],
      },
    },
    paymentAndEarnings: {
      totalEarnings: {
        totalThisMonth: { type: Number, default: 0 },
        pending: { type: Number, default: 0 },
        availbleForWithdrawal: { type: Number, default: 0 },
      },
      withdrawalMethods: [
        {
          cardHolderName: { type: String },
          cardNumber: { type: String },
          cvv: { type: String },
          expiryDate: { type: String },
        },
      ],
    },
    reviews: [
      {
        patientId: { type: Schema.Types.ObjectId, ref: "Patient" },
        rating: { type: Number },
        comment: { type: String },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    avarageRating: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

export const Clinic_Model = model<TClinic>("Clinic", clinicSchema);
