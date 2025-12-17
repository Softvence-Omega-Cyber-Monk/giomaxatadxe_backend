import { Types } from "mongoose";

export type TDoctor = {
  userId: Types.ObjectId;
  clinicId: Types.ObjectId;
  phoneNumber: string;
  licenseNumber: string;

  serviceType: string; // dropdown
  appointmentType: "inClinic" | "online" | "both";

  workingHour: {
    startTime: string; // "09:00 AM"
    endTime: string; // "06:00 PM"
  };
  availabilityScheduleDays: string[]; // comma-separated (e.g. Monday, Tuesday)
  dateOfBirth?: string;
  gender?: "male" | "female";
  professionalInformation?: {
    speciality: string;
    experienceYears: number;
    medicalLicenseNumber: string;
    qualifications: string;
    about: string;

    // Consultation Fees
    onlineConsultationFee?: number;
    clinicVisitFee?: number;
  };
  certificates?: {
    uploadCertificates: string;
    certificateType: string;
    certificateName: string;
  }[];
};
