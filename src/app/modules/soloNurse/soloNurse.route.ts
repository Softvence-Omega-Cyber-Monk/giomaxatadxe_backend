import { Router } from "express";
import { SoloNurseController } from "./soloNurse.controller";

const router = Router();

router.get("/", SoloNurseController.getAllSoloNurses);
router.get("/:id", SoloNurseController.getSoloNurseById);
router.delete("/:id", SoloNurseController.deleteSoloNurse);

export const SoloNurseRoutes = router;
