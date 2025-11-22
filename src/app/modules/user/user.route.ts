import { Router } from "express";

import { createUploader } from "../../utils/cloudinary";
import { user_controllers } from "./user.controller";


const uploadCertificate = createUploader("userCertificates");

const clinicCertificate = createUploader("clinicCertificates");

const router = Router();

// CREATE paitent
router.post(
  "/create-paient",
  user_controllers.createPatient
);
router.post(
  "/create-solo-nurse",
  uploadCertificate.single("uploadCertificates"),
  user_controllers.createSoloNurse
);
router.post(
  "/create-clinic",
  clinicCertificate.single("uploadCertificates"),
  user_controllers.createClinic
);



export const user_routes = router;
