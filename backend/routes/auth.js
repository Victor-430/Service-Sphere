import express from "express";
import route from "../controller/authController.js";

const router = express.Router();

router.post("/register", route.register);

export default router;
