import express from "express";
import { PaymentController } from "./payment.controller";

const router = express.Router();

router.post("/clinic", PaymentController.startClinicPayment);
router.post("/solo-nurse", PaymentController.startSoloNursePayment);

router.post("/bog/callback", PaymentController.bogCallbackController);

router.get("/success", PaymentController.paymentSuccess);
router.get("/fail", PaymentController.paymentFail);

// admin
router.get("/admin/payment-data", PaymentController.adminPaymentData);

export const PaymentRoutes = router;
