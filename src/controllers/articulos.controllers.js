import oracledb from "oracledb";
import { getConnection } from "../database/connection.js";

export const createArticulo = async (req, res) => {
  try {
    const { nombre_articulo, cantidad_articulo } = req.body;

    if (!nombre_articulo || cantidad_articulo == null) {
      return res.status(400).json({ message: "Datos insuficientes" });
    }

    const conn = await getConnection();

    const result = await conn.execute(
      `
      BEGIN
        SP_INSERT_ARTICULO(
          :P_NOMBRE_ARTICULO,
          :P_CANTIDAD_ARTICULO,
          :P_ID
        );
      END;
      `,
      {
        P_NOMBRE_ARTICULO: nombre_articulo,
        P_CANTIDAD_ARTICULO: cantidad_articulo,
        P_ID: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
      },
      { autoCommit: true }
    );

    res.status(201).json({
      message: "Artículo creado correctamente",
      id: result.outBinds.P_ID
    });

  } catch (error) {
    console.error("Error Oracle:", error);
    res.status(500).json({ message: "Error al crear artículo", detalle: error.message });
  }
};


export const getArticulos = async (req, res) => {
  try {
    const conn = await getConnection();

    const result = await conn.execute(
      `
      BEGIN
        SP_GET_ARTICULO(:P_CURSOR);
      END;
      `,
      { P_CURSOR: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR } }
    );

    const cursor = result.outBinds.P_CURSOR;
    const articulos = [];
    let row;

    while ((row = await cursor.getRow())) {
      articulos.push(row);
    }

    await cursor.close();

    res.json(articulos);

  } catch (error) {
    console.error("Error Oracle:", error);
    res.status(500).json({ message: "Error al obtener artículos", detalle: error.message });
  }
};


export const getArticuloById = async (req, res) => {
  try {
    const id = req.params.id;

    const conn = await getConnection();

    const result = await conn.execute(
      `
      BEGIN
        SP_GET_ARTICULO_BY_ID(:P_ID_ARTICULO, :P_CURSOR);
      END;
      `,
      {
        P_ID_ARTICULO: id,
        P_CURSOR: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR }
      }
    );

    const cursor = result.outBinds.P_CURSOR;
    const row = await cursor.getRow();
    await cursor.close();

    if (!row) {
      return res.status(404).json({ message: "Artículo no encontrado" });
    }

    res.json(row);

  } catch (error) {
    console.error("Error Oracle:", error);
    res.status(500).json({ message: "Error al obtener artículo por id", detalle: error.message });
  }
};


export const updateArticulo = async (req, res) => {
  try {
    const id = req.params.id;
    const { nombre_articulo, cantidad_articulo } = req.body;

    if (!nombre_articulo || cantidad_articulo == null) {
      return res.status(400).json({ message: "Datos insuficientes" });
    }

    const conn = await getConnection();

    await conn.execute(
      `
      BEGIN
        SP_UPDATE_ARTICULO(
          :P_ID_ARTICULO,
          :P_NOMBRE_ARTICULO,
          :P_CANTIDAD_ARTICULO
        );
      END;
      `,
      {
        P_ID_ARTICULO: id,
        P_NOMBRE_ARTICULO: nombre_articulo,
        P_CANTIDAD_ARTICULO: cantidad_articulo
      },
      { autoCommit: true }
    );

    res.json({ message: "Artículo actualizado correctamente" });

  } catch (error) {
    console.error("Error Oracle:", error);
    res.status(500).json({ message: "Error al actualizar artículo", detalle: error.message });
  }
};


export const deleteArticulo = async (req, res) => {
  try {
    const id = req.params.id;

    const conn = await getConnection();

    await conn.execute(
      `
      BEGIN
        SP_DELETE_ARTICULO(:P_ID_ARTICULO);
      END;
      `,
      { P_ID_ARTICULO: id },
      { autoCommit: true }
    );

    res.json({ message: "Artículo eliminado correctamente" });

  } catch (error) {
    console.error("Error Oracle:", error);

    if (error.errorNum === 2292) {
      return res.status(409).json({
        message: "No se puede eliminar porque existen registros asociados",
        detalle: error.message
      });
    }

    res.status(500).json({ message: "Error al eliminar artículo", detalle: error.message });
  }
};
