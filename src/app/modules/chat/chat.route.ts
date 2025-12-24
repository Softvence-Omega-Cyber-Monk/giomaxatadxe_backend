import { Router } from "express";
import { chatController } from "./chat.controller";
import auth from "../../middlewares/auth";

const router = Router();

router.get(
  "/getChat/:id",
  auth("patient", "doctor", "solo_nurse", "clinic", "admin"),
  chatController.getConversation
);
router.get(
  "/admin/history",
  auth("patient", "doctor", "solo_nurse", "clinic", "admin"),
  chatController.getAdminConversation
);

export const ChatRoutes = router;
