import { Router } from "express";
import { ClinicController } from "./clinic.controller";

const router = Router();

router.get("/", ClinicController.getAllClinics);
router.get("/:id", ClinicController.getClinicById);
router.put("/:id", ClinicController.updateClinic);
router.delete("/:id", ClinicController.deleteClinic);

export const ClinicRoutes = router;

