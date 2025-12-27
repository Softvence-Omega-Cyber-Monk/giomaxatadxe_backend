import { Request, Response } from "express";
import { DashboardService } from "./admin.service";


const getDashboardOverview = async (req: Request, res: Response) => {
  try {
    const data = await DashboardService.getDashboardOverview();

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to load dashboard data",
    });
  }
};

export const DashboardController = {
  getDashboardOverview,
};
