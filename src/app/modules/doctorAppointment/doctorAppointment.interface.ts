import { Types } from "mongoose";

export type TDoctorAppointment = {
  patientId: Types.ObjectId;
  doctorId: Types.ObjectId;
  serviceType: "inClinic" | "online" | "both";
  visitingType: "fristVisit" | "followUp";
  followUpDetails?: string;
  status: "pending" | "confirmed" | "completed" | "rejected";
  prefarenceDate: Date;
  prefarenceTime: string;
};
