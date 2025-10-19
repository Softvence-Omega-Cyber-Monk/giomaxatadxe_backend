import { Router } from "express";
import RequestValidator from "../../middlewares/request_validator";
import { notification_controller } from "./notification.controller";
import { notification_validations } from "./notification.validation";

const notification_router = Router();

notification_router.post(
  "/create",
  RequestValidator(notification_validations.create),
  notification_controller.create_new_notification
);

export default notification_router;
  