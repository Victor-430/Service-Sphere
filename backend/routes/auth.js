import express from "express";
import { body } from "express-validator";
import authenticateToken from "../middleware/auth.js";
import authController from "../controller/authController.js";

const authRouter = express.Router();

//validation rules
const registerValidation = [
  body("firstName")
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("First name must be between 2 and 50 characters"),
  body("lastName")
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Last name must be between 2 and 50 characters"),
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage(
      "Password must contain at least one lowercase, one uppercase, and one number",
    ),
  body("role")
    .optional()
    .isIn(["experts", "client"])
    .withMessage("Invalid role"),
  body("phone")
    .optional()
    .isMobilePhone()
    .withMessage("Please provide a valid phone number"),
];

const loginValidation = [
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email"),
  body("password").notEmpty().withMessage("Password is required"),
];

const changePasswordValidation = [
  body("currentPassword")
    .notEmpty()
    .withMessage("Current paassword is required"),
  body("newPassword")
    .isLength({ min: 6 })
    .withMessage("New password must be at least 6 characters")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage(
      "New password must contain at least one lowercase, one upercase, and one number",
    ),
];

const updateProfileValidation = [
  body("firstName")
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("First name must be between 2 and 50 characters"),
  body("lastName")
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Last name must be between 2 and 50 characters"),
  body("email")
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email"),
  body("phone")
    .optional()
    .isMobilePhone()
    .withMessage("Please provide a valid phone number"),
  body("bio")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Bio cannot not exceed 500 characters"),
];

const forgotPasswordValidation = [
  body("email")
    .normalizeEmail()
    .isEmail()
    .withMessage("Please provide a valid email"),
];

const resetPasswordValidation = [
  body("newPassword")
    .isLength({ min: 6 })
    .withMessage("password must be at least 6 characters"),
];

// public route
authRouter.post("/register", registerValidation, authController.register);
authRouter.post("/login", loginValidation, authController.login);
authRouter.post(
  "/forgot-password",
  forgotPasswordValidation,
  authController.forgotPassword,
);
authRouter.post(
  "/reset-password",
  resetPasswordValidation,
  authController.resetPassword,
);

// protected route, authetication required
authRouter.put(
  "/change-password",
  authenticateToken,
  changePasswordValidation,
  authController.changePassword,
);

authRouter.post("/logout", authenticateToken, authController.logout);

export default { authRouter, updateProfileValidation };
