import { Router } from "express";
import { getActividadById, createActividad, updateActividad, deleteActividad, getActividad } from "../controllers/actividad.controllers.js";


const router = Router();

router.get("/actividad/:id", getActividadById);
router.get("/actividad", getActividad);
router.post("/actividad", createActividad);
router.put("/actividad/:id", updateActividad);
router.delete("/actividad/:id", deleteActividad);

export default router;