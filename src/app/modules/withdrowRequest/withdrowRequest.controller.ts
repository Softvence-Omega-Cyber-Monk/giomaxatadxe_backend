import { Request, Response } from "express";
import { WithdrowRequestService } from "./withdrowRequest.service";


/**
 * Create withdraw request
 */
 const createWithdrawRequest = async (req: Request, res: Response) => {
  try {
    const result = await WithdrowRequestService.createWithdrawRequest(req.body);
    res.status(201).json({ success: true, data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

/**
 * Get withdraw requests of logged-in user
 */
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

/**
 * Admin: get all withdraw requests
 */
 const getAllWithdrawRequests = async (_req: Request, res: Response) => {
  try {
    const result = await WithdrowRequestService.getAllWithdrawRequests();
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Admin: mark withdraw as PAID
 */
 const markWithdrawAsPaid = async (req: Request, res: Response) => {
  try {
    const result = await WithdrowRequestService.markAsPaid(req.params.id);
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

/**
 * Admin: reject withdraw request
 */
 const rejectWithdrawRequest = async (req: Request, res: Response) => {
  try {
    const result = await WithdrowRequestService.rejectWithdraw(req.params.id);
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};


export const WithdrawRequestController = {
  createWithdrawRequest,
  getMyWithdrawRequests,
  getAllWithdrawRequests,
  markWithdrawAsPaid,
  rejectWithdrawRequest,
};