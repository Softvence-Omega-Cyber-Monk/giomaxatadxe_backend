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
    const result = await ClinicService.getClinicById(req.params.userId);

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

const updateClinicBasic = async (req: Request, res: Response) => {
  try {
    const result = await ClinicService.updateClinicBasic(
      req.params.userId,
      req.body
    );

    res.json({
      success: true,
      message: "Clinic information updated successfully",
      data: result,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
const uploadCertificate = async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId;
    const data = req.body;

    const certificateUrl = req.file ? (req.file as any).path : null;
    console.log("certificateUrl", certificateUrl);

    const result = await ClinicService.uploadCertificate(userId, {
      data,
      certificateUrl,
    });

    res.json({
      success: true,
      message: "Certificate uploaded successfully",
      data: result,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

 const   deleteCertificate = async (req: Request, res: Response) => {
    try {
      const userId = req.params.userId;
      const certificateId = req.params.certificateId;

      const result = await ClinicService.deleteCertificate(userId, certificateId);
  
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
  }




const availabilitySettings = async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId;
    const data = req.body;

    const result = await ClinicService.availabilitySettings(userId, data);

    res.json({
      success: true,
      message: "availability settings updated successfully",
      data: result,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
const addNewPaymentMethod = async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId;
    const data = req.body;

    const result = await ClinicService.addNewPaymentMethod(userId, data);

    res.json({
      success: true,
      message: "New Payment Method added successfully",
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
  updateClinicBasic,
  uploadCertificate,
  deleteCertificate,
  availabilitySettings,
  addNewPaymentMethod,
  deleteClinic,
};
