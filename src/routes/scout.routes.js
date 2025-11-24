import { Router } from "express";
import { getScouts, getScoutById, createScout, deleteScout, updateScout } from '../controllers/scout.controllers.js'

const router = Router();

router.get("/scout", getScouts);
router.get("/scout/:id", getScoutById);
router.post("/scout", createScout);
router.put("/scout/:id", updateScout);
router.delete("/scout/:id", deleteScout);

export default router;