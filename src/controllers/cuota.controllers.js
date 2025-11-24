import oracledb from "oracledb";
import { getConnection } from "../database/connection.js";

// CREATE
export const createCuota = async (req, res) => {
  try {
    const { id_actividad, cantidad_cuota, fecha_limite } = req.body;

    if (id_actividad == null || cantidad_cuota == null || !fecha_limite) {
      return res.status(400).json({ message: "Datos insuficientes" });
    }

    const conn = await getConnection();

    const result = await conn.execute(
      `
      BEGIN
        SP_INSERT_CUOTA(
          :P_ID_ACTIVIDAD,
          :P_CANTIDAD_CUOTA,
          :P_FECHA_LIMITE,
          :P_ID
        );
      END;
      `,
      {
        P_ID_ACTIVIDAD: id_actividad,
        P_CANTIDAD_CUOTA: cantidad_cuota,
        // Si estás enviando fecha como string 'YYYY-MM-DD', Oracle suele convertirla;
        // si no, puedes usar new Date(fecha_limite)
        P_FECHA_LIMITE: fecha_limite,
        P_ID: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
      },
      { autoCommit: true }
    );

    res.status(201).json({
      message: "Cuota creada correctamente",
      id_cuota: result.outBinds.P_ID
    });

  } catch (error) {
    console.error("Error Oracle (createCuota):", error);
    res.status(500).json({
      message: "Error al crear cuota",
      detalle: error.message
    });
  }
};

// GET ALL
export const getCuotas = async (req, res) => {
  try {
    const conn = await getConnection();

    const result = await conn.execute(
      `
      BEGIN
        SP_GET_CUOTA(:P_CURSOR);
      END;
      `,
      {
        P_CURSOR: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR }
      }
    );

    const cursor = result.outBinds.P_CURSOR;
    const cuotas = [];
    let row;

    while ((row = await cursor.getRow())) {
      cuotas.push(row);
    }

    await cursor.close();

    res.json(cuotas);

  } catch (error) {
    console.error("Error Oracle (getCuotas):", error);
    res.status(500).json({
      message: "Error al obtener cuotas",
      detalle: error.message
    });
  }
};

// GET BY ID
export const getCuotaById = async (req, res) => {
  try {
    const id = req.params.id;

    const conn = await getConnection();

    const result = await conn.execute(
      `
      BEGIN
        SP_GET_CUOTA_BY_ID(:P_ID_CUOTA, :P_CURSOR);
      END;
      `,
      {
        P_ID_CUOTA: id,
        P_CURSOR: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR }
      }
    );

    const cursor = result.outBinds.P_CURSOR;
    const row = await cursor.getRow();
    await cursor.close();

    if (!row) {
      return res.status(404).json({ message: "Cuota no encontrada" });
    }

    res.json(row);

  } catch (error) {
    console.error("Error Oracle (getCuotaById):", error);
    res.status(500).json({
      message: "Error al obtener cuota por ID",
      detalle: error.message
    });
  }
};

// UPDATE
export const updateCuota = async (req, res) => {
  try {
    const id = req.params.id;
    const { cantidad_cuota, fecha_limite } = req.body;

    if (cantidad_cuota == null || !fecha_limite) {
      return res.status(400).json({ message: "Datos insuficientes" });
    }

    const conn = await getConnection();

    await conn.execute(
      `
      BEGIN
        SP_UPDATE_CUOTA(
          :P_ID_CUOTA,
          :P_CANTIDAD_CUOTA,
          :P_FECHA_LIMITE
        );
      END;
      `,
      {
        P_ID_CUOTA: id,
        P_CANTIDAD_CUOTA: cantidad_cuota,
        P_FECHA_LIMITE: fecha_limite
      },
      { autoCommit: true }
    );

    res.json({ message: "Cuota actualizada correctamente" });

  } catch (error) {
    console.error("Error Oracle (updateCuota):", error);
    res.status(500).json({
      message: "Error al actualizar cuota",
      detalle: error.message
    });
  }
};

// DELETE
export const deleteCuota = async (req, res) => {
  try {
    const id = req.params.id;

    const conn = await getConnection();

    await conn.execute(
      `
      BEGIN
        SP_DELETE_CUOTA(:P_ID_CUOTA);
      END;
      `,
      {
        P_ID_CUOTA: id
      },
      { autoCommit: true }
    );

    res.json({ message: "Cuota eliminada correctamente" });

  } catch (error) {
    console.error("Error Oracle (deleteCuota):", error);

    // Ejemplo manejo de FK como lo haces en asistencia
    if (error.errorNum === 2292) {
      return res.status(409).json({
        message: "No se puede eliminar porque existen registros asociados",
        detalle: error.message
      });
    }

    res.status(500).json({
      message: "Error al eliminar cuota",
      detalle: error.message
    });
  }
};
