import express from "express";
import { PaymentController } from "./payment.controller";

const router = express.Router();

router.post("/clinic/start", PaymentController.startClinicPayment);
router.post("/solo-nurse/start", PaymentController.startSoloNursePayment);

router.post("/bog/callback", PaymentController.bogCallbackController);

router.get("/success", PaymentController.paymentSuccess);
router.get("/fail", PaymentController.paymentFail);

// admin
// router.post("/admin/release-payout", releasePayout);

export const PaymentRoutes = router;
