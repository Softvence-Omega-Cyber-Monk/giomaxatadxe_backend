import express from "express";
import auth from "../../middlewares/auth";
import { DashboardController } from "./admin.controller";


const router = express.Router();

router.get(
  "/overview",
  auth('admin'),
  DashboardController.getDashboardOverview
);

export const AdminRoutes = router;
