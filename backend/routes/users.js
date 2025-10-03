import { Router } from "express";
import authenticateToken from "../middleware/auth.js";
import route from "../controller/authController.js";
import profileValidation from "./auth.js";

const userRouter = Router();

// protected routes
userRouter.get("/profile", authenticateToken, route.getProfile);

// uppdate profile
userRouter.put(
  "/profile",
  authenticateToken,
  profileValidation.updateProfileValidation,
  route.updateProfile,
);

export default userRouter;
