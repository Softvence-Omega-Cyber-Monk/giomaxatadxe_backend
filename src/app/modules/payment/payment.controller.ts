import { doctorAppointment_Model } from "../doctorAppointment/doctorAppointment.model";
import { soloNurseAppoinment_Model } from "../soloNurseAppoinment/soloNurseAppoinment.model";
import { Payment_Model } from "./payment.model";
import { PaymentService } from "./payment.service";

const startClinicPayment = async (req: any, res: any) => {
  const appointment = await doctorAppointment_Model.findById(
    req.body.appointmentId
  );

  if (!appointment) return res.status(404).json({ message: "Not found" });

  if (appointment.serviceType !== "online") {
    return res.status(400).json({
      message: "In-clinic appointments do not require online payment",
    });
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
};

const startSoloNursePayment = async (req: any, res: any) => {
  const appointment = await soloNurseAppoinment_Model.findById(
    req.body.appointmentId
  );

  if (!appointment) return res.status(404).json({ message: "Not found" });

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
};

export const bogCallbackController = async (req: any, res: any) => {
  try {
    console.log("BoG Webhook Payload:", req.body);

    const callbackResult = await PaymentService.handleBoGCallbackService(
      req.body
    );

    // BoG requires 200 OK always
    res.json({ success: true, data: callbackResult });
  } catch (error: any) {
    console.error("BoG Callback Error:", error.message);

    // Still return 200 to prevent retries storm
    res.sendStatus(200);
  }
};

const paymentSuccess = async (req: any, res: any) => {
  try {
    const { paymentId } = req.query;

    if (!paymentId) {
      return res.status(400).send("Invalid payment request");
    }

    const payment = await Payment_Model.findById(paymentId);

    if (!payment) {
      return res.status(404).send("Payment not found");
    }

    // Do NOT mark paid here (webhook does that)
    return res.send(`
      <h2>✅ Payment Successful</h2>
      <p>Your payment is being processed.</p>
      <p>Reference ID: ${paymentId}</p>
    `);
  } catch (error) {
    console.error(error);
    res.status(500).send("Something went wrong");
  }
};

const paymentFail = async (req: any, res: any) => {
  try {
    const { paymentId } = req.query;

    if (!paymentId) {
      return res.status(400).send("Invalid payment request");
    }

    const payment = await Payment_Model.findById(paymentId);

    if (!payment) {
      return res.status(404).send("Payment not found");
    }

    return res.send(`
      <h2>❌ Payment Failed</h2>
      <p>Your payment was not completed.</p>
      <p>Reference ID: ${paymentId}</p>
    `);
  } catch (error) {
    console.error(error);
    res.status(500).send("Something went wrong");
  }
};
const adminPaymentData = async (req: any, res: any) => {
  try {
    const data = await PaymentService.adminPaymentData();
    return res.json({
      success: true,
      message: "Payment data fetched successfully",
      data,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Something went wrong");
  }
};
const getAllTransation = async (req: any, res: any) => {
  try {
    const data = await PaymentService.getAllTransation();
    return res.json({
      success: true,
      message: "GET All Transation data fetched successfully",
      data,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Something went wrong");
  }
};

export const PaymentController = {
  startClinicPayment,
  startSoloNursePayment,
  bogCallbackController,

  paymentSuccess,
  paymentFail,
  adminPaymentData,
  getAllTransation
};
