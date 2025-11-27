import { Router } from "express";
import { DoctorController } from "./doctor.controller";
import { createUploader } from "../../utils/cloudinary";

const doctorCertificate = createUploader("doctorCertificates");

const router = Router();

router.get("/getAll", DoctorController.getDoctors);
router.get("/getSingle/:userId", DoctorController.getDoctorById);
router.put("/update-basic/:userId", DoctorController.updateDoctorBasic);
router.put("/update-professional/:userId", DoctorController.professionalUpdate);

router.put(
  "/upload-certificate/:userId",
  doctorCertificate.single("uploadCertificates"),
  DoctorController.uploadCertificate
);

router.delete(
  "/delete-certificate/:userId/:certificateId",
  DoctorController.deleteCertificate
);

router.delete("/delete-doctor/:id", DoctorController.deleteDoctor);

export const DoctorRoutes = router;
