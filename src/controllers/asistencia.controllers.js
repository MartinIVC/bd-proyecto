import oracledb from "oracledb";
import { getConnection } from "../database/connection.js";

// CREATE
export const createAsistencia = async (req, res) => {
  try {
    const { fecha_asistencia, id_actividad } = req.body;

    if (!fecha_asistencia || id_actividad == null) {
      return res.status(400).json({ message: "Datos insuficientes" });
    }

    const conn = await getConnection();

    const result = await conn.execute(
      `
      BEGIN
        SP_INSERT_ASISTENCIA(
          :P_FECHA_ASISTENCIA,
          :P_ID_ACTIVIDAD,
          :P_ID
        );
      END;
      `,
      {
        P_FECHA_ASISTENCIA: fecha_asistencia,
        P_ID_ACTIVIDAD: id_actividad,
        P_ID: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
      },
      { autoCommit: true }
    );

    res.status(201).json({
      message: "Asistencia registrada correctamente",
      id: result.outBinds.P_ID
    });

  } catch (error) {
    console.error("Error Oracle:", error);
    res.status(500).json({
      message: "Error al crear asistencia",
      detalle: error.message
    });
  }
};

// GET ALL
export const getAsistencia = async (req, res) => {
  try {
    const conn = await getConnection();

    const result = await conn.execute(
      `
      BEGIN
        SP_GET_ASISTENCIA(:P_CURSOR);
      END;
      `,
      { P_CURSOR: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR } }
    );

    const cursor = result.outBinds.P_CURSOR;
    const asistencias = [];
    let row;

    while ((row = await cursor.getRow())) {
      asistencias.push(row);
    }

    await cursor.close();

    res.json(asistencias);

  } catch (error) {
    console.error("Error Oracle:", error);
    res.status(500).json({
      message: "Error al obtener asistencias",
      detalle: error.message
    });
  }
};

// GET BY ID
export const getAsistenciaById = async (req, res) => {
  try {
    const id = req.params.id;

    const conn = await getConnection();

    const result = await conn.execute(
      `
      BEGIN
        SP_GET_ASISTENCIA_BY_ID(:P_ID_ASISTENCIA, :P_CURSOR);
      END;
      `,
      {
        P_ID_ASISTENCIA: id,
        P_CURSOR: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR }
      }
    );

    const cursor = result.outBinds.P_CURSOR;
    const row = await cursor.getRow();
    await cursor.close();

    if (!row) {
      return res.status(404).json({ message: "Asistencia no encontrada" });
    }

    res.json(row);

  } catch (error) {
    console.error("Error Oracle:", error);
    res.status(500).json({
      message: "Error al obtener asistencia por ID",
      detalle: error.message
    });
  }
};

// UPDATE
export const updateAsistencia = async (req, res) => {
  try {
    const id = req.params.id;
    const { fecha_asistencia } = req.body;

    if (!fecha_asistencia) {
      return res.status(400).json({ message: "Datos insuficientes" });
    }

    const conn = await getConnection();

    await conn.execute(
      `
      BEGIN
        SP_UPDATE_ASISTENCIA(
          :P_ID_ASISTENCIA,
          :P_FECHA_ASISTENCIA
        );
      END;
      `,
      {
        P_ID_ASISTENCIA: id,
        P_FECHA_ASISTENCIA: fecha_asistencia
      },
      { autoCommit: true }
    );

    res.json({ message: "Asistencia actualizada correctamente" });

  } catch (error) {
    console.error("Error Oracle:", error);
    res.status(500).json({
      message: "Error al actualizar asistencia",
      detalle: error.message
    });
  }
};

// DELETE
export const deleteAsistencia = async (req, res) => {
  try {
    const id = req.params.id;

    const conn = await getConnection();

    await conn.execute(
      `
      BEGIN
        SP_DELETE_ASISTENCIA(:P_ID_ASISTENCIA);
      END;
      `,
      { P_ID_ASISTENCIA: id },
      { autoCommit: true }
    );

    res.json({ message: "Asistencia eliminada correctamente" });

  } catch (error) {
    console.error("Error Oracle:", error);

    if (error.errorNum === 2292) {
      return res.status(409).json({
        message: "No se puede eliminar porque existen registros asociados",
        detalle: error.message
      });
    }

    res.status(500).json({
      message: "Error al eliminar asistencia",
      detalle: error.message
    });
  }
};
