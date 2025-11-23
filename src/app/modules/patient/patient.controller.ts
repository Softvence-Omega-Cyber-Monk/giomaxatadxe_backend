import { Request, Response } from "express";
import { patientService } from "./patient.service";

export const patientController = {
  getAllPatients: async (_req: Request, res: Response) => {
    try {
      const patients = await patientService.getAllPatients();

      res.status(200).json({
        success: true,
        data: patients,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  getPatientById: async (req: Request, res: Response) => {
    try {
      const patient = await patientService.getPatientById(req.params.userId);

      res.status(200).json({
        success: true,
        data: patient,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  updatePatientBasic: async (req: Request, res: Response) => {
    try {
      const result = await patientService.updatePatientBasic(
        req.params.userId,
        req.body
      );

      res.json({
        success: true,
        message: "Patient updated successfully",
        data: result,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },
  createOrUpdateAddress: async (req: Request, res: Response) => {
    try {
      const addressId = req.query?.addressId as string;

      const result = await patientService.createOrUpdateAddress(
        req.params.userId,
        addressId,
        req.body
      );

      res.json({
        success: true,
        message: "Patient updated successfully",
        data: result,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },

  deletePatient: async (req: Request, res: Response) => {
    try {
      const deleted = await patientService.deletePatient(req.params.id);

      res.status(200).json({
        success: true,
        message: "Patient profile deleted successfully",
        data: deleted,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  },
};
