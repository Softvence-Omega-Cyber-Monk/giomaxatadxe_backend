import { Router } from "express";
import { patientController } from "./patient.controller";

const router = Router();

router.get("/getAll", patientController.getAllPatients);
router.get("/getSinglePatient/:id", patientController.getPatientById);
router.patch("/updatePatient/:id", patientController.updatePatient);
router.delete("/deletePatient/:id", patientController.deletePatient);

export const patientRoutes = router;
