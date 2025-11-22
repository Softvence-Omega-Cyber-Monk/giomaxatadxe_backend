import { Router } from "express";
import { SoloNurseController } from "./soloNurse.controller";

const router = Router();

router.get("/getAll", SoloNurseController.getAllSoloNurses);
router.get("/getSingle/:userId", SoloNurseController.getSoloNurseById);
router.delete("/:id", SoloNurseController.deleteSoloNurse);

export const SoloNurseRoutes = router;
