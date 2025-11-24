import oracledb from "oracledb";
import { getConnection } from "../database/connection.js";


export const createPatrulla = async (req, res) => {
  try {
    const { id_unidad, nombre_patrulla } = req.body;

    if (!id_unidad || !nombre_patrulla) {
      return res.status(400).json({ message: "Datos insuficientes" });
    }

    const conn = await getConnection();

    const result = await conn.execute(
      `
      BEGIN
        SP_INSERT_PATRULLA(
          :P_ID_UNIDAD,
          :P_NOMBRE_PATRULLA,
          :P_ID
        );
      END;
      `,
      {
        P_ID_UNIDAD: id_unidad,
        P_NOMBRE_PATRULLA: nombre_patrulla,
        P_ID: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
      },
      { autoCommit: true }
    );

    res.status(201).json({
      message: "Patrulla creada correctamente",
      id: result.outBinds.P_ID
    });

  } catch (error) {
    console.error("Error Oracle:", error);
    res.status(500).json({ message: "Error al crear patrulla", detalle: error.message });
  }
};


export const getPatrullas = async (req, res) => {
  try {
    const conn = await getConnection();

    const result = await conn.execute(
      `
      BEGIN
        SP_GET_PATRULLA(:P_CURSOR);
      END;
      `,
      { P_CURSOR: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR } }
    );

    const cursor = result.outBinds.P_CURSOR;
    const pat = [];
    let row;

    while ((row = await cursor.getRow())) {
      pat.push(row);
    }

    await cursor.close();

    res.json(pat);

  } catch (error) {
    console.error("Error Oracle:", error);
    res.status(500).json({ message: "Error al obtener patrullas", detalle: error.message });
  }
};


export const getPatrullaById = async (req, res) => {
  try {
    const id = req.params.id;
    const conn = await getConnection();

    const result = await conn.execute(
      `
      BEGIN
        SP_GET_PATRULLA_BY_ID(:P_ID_PATRULLA, :P_CURSOR);
      END;
      `,
      {
        P_ID_PATRULLA: id,
        P_CURSOR: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR }
      }
    );

    const cursor = result.outBinds.P_CURSOR;
    const row = await cursor.getRow();
    await cursor.close();

    if (!row) {
      return res.status(404).json({ message: "Patrulla no encontrada" });
    }

    res.json(row);

  } catch (error) {
    console.error("Error Oracle:", error);
    res.status(500).json({ message: "Error al obtener patrulla por id", detalle: error.message });
  }
};


export const updatePatrulla = async (req, res) => {
  try {
    const id = req.params.id;
    const { id_unidad, nombre_patrulla } = req.body;

    if (!id_unidad || !nombre_patrulla) {
      return res.status(400).json({ message: "Datos insuficientes" });
    }

    const conn = await getConnection();

    await conn.execute(
      `
      BEGIN
        SP_UPDATE_PATRULLA(
          :P_ID_PATRULLA,
          :P_ID_UNIDAD,
          :P_NOMBRE_PATRULLA
        );
      END;
      `,
      {
        P_ID_PATRULLA: id,
        P_ID_UNIDAD: id_unidad,
        P_NOMBRE_PATRULLA: nombre_patrulla
      },
      { autoCommit: true }
    );

    res.json({ message: "Patrulla actualizada correctamente" });

  } catch (error) {
    console.error("Error Oracle:", error);
    res.status(500).json({ message: "Error al actualizar patrulla", detalle: error.message });
  }
};


export const deletePatrulla = async (req, res) => {
  try {
    const id = req.params.id;
    const conn = await getConnection();

    await conn.execute(
      `
      BEGIN
        SP_DELETE_PATRULLA(:P_ID_PATRULLA);
      END;
      `,
      { P_ID_PATRULLA: id },
      { autoCommit: true }
    );

    res.json({ message: "Patrulla eliminada correctamente" });

  } catch (error) {
    console.error("Error Oracle:", error);

    if (error.errorNum === 2292) {
      return res.status(409).json({
        message: "No se puede eliminar la patrulla porque tiene registros asociados",
        detalle: error.message
      });
    }

    res.status(500).json({ message: "Error al eliminar patrulla", detalle: error.message });
  }
};