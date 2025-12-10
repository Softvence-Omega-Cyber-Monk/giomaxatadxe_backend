import { Request, Response } from "express";
import { soloNurseAppointmentService } from "./soloNurseAppoinment.service";

export const soloNurseAppointmentController = {
  create: async (req: Request, res: Response) => {
    try {
      const appointment = await soloNurseAppointmentService.createAppointment(
        req.body
      );
      res.status(201).json({
        success: true,
        message: "Appointment created successfully",
        data: appointment,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  Reschedule: async (req: Request, res: Response) => {
    try {
      const result = await soloNurseAppointmentService.Reschedule(req.body);
      res.status(201).json({
        success: true,
        message: "Appointment reschedule successfully",
        data: result,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  getAll: async (_req: Request, res: Response) => {
    try {
      const appointments =
        await soloNurseAppointmentService.getAllAppointments();
      res.status(200).json({
        success: true,
        message: "Appointments fetched successfully",
        data: appointments,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  getById: async (req: Request, res: Response) => {
    try {
      const appointment = await soloNurseAppointmentService.getAppointmentById(
        req.params.id
      );
      if (!appointment)
        return res
          .status(404)
          .json({ success: false, message: "Appointment not found" });
      res.status(200).json({
        success: true,
        message: "Appointment fetched successfully",
        data: appointment,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  update: async (req: Request, res: Response) => {
    try {
      const updatedAppointment =
        await soloNurseAppointmentService.updateAppointment(
          req.params.id,
          req.body
        );
      if (!updatedAppointment)
        return res
          .status(404)
          .json({ success: false, message: "Appointment not found" });
      res.status(200).json({
        success: true,
        message: "Appointment updated successfully",
        data: updatedAppointment,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  },
  getSelectedDateAndTime: async (req: Request, res: Response) => {
    try {
      const result = await soloNurseAppointmentService.getSelectedDateAndTime(
        req.params.id
      );
      res.json({
        success: true,
        message: "get time and date successfully",
        data: result,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  },
};
