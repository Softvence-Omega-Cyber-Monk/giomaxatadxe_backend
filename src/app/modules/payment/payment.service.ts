import axios from "axios";
import { getAccessToken } from "../../utils/BankAccessToken";
import { Payment_Model } from "./payment.model";
import { Wallet_Model } from "../wallet/wallet.model";

const createBoGOrder = async (payment: any) => {
  const token = await getAccessToken();

  const body = {
    callback_url: `${process.env.BACKEND_URL}/api/v1/payment/bog/callback`,
    external_order_id: payment._id.toString(),
    purchase_units: {
      currency: "GEL",
      total_amount: payment.amount.toFixed(2),
      basket: [
        {
          quantity: 1,
          unit_price: payment.amount.toFixed(2),
          product_id: payment.appointmentId.toString(),
        },
      ],
    },
    redirect_urls: {
      success: `${process.env.BACKEND_URL}/api/v1/payment/success?paymentId=${payment._id}`,
      fail: `${process.env.BACKEND_URL}/api/v1/payment/fail?paymentId=${payment._id}`,
    },
  };

  const res = await axios.post(
    "https://api.bog.ge/payments/v1/ecommerce/orders",
    body,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "Accept-Language": "en",
      },
    }
  );

  return res.data;
};

const handleBoGCallbackService = async (payload: any) => {
  const external_order_id = payload?.body?.external_order_id;
  const status = payload?.body?.order_status?.key;

  const payment = await Payment_Model.findById(external_order_id);
  if (!payment) throw new Error("Payment not found");

  if (payment.status === "PAID") return { message: "Already processed" };

  if (status === "completed") {
    payment.status = "PAID";
    await Wallet_Model.findOneAndUpdate(
      { ownerId: payment.receiverId, ownerType: payment.receiverType },
      { $inc: { pendingBalance: payment.amount } },
      { upsert: true, new: true }
    );
  } else {
    payment.status = "FAILED";
  }

  await payment.save();
  return { message: "Callback processed successfully" };
};

const adminPaymentData = async () => {
  const allPayment = await Payment_Model.find();
  const paymentsWithoutPaid = await Payment_Model.find({ status: "INITIATED" });
  const totalPayableAmount = paymentsWithoutPaid.reduce((acc, p) => acc + p.amount, 0);

  const paymentsWithPaid = await Payment_Model.find({ status: "PAID" });
  const totalPayoutAmount = paymentsWithPaid.reduce((acc, p) => acc + p.amount, 0);

  return {
    allPaymentTransactions: allPayment.length,
    totalPaidAmount: totalPayoutAmount,
    totalPayableAmount,
  };
};

const getAllTransactions = async () => {
  return await Payment_Model.find().sort({ createdAt: -1 });
};

export const PaymentService = {
  createBoGOrder,
  handleBoGCallbackService,
  adminPaymentData,
  getAllTransactions,
};
