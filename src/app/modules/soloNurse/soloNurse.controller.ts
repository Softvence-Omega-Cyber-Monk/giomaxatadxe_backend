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
