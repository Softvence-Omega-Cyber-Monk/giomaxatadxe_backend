import { Router } from "express";
import { patientController } from "./patient.controller";

const router = Router();

router.get("/getAll", patientController.getAllPatients);
router.get("/getSinglePatient/:userId", patientController.getPatientById);
router.put("/update-basic/:userId", patientController.updatePatientBasic);
router.patch(
  "/createOrUpdateAddress/:userId",
  patientController.createOrUpdateAddress
);
router.post(
  "/medical-history/:userId",
  patientController.addMedicalHistoryService
);
router.put(
  "/update/medical-history/:userId",
  patientController.updateMedicalHistoryService
);
router.delete(
  "/delete/medical-history/:userId",
  patientController.deleteMedicalHistoryService
);

router.put(
  "/addNewPaymentMethod/:userId",
  patientController.addNewPaymentMethod
);

router.delete("/deletePatient/:id", patientController.deletePatient);

export const patientRoutes = router;
