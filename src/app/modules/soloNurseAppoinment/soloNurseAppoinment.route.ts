import { Router } from "express";
import { soloNurseAppointmentController } from "./soloNurseAppoinment.controller";

const router = Router();

router.post("/create", soloNurseAppointmentController.create);
router.post("/reschedule", soloNurseAppointmentController.Reschedule);
router.get("/getAll", soloNurseAppointmentController.getAll);
router.get("/getSingle/:id", soloNurseAppointmentController.getById);
router.put("/update/:id", soloNurseAppointmentController.update);
router.get(
  "/getSelectedDateAndTime/:id",
  soloNurseAppointmentController.getSelectedDateAndTime
);
router.get(
  "/getAppoinmentTimeBasedOnDate/:id",
  soloNurseAppointmentController.getAppoinmentTimeBasedOnDate
);
router.get(
  "/getSinglePaintentAppointmentForNurse/:patientId",
  soloNurseAppointmentController.getSinglePaintentAppointmentForNurse
);
router.get(
  "/getSingleNurseAppointment/:soloNurseId",
  soloNurseAppointmentController.getSingleNurseAppointment
);



export const soloNurseAppoinmentRoutes = router;
