import { Router } from "express";
import authenticateToken from "../middleware/auth.js";
import route from "../controller/authController.js";
import profileValidation from "./auth.js";

const router = Router();

// protected routes
router.get("/profile", authenticateToken, route.getProfile);

// uppdate profile
router.put(
  "/profile",
  authenticateToken,
  profileValidation.updateProfileValidation,
  route.updateProfile,
);

export default router;
