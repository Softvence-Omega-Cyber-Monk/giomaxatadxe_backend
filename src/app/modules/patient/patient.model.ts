import { Schema, model, Types } from "mongoose";
import { TPatient } from "./patient.interface";

const patientSchema = new Schema<TPatient>(
  {
    userId: { type: Schema.Types.ObjectId, required: true, ref: "user" },
    phoneNumber: { type: String, required: false },
    gender: {
      type: String,
      enum: ["male", "female"],
      required: false,
    },
    bloodGroup: {
      type: String,
      enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
      required: false,
    },
    dateOfBirth: { type: String, required: false },
    address: [
      {
        addressLabel: { type: String },
        streetNumber: { type: String },
        apartmentNumber: { type: String },
        city: { type: String },
        state: { type: String },
        zipCode: { type: String },
      },
    ],
    medicalHistory: {
      conditions: [
        {
          name: { type: String, required: true },
          diagnosedDate: { type: String, required: true },
          status: { type: String, required: true },
          notes: { type: String },
        },
      ],

      Medications: [
        {
          name: { type: String, required: true },
          dosage: { type: String, required: true },
          frequency: { type: String, required: true },
          startDate: { type: String, required: true },
        },
      ],

      Allergies: [
        {
          allergyOn: { type: String, required: true },
          severity: { type: String, required: true },
          reaction: { type: String, required: true },
        },
      ],
    },
  },
  {
    timestamps: true,
  }
);

export const Patient_Model = model<TPatient>("patient", patientSchema);
