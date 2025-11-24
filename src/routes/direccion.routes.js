import { Router } from "express";
import { getDireccionById, getDirecciones, createDireccion, deleteDireccion, updateDireccion } 
from "../controllers/direccion.controllers.js";


const router = Router();
router.post("/direccion", createDireccion);
router.get("/direccion", getDirecciones);
router.get("/direccion/:id", getDireccionById);
router.put("/direccion/:id", updateDireccion);
router.delete("/direccion/:id", deleteDireccion);

export default router;
