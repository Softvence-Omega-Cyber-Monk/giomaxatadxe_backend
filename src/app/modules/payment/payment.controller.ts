import { Request, Response } from "express";
import { doctorAppointment_Model } from "../doctorAppointment/doctorAppointment.model";
import { soloNurseAppoinment_Model } from "../soloNurseAppoinment/soloNurseAppoinment.model";
import { Payment_Model } from "./payment.model";
import { PaymentService } from "./payment.service";

// Start payment for clinic appointment
const startClinicPayment = async (req: Request, res: Response) => {
  try {
    const appointment = await doctorAppointment_Model.findById(req.body.appointmentId);
    if (!appointment) return res.status(404).json({ message: "Appointment not found" });

    if (appointment.serviceType !== "online") {
      return res.status(400).json({ message: "In-clinic appointments do not require online payment" });
    }

    const payment = await Payment_Model.create({
      appointmentId: appointment._id,
      appointmentType: "CLINIC",
      patientId: appointment.patientId,
      receiverId: appointment.clinicId,
      receiverType: "CLINIC",
      amount: appointment.appoinmentFee,
    });

    const bogOrder = await PaymentService.createBoGOrder(payment);
    payment.bogOrderId = bogOrder.id;
    await payment.save();

    res.json({ redirectUrl: bogOrder._links.redirect.href });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Start payment for solo nurse appointment
const startSoloNursePayment = async (req: Request, res: Response) => {
  try {
    const appointment = await soloNurseAppoinment_Model.findById(req.body.appointmentId);
    if (!appointment) return res.status(404).json({ message: "Appointment not found" });

    const payment = await Payment_Model.create({
      appointmentId: appointment._id,
      appointmentType: "SOLO_NURSE",
      patientId: appointment.patientId,
      receiverId: appointment.soloNurseId,
      receiverType: "SOLO_NURSE",
      amount: appointment.appointmentFee,
    });

    const bogOrder = await PaymentService.createBoGOrder(payment);
    payment.bogOrderId = bogOrder.id;
    await payment.save();

    res.json({ redirectUrl: bogOrder._links.redirect.href });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// BoG webhook callback
const bogCallbackController = async (req: Request, res: Response) => {
  try {
    await PaymentService.handleBoGCallbackService(req.body);
    res.json({ success: true, message: "Callback processed" });
  } catch (error: any) {
    console.error("BoG Callback Error:", error.message);
    res.sendStatus(200); // Always return 200 to prevent webhook retries
  }
};

// Payment success page
const paymentSuccess = async (req: Request, res: Response) => {
  const { paymentId } = req.query;
  if (!paymentId) return res.status(400).send("Invalid payment request");

  const payment = await Payment_Model.findById(paymentId as string);
  if (!payment) return res.status(404).send("Payment not found");

  res.send(`
    <h2>✅ Payment Successful</h2>
    <p>Your payment is being processed.</p>
    <p>Reference ID: ${paymentId}</p>
  `);
};

// Payment failed page
const paymentFail = async (req: Request, res: Response) => {
  const { paymentId } = req.query;
  if (!paymentId) return res.status(400).send("Invalid payment request");

  const payment = await Payment_Model.findById(paymentId as string);
  if (!payment) return res.status(404).send("Payment not found");

  res.send(`
    <h2>❌ Payment Failed</h2>
    <p>Your payment was not completed.</p>
    <p>Reference ID: ${paymentId}</p>
  `);
};


const getPaymentIdForRefund = async (req: Request, res: Response) => {
  try {
    const { appointmentId, appointmentType } = req.query;

    if (!appointmentId || !appointmentType) {
      return res.status(400).json({
        success: false,
        message: "appointmentId and appointmentType are required",
      });
    }

    const paymentId = await PaymentService.getPaymentIdForRefund(
      appointmentId as string,
      appointmentType as "CLINIC" | "SOLO_NURSE"
    );

    return res.status(200).json({
      success: true,
      message: "Payment ID fetched successfully",
      data: { paymentId },
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Admin payment overview
const adminPaymentData = async (_req: Request, res: Response) => {
  try {
    const data = await PaymentService.adminPaymentData();
    res.json({ success: true, message: "Payment data fetched successfully", data });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin get all transactions
const getAllTransactions = async (_req: Request, res: Response) => {
  try {
    const data = await PaymentService.getAllTransactions();
    res.json({ success: true, message: "All transaction data fetched successfully", data });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const PaymentController = {
  startClinicPayment,
  startSoloNursePayment,
  bogCallbackController,
  paymentSuccess,
  paymentFail,
  adminPaymentData,
  getAllTransactions,
  getPaymentIdForRefund
};
