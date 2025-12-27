import { Request, Response } from "express";
import { SoloNurseService } from "./soloNurse.service";
import { de } from "zod/v4/locales";

export const SoloNurseController = {
  getAllSoloNurses: async (req: Request, res: Response) => {
    try {
      const result = await SoloNurseService.getAllSoloNurses(
        req.query.serviceName as string,
        req.query.sub_serviceName as string
      );
      res.json({ success: true, data: result });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  getSoloNurseById: async (req: Request, res: Response) => {
    try {
      const result = await SoloNurseService.getSoloNurseById(req.params.userId);
      res.json({ success: true, data: result });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  updateSoloNurseBasic: async (req: Request, res: Response) => {
    try {
      const profileImageUrl = req.file ? (req.file as any).path : null;
      console.log("profile image url ", profileImageUrl);

      const result = await SoloNurseService.updateSoloNurseBasic(
        req.params.userId,
        req.body,
        profileImageUrl
      );

      res.json({
        success: true,
        message: "Solo Nurse updated successfully",
        data: result,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },
  professionalUpdate: async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;

      const result = await SoloNurseService.professionalUpdate(
        userId,
        req.body
      );

      res.status(200).json({
        success: true,
        message: "Solo Nurse professional information updated successfully",
        data: result,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },

  addSubServiceWithAutoMainService: async (req: Request, res: Response) => {
    try {
      const result = await SoloNurseService.addSubServiceWithAutoMainService(
        req.params.userId,
        req.params.serviceId,
        req.params.serviceName as
          | "Blood test & Sample collection"
          | "Nurse care and infusion therapy"
          | "Nurse Care & Elderly Support"
          | "Medical massage & Physio therapy",
        req.body
      );

      res.json({
        success: true,
        message: "Solo Nurse sub service added successfully",
        data: result,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },
  deleteSingleSubService: async (req: Request, res: Response) => {
    try {
      const result = await SoloNurseService.deleteSingleSubService(
        req.params.userId,
        req.params.serviceId,
        req.params.subServiceId
      );

      res.json({
        success: true,
        message: "Solo Nurse sub service deleted successfully",
        data: result,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },

  uploadCertificate: async (req: Request, res: Response) => {
    try {
      const userId = req.params.userId;
      const data = req.body;

      const certificateUrl = req.file ? (req.file as any).path : null;
      console.log("certificateUrl", certificateUrl);

      const result = await SoloNurseService.uploadCertificate(userId, {
        data,
        certificateUrl,
      });

      res.json({
        success: true,
        message: "Certificate updated successfully",
        data: result,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },

  deleteCertificate: async (req: Request, res: Response) => {
    try {
      const userId = req.params.userId;
      const certificateId = req.params.certificateId;

      const result = await SoloNurseService.deleteCertificate(
        userId,
        certificateId
      );

      res.json({
        success: true,
        message: "Certificate deleted successfully",
        data: result,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },

  availabilitySettings: async (req: Request, res: Response) => {
    try {
      const userId = req.params.userId;
      const data = req.body;

      const result = await SoloNurseService.availabilitySettings(userId, data);

      res.json({
        success: true,
        message: "availability settings for Nurse updated successfully",
        data: result,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },

  addNewPaymentMethod: async (req: Request, res: Response) => {
    try {
      const userId = req.params.userId;
      const data = req.body;

      const result = await SoloNurseService.addNewPaymentMethod(userId, data);

      res.json({
        success: true,
        message: "New Payment Method for Nurse added successfully",
        data: result,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },
  addReviews: async (req: Request, res: Response) => {
    try {
      const userId = req.params.userId;
      const data = req.body;

      const result = await SoloNurseService.addReviews(userId, data);

      res.json({
        success: true,
        message: "Review added successfully",
        data: result,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },
  deleteSoloNurse: async (req: Request, res: Response) => {
    try {
      const { soloNurseId, soloNurseUserId } = req.params;
      await SoloNurseService.deleteSoloNurse(soloNurseId, soloNurseUserId);
      res.json({
        success: true,
        message: "Solo Nurse deleted successfully",
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  },
  getSoloNursePaymentData: async (req: Request, res: Response) => {
    try {
      const result = await SoloNurseService.getSoloNursePaymentData(
        req.params.soloNurseUserId
      );

      res.json({
        success: true,
        message: "Solo Nurse payment data fetched successfully",
        data: result,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },

  getSubServicesByMainService: async (req: Request, res: Response) => {
    try {
      const { serviceName } = req.query;

      if (!serviceName) {
        return res.status(400).json({
          success: false,
          message: "serviceName query is required",
        });
      }

      const result = await SoloNurseService.getSubServicesByMainService(
        serviceName as string
      );

      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message || "Server error",
      });
    }
  },

  getSoloNurseDashboardOverview: async (req: Request, res: Response) => {
    try {
      const result = await SoloNurseService.getSoloNurseDashboardOverview(
        req.query.soloNurseId as string
      );

      return res.status(200).json({
        success: true,
        message: "Solo Nurse dashboard overview fetched successfully",
        data: result,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message || "Server error",
      });
    }
  },
};
