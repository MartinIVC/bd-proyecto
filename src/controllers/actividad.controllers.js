import oracledb from "oracledb";
import { getConnection } from "../database/connection.js";

export const getActividadById = async (req, res) => {
  try {
    const id = req.params.id;

    const conn = await getConnection();

    const result = await conn.execute(
      `
      BEGIN
        SP_GET_ACTIVIDAD_BY_ID(:P_ID_ACTIVIDAD, :P_CURSOR);
      END;
      `,
      {
        P_ID_ACTIVIDAD: id,
        P_CURSOR: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR }
      }
    );

    const cursor = result.outBinds.P_CURSOR;
    const row = await cursor.getRow();
    await cursor.close();

    if (!row) {
      return res.status(404).json({ message: "Actividad no encontrada" });
    }

    res.json(row);

  } catch (error) {
    console.error("Error Oracle:", error);
    res.status(500).json({
      message: "Error al obtener actividad por id",
      detalle: error.message
    });
  }
};


export const getActividad = async (req, res) => {
  try {
    const conn = await getConnection();

    const result = await conn.execute(
      `
      BEGIN
        SP_GET_ACTIVIDAD(:P_CURSOR);
      END;
      `,
      { P_CURSOR: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR } }
    );

    const cursor = result.outBinds.P_CURSOR;
    const actividades = [];
    let row;

    while ((row = await cursor.getRow())) {
      actividades.push(row);
    }

    await cursor.close();

    res.json(actividades);
  } catch (error) {
    console.error("Error Oracle:", error);
    res
      .status(500)
      .json({ message: "Error al obtener actividades", detalle: error.message });
  }
};


export const createActividad = async (req, res) => {
  try {
    const {
      nombre_actividad,
      id_direccion,
      id_tipo_actividad,
      fecha_inicio,
      fecha_fin
    } = req.body;

    if (
      !nombre_actividad ||
      id_direccion == null ||
      id_tipo_actividad == null ||
      !fecha_inicio ||
      !fecha_fin
    ) {
      return res.status(400).json({ message: "Datos insuficientes" });
    }

    const conn = await getConnection();

    const result = await conn.execute(
      `
      BEGIN
        SP_INSERT_ACTIVIDAD(
          :P_NOMBRE_ACTIVIDAD,
          :P_ID_DIRECCION,
          :P_ID_TIPO_ACTIVIDAD,
          :P_FECHA_INICIO,
          :P_FECHA_FIN,
          :P_ID
        );
      END;
      `,
      {
        P_NOMBRE_ACTIVIDAD: nombre_actividad,
        P_ID_DIRECCION: id_direccion,
        P_ID_TIPO_ACTIVIDAD: id_tipo_actividad,
        // Si las fechas vienen como string ISO, Oracle las convierte bien;
        // si prefieres, puedes hacer new Date(fecha_inicio)
        P_FECHA_INICIO: fecha_inicio,
        P_FECHA_FIN: fecha_fin,
        P_ID: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
      },
      { autoCommit: true }
    );

    res.status(201).json({
      message: "Actividad creada correctamente",
      id: result.outBinds.P_ID
    });

  } catch (error) {
    console.error("Error Oracle:", error);
    res
      .status(500)
      .json({ message: "Error al crear actividad", detalle: error.message });
  }
};


export const updateActividad = async (req, res) => {
  try {
    const id = req.params.id;
    const { nombre_actividad, fecha_inicio, fecha_fin } = req.body;

    if (!nombre_actividad || !fecha_inicio || !fecha_fin) {
      return res.status(400).json({ message: "Datos insuficientes" });
    }

    const conn = await getConnection();

    await conn.execute(
      `
      BEGIN
        SP_UPDATE_ACTIVIDAD(
          :P_ID_ACTIVIDAD,
          :P_NOMBRE_ACTIVIDAD,
          :P_FECHA_INICIO,
          :P_FECHA_FIN
        );
      END;
      `,
      {
        P_ID_ACTIVIDAD: id,
        P_NOMBRE_ACTIVIDAD: nombre_actividad,
        P_FECHA_INICIO: fecha_inicio,
        P_FECHA_FIN: fecha_fin
      },
      { autoCommit: true }
    );

    res.json({ message: "Actividad actualizada correctamente" });
  } catch (error) {
    console.error("Error Oracle:", error);
    res
      .status(500)
      .json({ message: "Error al actualizar actividad", detalle: error.message });
  }
};

export const deleteActividad = async (req, res) => {
  try {
    const id = req.params.id;

    const conn = await getConnection();

    await conn.execute(
      `
      BEGIN
        SP_DELETE_ACTIVIDAD(:P_ID_ACTIVIDAD);
      END;
      `,
      { P_ID_ACTIVIDAD: id },
      { autoCommit: true }
    );

    res.json({ message: "Actividad eliminada correctamente" });
  } catch (error) {
    console.error("Error Oracle:", error);

    if (error.errorNum === 2292) {
      // clave foránea, igual que en deleteArticulo
      return res.status(409).json({
        message: "No se puede eliminar porque existen registros asociados",
        detalle: error.message
      });
    }

    res
      .status(500)
      .json({ message: "Error al eliminar actividad", detalle: error.message });
  }
};
