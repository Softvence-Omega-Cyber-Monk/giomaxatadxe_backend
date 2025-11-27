import { Schema, model } from "mongoose";
import { TDoctor } from "./doctor.interface";

const ProfessionalInfoSchema = new Schema({
  speciality: { type: String, required: true },
  experienceYears: { type: Number, required: true },
  medicalLicenseNumber: { type: String, required: true },
  qualifications: { type: String, required: true },
  about: { type: String, required: true },

  onlineConsultationFee: { type: Number, required: true },
  clinicVisitFee: { type: Number, required: true },
});

const CertificateSchema = new Schema({
  uploadCertificates: { type: String, required: true },
  certificateType: { type: String, required: true },
  certificateName: { type: String, required: true },
});

const DoctorSchema = new Schema<TDoctor>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    clinicId: { type: Schema.Types.ObjectId, ref: "Clinic", required: true },

    doctorName: { type: String, required: true },
    email: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    licenseNumber: { type: String, required: true },

    serviceType: { type: String, required: true },
    status: { type: String, required: true },

    workingHour: { type: String, required: true },
    availabilitySchedule: [{ type: String, required: true }],

    dateOfBirth: { type: String },
    gender: { type: String, enum: ["male", "female"] },

    professionalInformation: ProfessionalInfoSchema,

    certificates: [CertificateSchema],
  },
  { timestamps: true }
);

export const Doctor_Model = model<TDoctor>("Doctor", DoctorSchema);
