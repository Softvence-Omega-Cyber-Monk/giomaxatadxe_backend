import express from "express";
import auth from "../../middlewares/auth";
import { DashboardController } from "./admin.controller";
import { createUploader } from "../../utils/cloudinary";

const router = express.Router();

const patientProfileImage = createUploader("adminProfileImage");

router.get(
  "/overview",
  auth("admin"),
  DashboardController.getDashboardOverview
);

router.post("/update/:adminId", auth("admin"),  patientProfileImage.single("profileImage"), DashboardController.udpateAdmin);

export const AdminRoutes = router;
