import express from "express";
import { body, query } from "express-validator";
import authorizeRoles from "../middleware/authorization.js";
import authenticateToken from "../middleware/auth.js";

const serviceRouter = express.Router();

const createServiceValidation = [
  body("title")
    .trim()
    .isLength({ min: 10, max: 100 })
    .withMessage("Title must be between 10 and 100 characters"),
  body("description")
    .trim()
    .isLength({ min: 50, max: 2000 })
    .withMessage("Descriptioin must be between 50 and 2000 characters"),
  body("category")
    .trim()
    .withMessage("Invalid category")
    .isIn([
      "web development",
      "mobile development",
      "graphic design",
      "content writing",
      "digital marketing",
      "video editing",
      "consulting",
      "legal",
      "accounting",
      "tutoring",
      "other",
    ]),
  body("pricing.amount")
    .trim()
    .isFloat({ min: 0 })
    .withMessage("Amount must be a positive nummber"),
  body("pricing.type")
    .isIn(["fixed", "hourly", "negotiable"])
    .withMessage("Pricing must be fixed, hourly or negotiable"),
  body("location.type")
    .optional()
    .isIn(["remote", "onsite", "hybrid"])
    .withMessage("Location must be remote, onsite or hybrid"),
  body("duration").trim().notEmpty().withMessage("Duration is required"),
];
const updateServiceValidation = [
  body("title")
    .optional()
    .trim()
    .isLength({ min: 10, max: 100 })
    .withMessage("Title must be between 10 and 100 characters"),
  body("description")
    .optional()
    .trim()
    .isLength({ min: 50, max: 2000 })
    .withMessage("Description must be 50 and 2000 characters"),
  body("status")
    .isIn(["active", "paused", "completed", "cancelled"])
    .optional()
    .withMessage("Invalid status"),
];

const applyToService = [
  body("message")
    .isLength({ min: 20, max: 1000 })
    .trim()
    .withMessage("Application message must be between 20 and 1000 characters"),
  body("proposedTimeline")
    .optional()
    .notEmpty()
    .optional()
    .withMessage("Proposed timeline can not be empty"),
  body("proposedPrice")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Proposed price must be a postive number"),
];
