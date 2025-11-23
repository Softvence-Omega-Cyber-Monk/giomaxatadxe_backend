import { Router } from "express";
import { patientController } from "./patient.controller";

const router = Router();

router.get("/getAll", patientController.getAllPatients);
router.get("/getSinglePatient/:userId", patientController.getPatientById);
router.put("/update-basic/:userId", patientController.updatePatientBasic);
router.patch("/createOrUpdateAddress/:userId", patientController.createOrUpdateAddress);

router.delete("/deletePatient/:id", patientController.deletePatient);

export const patientRoutes = router;
