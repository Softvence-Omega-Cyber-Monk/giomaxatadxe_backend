import { Request, Response } from "express";
import { RefundService } from "./refund.service";

const createRefund = async (req: Request, res: Response) => {
  try {
    const result = await RefundService.createRefund(req.body);

    res.status(201).json({
      success: true,
      message: "Refund request created successfully",
      data: result,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getAllRefunds = async (_req: Request, res: Response) => {
  try {
    const result = await RefundService.getAllRefunds();

    res.status(200).json({
      success: true,
        message: "Refund requests retrieved successfully",
      data: result,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getRefundByUserId = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const result =
      await RefundService.getRefundByUserId(userId);
    res.status(200).json({
      success: true,
      message: "single user Refund request get successfully",
      data: result,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const RefundController = {
  createRefund,
  getAllRefunds,
  getRefundByUserId,
};
