import { Schema, model } from "mongoose";
import { TSoloNurse } from "./soloNurse.interface";

const soloNurseSchema = new Schema<TSoloNurse>(
  {
    userId: { type: Schema.Types.ObjectId, required: true, ref: "user" },

    phoneNumber: { type: String, required: false },

    gender: {
      type: String,
      enum: ["male", "female"],
      required: false,
    },
    dateOfBirth: { type: String, required: false },
    professionalInformation: {
      Services: {
        type: String,
        enum: [
          "Blood test & Sample collection",
          "Nurse care and infusion therapy",
          "Nurse Care & Elderly Support",
          "Medical massage & Physio therapy",
        ],
        required: false,
      },
      speciality: { type: String, required: false },
      experience: { type: String, required: false },
      MedicalLicense: { type: String, required: false },
      qualifications: { type: String, required: false },
      about: { type: String, required: false },
      consultationFee: { type: String, required: false },
    },
    certificates: [
      {
        uploadCertificates: { type: String, required: false },
        certificateType: { type: String, required: false },
        certificateName: { type: String, required: false },
      },
    ],
    availability: {
      startTime: { type: String },
      endTime: { type: String },
      workingDays: { type: [String] },
    },

    paymentAndEarnings: {
      totalEarnings: {
        totalThisMonth: { type: Number, default: 0 },
        pending: { type: Number, default: 0 },
        availbleForWithdrawal: { type: Number, default: 0 },
      },
      withdrawalMethods: [
        {
          cardHolderName: { type: String, required: true },
          cardNumber: { type: String, required: true },
          cvv: { type: String, required: true },
          expiryDate: { type: String, required: true },
        },
      ],
    },
  },
  { timestamps: true }
);

export const SoloNurse_Model = model<TSoloNurse>("soloNurse", soloNurseSchema);
