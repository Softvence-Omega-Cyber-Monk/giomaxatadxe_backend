import { Types } from "mongoose";

export type TRefund = {
  appointmentId: string;
  userId: Types.ObjectId;
  appointmentType: "doctor" | "soloNurse";
status: "pending" | "approved" | "rejected";
  cardNumber: string;
  cardHolderName: string;
  expiryDate: string;
  cvv: string;
};
