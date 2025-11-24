import { Router } from "express";
import { getArticuloById, getArticulos, createArticulo, updateArticulo, deleteArticulo } from "../controllers/articulos.controllers.js";

const router = Router();
router.post("/articulo", createArticulo);
router.get("/articulo", getArticulos);
router.get("/articulo/:id", getArticuloById);
router.put("/articulo/:id", updateArticulo);
router.delete("/articulo/:id", deleteArticulo);

export default router;