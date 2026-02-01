import { doctorAppointment_Model } from "../doctorAppointment/doctorAppointment.model";
import { soloNurseAppoinment_Model } from "../soloNurseAppoinment/soloNurseAppoinment.model";
import { Patient_Model } from "../patient/patient.model";
import { Refund_Model } from "./refund.model";
import { Payment_Model } from "../payment/payment.model";

interface TRefundPayload {
  paymentId: string;
  appointmentId: string;
  userId: string;
  appointmentType: "CLINIC" | "SOLO_NURSE";
  reason: string;
}

// User requests refund
const createRefund = async (payload: TRefundPayload) => {
  const user = await Patient_Model.findById(payload.userId);
  if (!user) throw new Error("User not found");

  const payment = await Payment_Model.findById(payload.paymentId);
  if (!payment) throw new Error("Payment not found");
  if (payment.status !== "PAID") throw new Error("Only paid payments can be refunded");
  if (payment.refundStatus !== "NONE") throw new Error("Refund already requested");

  let appointment: any = null;
  if (payload.appointmentType === "CLINIC") {
    appointment = await doctorAppointment_Model.findById(payload.appointmentId);
  } else {
    appointment = await soloNurseAppoinment_Model.findById(payload.appointmentId);
  }

  if (!appointment) throw new Error("Appointment not found");

  const refund = await Refund_Model.create({
    paymentId: payload.paymentId,
    appointmentId: payload.appointmentId,
    userId: payload.userId,
    appointmentType: payload.appointmentType,
    reason: payload.reason,
  });

  payment.refundStatus = "REQUESTED";
  await payment.save();

  appointment.isRefunded = "refund-requested";
  await appointment.save();

  return refund;
};

// Get all refunds (admin)
const getAllRefunds = async () => {
  return await Refund_Model.find()
    .populate("paymentId")
    .populate("userId")
    .sort({ createdAt: -1 });
};

// Get refunds by user
const getRefundsByUserId = async (userId: string) => {
  return await Refund_Model.find({ userId }).populate("paymentId").sort({ createdAt: -1 });
};

// Admin approves or rejects refund request
const acceptOrRejectRefund = async (
  refundId: string,
  status: "APPROVED" | "REJECTED",
) => {
  const refund = await Refund_Model.findById(refundId);
  if (!refund) throw new Error("Refund request not found");
  if (refund.status !== "PENDING") throw new Error("Refund already processed");

  refund.status = status;
  refund.reviewedAt = new Date();
  await refund.save();

  const payment = await Payment_Model.findById(refund.paymentId);
  if (!payment) throw new Error("Payment not found");

  payment.refundStatus = status === "APPROVED" ? "APPROVED" : "REJECTED";
  await payment.save();

  let appointment: any = null;
  if (refund.appointmentType === "CLINIC") {
    appointment = await doctorAppointment_Model.findById(refund.appointmentId);
  } else if (refund.appointmentType === "SOLO_NURSE") {
    appointment = await soloNurseAppoinment_Model.findById(refund.appointmentId);
  }

  if (appointment) {
    appointment.isRefunded = status === "APPROVED" ? "refund-approved" : "refund-rejected";
    await appointment.save();
  }

  return refund;
};

export const RefundService = {
  createRefund,
  getAllRefunds,
  getRefundsByUserId,
  acceptOrRejectRefund,
};
