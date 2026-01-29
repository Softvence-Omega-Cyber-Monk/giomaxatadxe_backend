import { is } from "zod/v4/locales";
import { doctorAppointment_Model } from "../doctorAppointment/doctorAppointment.model";
import { TRefund } from "./refund.interface";
import { Refund } from "./refund.model";
import { soloNurseAppoinment_Model } from "../soloNurseAppoinment/soloNurseAppoinment.model";

import { Patient_Model } from "../patient/patient.model";

const createRefund = async (payload: TRefund) => {
  // console.log("payload", payload);
  const user = await Patient_Model.findOne({ _id: payload.userId });

  // if (!user?.paymentMethods || user.paymentMethods.length === 0) {
  //   throw new Error("No payment methods found , Please add payment methods");
  // }

  let appointment: any = null;

  if (payload.appointmentType === "doctor") {
    appointment = await doctorAppointment_Model.findOne({
      _id: payload.appointmentId,
      serviceType: "online",
    });
  }

  if (payload.appointmentType === "soloNurse") {
    appointment = await soloNurseAppoinment_Model.findOne({
      _id: payload.appointmentId,
    });
  }

  console.log('appointment in refund',appointment);

  if (!appointment) {
    throw new Error("Appointment not found");
  }

  if (appointment.isRefunded !== "no-refund") {
    throw new Error("Refund already requested or processed");
  }

  // Create refund
  const refund = await Refund.create(payload);

  //  Update appointment refund status
  appointment.isRefunded = "refund-requested";
  await appointment.save();

  return refund;
};

const getAllRefunds = async () => {
  return await Refund.find().sort({ createdAt: -1 });
};

const getRefundByUserId = async (userId: string) => {
  return await Refund.find({ userId });
};

const acceptOrRejectRefund = async (
  refundId: string,
  status: "pending" | "approved" | "rejected",
) => {
  const refund = await Refund.findById(refundId);
  if (!refund) {
    throw new Error("Refund request not found");
  }

  refund.status = status;
  await refund.save();

  // Update appointment refund status accordingly
  let appointment: any = null;

  if (refund.appointmentType === "doctor") {
    appointment = await doctorAppointment_Model.findOne({
      _id: refund.appointmentId,
    });
  }

  if (refund.appointmentType === "soloNurse") {
    appointment = await soloNurseAppoinment_Model.findOne({
      _id: refund.appointmentId,
    });
  }

  if (appointment) {
    appointment.isRefunded =
      status === "approved" ? "refunded" : "refund-rejected";
    await appointment.save();
  }

  return refund;
};

export const RefundService = {
  createRefund,
  getAllRefunds,
  getRefundByUserId,
  acceptOrRejectRefund,
};
