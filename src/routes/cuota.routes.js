import { Router } from "express";

import { getCuotas, 
    getCuotaById, 
    createCuota, 
    updateCuota, 
    deleteCuota } 
from "../controllers/cuota.controllers.js";


const router = Router();

router.get("/cuota", getCuotas);
router.get("/cuota/:id", getCuotaById);
router.post("/cuota", createCuota);
router.put("/cuota/:id", updateCuota);
router.delete("/cuota/:id", deleteCuota);  

export default router;