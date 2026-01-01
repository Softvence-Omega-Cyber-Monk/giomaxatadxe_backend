import { Types } from "mongoose";

export type TRefund = {
  appointmentId: string;
  userId: Types.ObjectId;
  appointmentType: "doctor" | "soloNurse";

  cardNumber: string;
  cardHolderName: string;
  expiryDate: string;
  cvv: string;
};
