import express from "express";
import authenticateToken from "../middleware/auth.js";
import authorizeRole from "../middleware/authorization.js";
import applicationController from "../controller/applicationController";

const applicationRouter = express.Router();

applicationRouter.get(
  "/my-applications",
  authenticateToken,
  authorizeRole,
  applicationController.getMyApplication,
);

export default applicationRouter;
