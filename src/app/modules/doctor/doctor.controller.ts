import { Request, Response } from "express";
import { DoctorService } from "./doctor.service";

export const DoctorController = {
  getDoctors: async (req: Request, res: Response) => {
    try {
      const doctors = await DoctorService.getDoctors();
      res.json({ success: true, data: doctors });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  getDoctorById: async (req: Request, res: Response) => {
    try {
      const doctor = await DoctorService.getDoctorById(req.params.userId);
      if (!doctor) {
        return res
          .status(404)
          .json({ success: false, message: "Doctor not found" });
      }
      res.json({ success: true, data: doctor });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  updateDoctorBasic: async (req: Request, res: Response) => {
    try {
      const result = await DoctorService.updateDoctorBasic(
        req.params.userId,
        req.body
      );

      res.json({
        success: true,
        message: "Doctor updated successfully",
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
    console.log("from controller ", req.body);
    try {
      const result = await DoctorService.professionalUpdate(
        req.params.userId,
        req.body
      );

      res.json({
        success: true,
        message: " Doctor professional information  updated successfully",
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

      const result = await DoctorService.uploadCertificate(userId, {
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

      const result = await DoctorService.deleteCertificate(
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

  deleteDoctor: async (req: Request, res: Response) => {
    try {
      await DoctorService.deleteDoctor(req.params.id);
      res.json({ success: true, message: "Doctor deleted successfully" });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  },
};
