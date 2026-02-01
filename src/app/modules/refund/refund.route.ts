import { Router } from "express";
import { RefundController } from "./refund.controller";

const router = Router();

router.post("/create", RefundController.createRefund);
router.get("/getAll", RefundController.getAllRefunds);
router.get(
  "/getSingleUser/refund-requests/:userId",
  RefundController.getRefundsByUserId
);
router.post(
  "/acceptOrReject/refund-requests/:userId",
  RefundController.acceptOrRejectRefund
);

export const RefundRoutes = router;
