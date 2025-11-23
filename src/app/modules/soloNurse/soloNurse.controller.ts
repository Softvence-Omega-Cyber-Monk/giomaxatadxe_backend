import { Request, Response } from "express";
import { SoloNurseService } from "./soloNurse.service";

export const SoloNurseController = {


  getAllSoloNurses: async (req: Request, res: Response) => {
    try {
      const result = await SoloNurseService.getAllSoloNurses();
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

   updateSoloNurseBasic : async (req: Request, res: Response) => {
    try {
      const result = await SoloNurseService.updateSoloNurseBasic(
        req.params.userId,
        req.body
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
   professionalUpdate : async (req: Request, res: Response) => {
    try {
      const result = await SoloNurseService.professionalUpdate(
        req.params.userId,
        req.body
      );
  
      res.json({
        success: true,
        message: "Solo Nurse professional information  updated successfully",
        data: result,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },


   uploadCertificate : async (req: Request, res: Response) => {
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

  deleteSoloNurse: async (req: Request, res: Response) => {
    try {
      await SoloNurseService.deleteSoloNurse(req.params.id);
      res.json({
        success: true,
        message: "Solo Nurse deleted successfully",
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  },
};
