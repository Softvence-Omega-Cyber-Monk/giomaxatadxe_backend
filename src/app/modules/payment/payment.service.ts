import axios from "axios";
import { getAccessToken } from "../../utils/BankAccessToken";
import { Payment_Model } from "./payment.model";
import { Wallet_Model } from "../wallet/wallet.model";

interface BoGCallbackPayload {
  external_order_id: string;
  status: "SUCCESS" | "FAILED";
}

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
      success: `${process.env.BACKEND_URL}/api/v1/payment/success`,
      fail: `${process.env.BACKEND_URL}/api/v1/payment/fail`,
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

const handleBoGCallbackService = async (payload: BoGCallbackPayload) => {
  const { external_order_id, status } = payload;

  const payment = await Payment_Model.findById(external_order_id);
  console.log("payment ", payment);

  if (!payment) {
    throw new Error("Payment not found");
  }

  // Prevent duplicate processing
  if (payment.status === "PAID") {
    return { message: "Already processed" };
  }

  if (status === "SUCCESS") {
    payment.status = "PAID";

    // Move money to pending balance (admin holds money)
    const res = await Wallet_Model.findOneAndUpdate(
      {
        ownerId: payment.receiverId,
        ownerType: payment.receiverType,
      },
      {
        $inc: { pendingBalance: payment.amount },
      },
      { upsert: true, new: true }
    );
    console.log("response wallet", res);
  } else {
    payment.status = "FAILED";
  }

  await payment.save();

  return { message: "Callback processed successfully" };
};

// const adminPaymentData = async () => {

//   // const 


//   const allPayment = await Payment_Model.find({ status: "PAID" })
//   const totalPayoutAmout  = allPayment.reduce((acc, payment) => acc + payment.amount, 0);


// };

export const PaymentService = {
  createBoGOrder,
  handleBoGCallbackService,
};
