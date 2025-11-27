import { Request, Response } from "express";
import { DoctorService } from "./doctor.service";


export const DoctorController = {
  createDoctor: async (req: Request, res: Response) => {
    try {
      const result = await DoctorService.createDoctor(req.body);
      res.status(201).json({
        success: true,
        message: "Doctor created successfully",
        data: result,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

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
      const doctor = await DoctorService.getDoctorById(req.params.id);
      if (!doctor) {
        return res.status(404).json({ success: false, message: "Doctor not found" });
      }
      res.json({ success: true, data: doctor });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  updateDoctor: async (req: Request, res: Response) => {
    try {
      const updated = await DoctorService.updateDoctor(req.params.id, req.body);
      res.json({
        success: true,
        message: "Doctor updated successfully",
        data: updated,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
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
