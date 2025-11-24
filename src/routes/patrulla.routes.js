import { Router } from "express";
import { getPatrullaById, getPatrullas, createPatrulla, deletePatrulla, updatePatrulla } 
from "../controllers/patrulla.controllers.js";


const router = Router();

router.get("/patrulla", getPatrullas);
router.get("/patrulla/:id", getPatrullaById);
router.post("/patrulla", createPatrulla);
router.put("/patrulla/:id", updatePatrulla);
router.delete("/patrulla/:id", deletePatrulla);

export default router;

