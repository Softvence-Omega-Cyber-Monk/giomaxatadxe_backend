import express from "express";
import { doctorAppointmentController } from "./doctorAppointment.controller";

const router = express.Router();

router.post("/create", doctorAppointmentController.create);
router.post("/reschedule", doctorAppointmentController.Reschedule);
router.get("/getAll/:doctorId", doctorAppointmentController.getAll);
router.get("/getSingle/:id", doctorAppointmentController.getOne);
router.get(
  "/getSinglePaintentAppointment/:patientId",
  doctorAppointmentController.getSinglePaintentAppointment
);
router.get(
  "/getSingleDoctorAppointment/:doctorId",
  doctorAppointmentController.getSingleDoctorAppointment
);

router.get(
  "/getSinglePaitentChats/:patientId",
  doctorAppointmentController.getSinglePaitentChats
);
router.get(
  "/getSingleDoctorChats/:doctorId",
  doctorAppointmentController.getSingleDoctorChats
);
router.get(
  "/getSingleClinicChats/:clinicId",
  doctorAppointmentController.getSinlgeClinicChats
);

router.patch("/update-status/:id", doctorAppointmentController.updateStatus);
router.get(
  "/getSelectedDateAndTime/:id",
  doctorAppointmentController.getSelectedDateAndTime
);
router.post(
  "/getAppoinmentTimeBasedOnDate/:id",
  doctorAppointmentController.getAppoinmentTimeBasedOnDate
);

router.delete("/delete/:id", doctorAppointmentController.delete);

export const DoctorAppointmentRoutes = router;
