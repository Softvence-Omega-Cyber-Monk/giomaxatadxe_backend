import { Router } from "express";
import { DoctorController } from "./doctor.controller";

const router = Router();

router.post("/create-doctor", DoctorController.createDoctor);
router.get("/getAll", DoctorController.getDoctors);
router.get("/getSingle/:id", DoctorController.getDoctorById);
router.put("/update/doctor/:id", DoctorController.updateDoctor);
router.delete("/delete-doctor/:id", DoctorController.deleteDoctor);

export const DoctorRoutes = router;
