import { Router } from "express";
import { ClinicController } from "./clinic.controller";
import { createUploader } from "../../utils/cloudinary";

const clinicCertificate = createUploader("clinicCertificates");
const clinicProfileImage = createUploader("clinicProfileImage");

const router = Router();

router.get("/getAll", ClinicController.getAllClinics);
router.get("/getSingle/:userId", ClinicController.getClinicById);
router.get("/getClinicDoctors/:clinicId", ClinicController.getClinicDoctors);
router.put("/update-basic/:userId", clinicProfileImage.single("profileImage"), ClinicController.updateClinicBasic);
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
