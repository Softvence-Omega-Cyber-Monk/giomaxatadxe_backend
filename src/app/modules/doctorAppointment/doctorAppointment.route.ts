import express from "express";
import { doctorAppointmentController } from "./doctorAppointment.controller";

const router = express.Router();

router.post("/create", doctorAppointmentController.create);
router.get("/getAll", doctorAppointmentController.getAll);
router.get("/getSingle/:id", doctorAppointmentController.getOne);

router.patch("/update-status/:id", doctorAppointmentController.updateStatus);
router.delete("/delete/:id", doctorAppointmentController.delete);

export const DoctorAppointmentRoutes = router;
