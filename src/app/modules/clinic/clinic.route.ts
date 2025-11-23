import { Router } from "express";
import { ClinicController } from "./clinic.controller";
import { createUploader } from "../../utils/cloudinary";

const clinicCertificate = createUploader("clinicCertificates");

const router = Router();

router.get("/getAll", ClinicController.getAllClinics);
router.get("/getSingle/:userId", ClinicController.getClinicById);
router.put("/update-basic/:userId", ClinicController.updateClinicBasic);
router.put(
  "/upload-certificate/:userId",
  clinicCertificate.single("uploadCertificates"),
  ClinicController.uploadCertificate
);

router.delete(
  "/delete-certificate/:userId/:certificateId",
  ClinicController.deleteCertificate
);
router.put("/availability/:userId", ClinicController.availabilitySettings);
router.put(
  "/addNewPaymentMethod/:userId",
  ClinicController.addNewPaymentMethod
);
router.delete("/delete/:userId", ClinicController.deleteClinic);

export const ClinicRoutes = router;
