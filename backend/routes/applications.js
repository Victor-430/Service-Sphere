import express from "express";
import { body } from "express-validator";
import authenticateToken from "../middleware/auth.js";
import applicationController from "../controller/applicationController";
import authorizeRoles from "../middleware/authorization.js";

const applicationRouter = express.Router();

const expertValidation = [
  body("status")
    .isIn(["accepted", "rejected"])
    .withMessage("Status must be accepted or rejected"),
  body("expertResponse")
    .optional()
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage("Expert response must be 10 and 500 characters"),
];

// client routes
applicationRouter.get(
  "/my-applications",
  authenticateToken,
  authorizeRoles("client"),
  applicationController.getMyApplication,
);

// expert routes
applicationRouter.put(
  "/:id/status",
  authenticateToken,
  authorizeRoles("expert"),
  expertValidation,
  applicationController.updateAplicationStatus,
);

export default applicationRouter;
