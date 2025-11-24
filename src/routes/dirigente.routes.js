import { Router } from "express";
import { getDirigenteById, getDirigentes,createDirigente, deleteDirigente, updateDirigente } 
from "../controllers/dirigente.controllers.js";


const router = Router();

router.get("/dirigente", getDirigentes);
router.get("/dirigente/:id", getDirigenteById);
router.post("/dirigente", createDirigente);
router.put("/dirigente/:id", updateDirigente);
router.delete("/dirigente/:id", deleteDirigente);

export default router;