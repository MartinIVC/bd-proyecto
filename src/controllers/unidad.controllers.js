import oracledb from "oracledb";
import { getConnection } from "../database/connection.js";

// GET todas las unidades
export const getUnidades = async (req, res) => {
  try {
    const conn = await getConnection();

    const result = await conn.execute(
      `
      BEGIN
        SP_GET_UNIDAD(:P_CURSOR); 
      END;
      `,
      {
        P_CURSOR: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR },
      }
    );

    const resultSet = result.outBinds.P_CURSOR;
    const unidades = [];

    let row;
    while ((row = await resultSet.getRow())) {
      unidades.push(row);
    }

    await resultSet.close();

    res.json(unidades);
  } catch (error) {
    console.error("Error Oracle:", error);
    res.status(500).json({
      message: "Error al obtener las unidades",
      detalle: error.message,
    });
  }
};

// GET unidad por ID
export const getUnidadById = async (req, res) => {
  const { id } = req.params;

  try {
    const conn = await getConnection();

    const result = await conn.execute(
      `
      BEGIN
        SP_GET_UNIDAD_BY_ID(
          :P_ID_UNIDAD,
          :P_CURSOR
        );
      END;
      `,
      {
        P_ID_UNIDAD: id,
        P_CURSOR: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR },
      }
    );

    const cursor = result.outBinds.P_CURSOR;
    const row = await cursor.getRow(); // Solo una unidad esperada
    await cursor.close();

    if (!row) {
      return res.status(404).json({ message: "Unidad no encontrada" });
    }

    res.json(row);
  } catch (error) {
    console.error("Error al obtener unidad por id:", error);
    res
      .status(500)
      .json({ message: "Error al obtener unidad por id", detalle: error.message });
  }
};

// CREATE unidad
export const createUnidad = async (req, res) => {
  try {
    const { nombre_unidad } = req.body;

    if (!nombre_unidad) {
      return res.status(400).json({
        message: "El campo nombre_unidad es obligatorio",
      });
    }

    const conn = await getConnection();

    const result = await conn.execute(
      `
      BEGIN
        SP_INSERT_UNIDAD(
          :P_NOMBRE_UNIDAD,
          :P_ID
        );
      END;
      `,
      {
        P_NOMBRE_UNIDAD: nombre_unidad,
        P_ID: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
      },
      { autoCommit: true }
    );

    const idNuevo = result.outBinds.P_ID;

    res.status(201).json({
      message: "Unidad creada correctamente",
      id: idNuevo,
    });
  } catch (error) {
    console.error("Error Oracle:", error);
    res.status(500).json({
      message: "Error al crear la unidad",
      detalle: error.message,
    });
  }
};

// UPDATE unidad
export const updateUnidad = async (req, res) => {
  try {
    const idUnidad = req.params.id;
    const { nombre_unidad } = req.body;

    if (!nombre_unidad) {
      return res.status(400).json({
        message: "El campo nombre_unidad es obligatorio",
      });
    }

    const conn = await getConnection();

    await conn.execute(
      `
      BEGIN
        SP_UPDATE_UNIDAD(
          :P_ID_UNIDAD,
          :P_NOMBRE_UNIDAD
        );
      END;
      `,
      {
        P_ID_UNIDAD: idUnidad,
        P_NOMBRE_UNIDAD: nombre_unidad,
      },
      { autoCommit: true }
    );

    res.json({
      message: "Unidad actualizada correctamente",
    });
  } catch (error) {
    console.error("Error Oracle:", error);
    res.status(500).json({
      message: "Error al actualizar unidad",
      detalle: error.message,
    });
  }
};

// DELETE unidad
export const deleteUnidad = async (req, res) => {
  try {
    const idUnidad = req.params.id;

    const conn = await getConnection();

    await conn.execute(
      `
      BEGIN
        SP_DELETE_UNIDAD(:P_ID_UNIDAD);
      END;
      `,
      {
        P_ID_UNIDAD: idUnidad,
      },
      { autoCommit: true }
    );

    res.json({
      message: "Unidad eliminada correctamente",
    });
  } catch (error) {
    console.error("Error Oracle:", error);

    // ORA-02292: integridad referencial (tabla hija con registros asociados)
    if (error.errorNum === 2292) {
      return res.status(409).json({
        message:
          "No se puede eliminar la unidad porque tiene registros asociados",
        detalle: error.message,
      });
    }

    res.status(500).json({
      message: "Error al eliminar la unidad",
      detalle: error.message,
    });
  }
};
