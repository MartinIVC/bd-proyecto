import { Router } from "express";
import { getPersonas, getPersonaById, createPersona, deletePersona, updatePersona} from '../controllers/persona.controllers.js'

const router = Router();

router.get("/persona", getPersonas);
router.get("/persona/:id", getPersonaById);
router.post("/persona", createPersona);
router.put("/persona/:id", updatePersona);
router.delete("/persona/:id", deletePersona);

export default router;