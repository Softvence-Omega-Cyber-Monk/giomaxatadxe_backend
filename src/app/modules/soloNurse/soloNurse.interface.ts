import { Types } from "mongoose";

export type TSoloNurse = {
  userId: Types.ObjectId;
  phoneNumber?: string;
  gender?: "male" | "female";
  dateOfBirth?: string;
  professionalInformation?: {
    Services:
      | "Blood test & Sample collection"
      | "Nurse care and infusion therapy"
      | "Nurse Care & Elderly Support"
      | "Medical massage & Physio therapy";
    speciality: string;
    experience: string;
    MedicalLicense: string;
    qualifications: string;
    about: string;
    consultationFee: string;
  };
  certificates?: {
    uploadCertificates: string;
    certificateType: string;
    certificateName: string;
  }[];
  availability?: {
    startTime: string;
    endTime: string;
    workingDays: string[];
  };
  paymentAndEarnings?: {
    totalEarnings: {
      totalThisMonth: number;
      pending: number;
      availbleForWithdrawal: number;
    };
    withdrawalMethods: {
      cardHolderName: string;
      cardNumber: string;
      cvv: string;
      expiryDate: string;
    }[];
  };
};
