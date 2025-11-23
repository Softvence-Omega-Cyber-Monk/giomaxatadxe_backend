import { Router } from "express";
import { SoloNurseController } from "./soloNurse.controller";
import { createUploader } from "../../utils/cloudinary";

const nurseCertificate = createUploader("nurseCertificates");

const router = Router();

router.get("/getAll", SoloNurseController.getAllSoloNurses);
router.get("/getSingle/:userId", SoloNurseController.getSoloNurseById);
router.put("/update-basic/:userId", SoloNurseController.updateSoloNurseBasic);
router.put(
  "/update-professional/:userId",
  SoloNurseController.professionalUpdate
);
router.put(
  "/upload-certificate/:userId",
  nurseCertificate.single("uploadCertificates"),
  SoloNurseController.uploadCertificate
);

router.delete("/:id", SoloNurseController.deleteSoloNurse);

export const SoloNurseRoutes = router;
