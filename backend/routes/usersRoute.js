import { Router } from "express";
import { deleteAllUsers, getAllUsers } from "../controller/userController.js";

const router = Router();

// users route
router.get("/", getAllUsers);
router.delete("/:id", deleteAllUsers);

export default router;
