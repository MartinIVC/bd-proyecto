import { Router } from "express";
import { getAsistencia, 
    getAsistenciaById, 
    createAsistencia, 
    updateAsistencia, 
    deleteAsistencia } 
from "../controllers/asistencia.controllers.js";

const router = Router();

router.get("/asistencia/:id", getAsistenciaById);
router.get("/asistencia", getAsistencia);
router.post("/asistencia", createAsistencia);
router.put("/asistencia/:id", updateAsistencia);
router.delete("/asistencia/:id", deleteAsistencia);

export default router;