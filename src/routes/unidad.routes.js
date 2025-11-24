import { Router } from "express";
import { getUnidades, getUnidadById, createUnidad, updateUnidad, deleteUnidad } from "../controllers/unidad.controllers.js";

const router = Router();

router.get("/unidad", getUnidades);
router.get("/unidad/:id", getUnidadById);
router.post("/unidad", createUnidad);
router.put("/unidad/:id", updateUnidad);
router.delete("/unidad/:id", deleteUnidad);

export default router;