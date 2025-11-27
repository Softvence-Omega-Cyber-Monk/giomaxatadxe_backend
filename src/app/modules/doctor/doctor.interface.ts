import { Types } from "mongoose";

export type TDoctor = {
  userId: Types.ObjectId;
  clinicId: Types.ObjectId;
  doctorName: string;
  email: string;
  phoneNumber: string;
  licenseNumber: string;

  serviceType: string; // dropdown
  status: string; // dropdown

  workingHour: string; // time range, or selected schedule
  availabilitySchedule: string[]; // comma-separated (e.g. Monday, Tuesday)

  dateOfBirth?: string;
  gender?: "male" | "female";

  professionalInformation?: {
    speciality: string;
    experienceYears: number;
    medicalLicenseNumber: string;
    qualifications: string;
    about: string;

    // Consultation Fees
    onlineConsultationFee: number;
    clinicVisitFee: number;
  };
  certificates?: {
    uploadCertificates: string;
    certificateType: string;
    certificateName: string;
  }[];

};
