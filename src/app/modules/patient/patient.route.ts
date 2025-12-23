import { Router } from "express";
import { patientController } from "./patient.controller";
import { createUploader } from "../../utils/cloudinary";

const router = Router();

const patientProfileImage = createUploader("patientProfileImage");

router.get("/getAll", patientController.getAllPatients);
router.get("/getSinglePatient/:userId", patientController.getPatientById);
router.put(
  "/update-basic/:userId",
  patientProfileImage.single("profileImage"),
  patientController.updatePatientBasic
);
router.patch(
  "/createOrUpdateAddress/:userId",
  patientController.createOrUpdateAddress
);
router.patch(
  "/setDefaultAddress/:patientId/:addressId",
  patientController.setDefaultAddressController
);

// Delete address
router.delete(
  "/deleteAddress/:patientId/:addressId",
  patientController.deleteAddressController
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

router.delete("/deletePatient/:patientId", patientController.deletePatient);

export const patientRoutes = router;
