import { Request, Response } from "express";
import { doctorAppointmentService } from "./doctorAppointment.service";

export const doctorAppointmentController = {
  create: async (req: Request, res: Response) => {
    try {
      const result = await doctorAppointmentService.createAppointment(req.body);
      res.status(201).json({
        success: true,
        message: "Appointment created successfully",
        data: result,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  getAll: async (req: Request, res: Response) => {

    try {
      const result = await doctorAppointmentService.getAllAppointments();
      res.json({
        success: true,
        message: "Appointments fetched successfully",
        data: result,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  getOne: async (req: Request, res: Response) => {
    try {
      const result = await doctorAppointmentService.getAppointmentById(
        req.params.id
      );
      res.json({
        success: true,
        message: "Appointment fetched successfully",

        data: result,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  updateStatus: async (req: Request, res: Response) => {
    try {
      const { status } = req.body;
      const result = await doctorAppointmentService.updateStatus(
        req.params.id,
        status
      );
      res.json({
        success: true,
        message: "Status updated successfully",
        data: result,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  delete: async (req: Request, res: Response) => {
    try {
      await doctorAppointmentService.deleteAppointment(req.params.id);
      res.json({
        success: true,
        message: "Appointment deleted",
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  },
};
