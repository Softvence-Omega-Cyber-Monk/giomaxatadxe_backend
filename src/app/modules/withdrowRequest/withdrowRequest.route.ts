import express from "express";
import { WithdrawRequestController } from "./withdrowRequest.controller";

const router = express.Router();

/**
 * User (Clinic / Solo Nurse)
 */
router.post("/create", WithdrawRequestController.createWithdrawRequest);
router.get("/getWithdrawRequests/me", WithdrawRequestController.getMyWithdrawRequests);

/**
 * Admin
 */
router.get("getAll/admin", WithdrawRequestController.getAllWithdrawRequests);
router.patch("/:id/pay", WithdrawRequestController.markWithdrawAsPaid);
router.patch("/:id/reject", WithdrawRequestController.rejectWithdrawRequest);

export default router;
