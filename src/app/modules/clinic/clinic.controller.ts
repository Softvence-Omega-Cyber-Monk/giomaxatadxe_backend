import { Request, Response } from "express";
import { ClinicService } from "./clinic.service";


const getAllClinics = async (_req: Request, res: Response) => {
  try {
    const result = await ClinicService.getAllClinics();

    res.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getClinicById = async (req: Request, res: Response) => {
  try {
    const result = await ClinicService.getClinicById(req.params.id);

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Clinic not found",
      });
    }

    res.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const updateClinic = async (req: Request, res: Response) => {
  try {
    const result = await ClinicService.updateClinic(
      req.params.id,
      req.body
    );

    res.json({
      success: true,
      message: "Clinic updated successfully",
      data: result,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const deleteClinic = async (req: Request, res: Response) => {
  try {
    const result = await ClinicService.deleteClinic(req.params.id);

    res.json({
      success: true,
      message: "Clinic deleted successfully",
      data: result,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const ClinicController = {
  
  getAllClinics,
  getClinicById,
  updateClinic,
  deleteClinic,
};
