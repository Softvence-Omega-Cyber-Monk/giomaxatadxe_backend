import { Request, Response } from "express";
import { WithdrowRequestService } from "./withdrowRequest.service";

const createWithdrawRequest = async (req: Request, res: Response) => {
  try {
    const result = await WithdrowRequestService.createWithdrawRequest(req.body);

    res.status(201).json({
      success: true,
      message: `Withdraw request of ${
        result.amount
      } GEL for ${result.ownerType.toLowerCase()} created successfully.`,
      data: result,
    });
  } catch (error: any) {
    let message = "Something went wrong. Please try again.";

    // Custom messages for known errors
    if (error.message.includes("Wallet not found")) {
      message = "Your wallet was not found. Please check your account.";
    } else if (error.message.includes("Insufficient balance")) {
      message = "You do not have enough balance to request this withdrawal.";
    }

    res.status(400).json({
      success: false,
      message,
    });
  }
};

const getMyWithdrawRequests = async (req: Request, res: Response) => {
  try {
    const { ownerId } = req.query;
    const result = await WithdrowRequestService.getWithdrawRequestsByOwner(
      ownerId as string
    );
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const getAllWithdrawRequests = async (_req: Request, res: Response) => {
  try {
    const result = await WithdrowRequestService.getAllWithdrawRequests();
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

 const getSingleWithdrawRequest = async (req: Request, res: Response) => {
  try {
    const result = await WithdrowRequestService.getSingleWithdrawRequest(
      req.params.withdrawId
    );
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const markWithdrawAsPaid = async (req: Request, res: Response) => {
  try {
    const result = await WithdrowRequestService.markAsPaid(
      req.params.withdrawId
    );
    res.json({
      success: true,
      message: "You received your money by cutting plaatfrom fee",
      data: result,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const rejectWithdrawRequest = async (req: Request, res: Response) => {
  try {
    const result = await WithdrowRequestService.rejectWithdraw(req.params.id);
    res.json({
      success: true,
      message: "Withdraw request rejected",
      data: result,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const WithdrawRequestController = {
  createWithdrawRequest,
  getMyWithdrawRequests,
  getAllWithdrawRequests,
  getSingleWithdrawRequest,
  markWithdrawAsPaid,
  rejectWithdrawRequest,
};
