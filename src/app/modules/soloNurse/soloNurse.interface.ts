import { Types } from "mongoose";

export type TSoloNurse = {
  userId: Types.ObjectId;
  nationality: string;
  nationalIdNumber: string;
  phoneNumber?: string;

  gender?: "male" | "female";
  dateOfBirth?: string;
  professionalInformation?: {
    services: {
      serviceId: string;
      serviceName:
        | "Blood test & Sample collection"
        | "Nurse care and infusion therapy"
        | "Nurse Care & Elderly Support"
        | "Medical massage & Physio therapy";

      subServices: {
        name: string;
        price: number;
      }[];
    }[];

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
  /** ✅ UPDATED AVAILABILITY LOGIC */
  availability?: {
    day: string; // Saturday, Sunday
    startTime: string; // 09:00
    endTime: string; // 17:00
    isEnabled: boolean;
  }[];

  /** ✅ DATE-BASED BLOCKING */
  blockedDates?: {
    date: Date; // YYYY-MM-DD
  }[];

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
      isDefault: boolean;
    }[];
  };
  reviews?: {
    patientId: Types.ObjectId;
    rating: number;
    comment: string;
    createdAt: Date;
  }[];
  avarageRating?: number;
};
