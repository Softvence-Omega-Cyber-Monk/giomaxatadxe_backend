import { Router } from "express";

import { createUploader } from "../../utils/cloudinary";
import { user_controllers } from "./user.controller";
import RequestValidator from "../../middlewares/request_validator";
import { user_validations } from "./user.validation";

const uploadCertificate = createUploader("userCertificates");

const router = Router();

// CREATE
router.post(
  "/create-user",
  uploadCertificate.single("cretificate"),
  RequestValidator(user_validations.create_user),
  user_controllers.createUser
);

// UPDATE
router.put(
  "/update-user/:id",
  uploadCertificate.single("cretificate"),
  user_controllers.updateUser
);

// GET ALL
router.get("/getAll", user_controllers.getAllUsers);

// GET SINGLE
router.get("/getSingle/:id", user_controllers.getUserById);

// DELETE
router.delete("/delete-user/:id", user_controllers.deleteUser);

export const user_routes = router;
