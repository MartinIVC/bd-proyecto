import { Router } from "express";
import { getTipoUsuarioById, getTiposUsuarios} from '../controllers/tipoUsuario.controllers.js'


const router = Router();

router.get("/tipoUsuario", getTiposUsuarios);

router.get("/tipoUsuario/:id", getTipoUsuarioById);

export default router;