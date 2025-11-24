import oracledb from "oracledb";
import { getConnection } from "../database/connection.js";

export const createDireccion = async (req, res) => {
  try {
    const { id_ciudad, calle, numero, depto, codigo_postal, referencia } = req.body;

    if (!id_ciudad || !calle || numero == null) {
      return res.status(400).json({ message: "Datos insuficientes" });
    }

    const conn = await getConnection();

    const result = await conn.execute(
      `
      BEGIN
        SP_INSERT_DIRECCION(
          :P_ID_CIUDAD,
          :P_CALLE,
          :P_NUMERO,
          :P_DEPTO,
          :P_CODIGO_POSTAL,
          :P_REFERENCIA,
          :P_ID
        );
      END;
      `,
      {
        P_ID_CIUDAD: id_ciudad,
        P_CALLE: calle,
        P_NUMERO: numero,
        P_DEPTO: depto,
        P_CODIGO_POSTAL: codigo_postal,
        P_REFERENCIA: referencia,
        P_ID: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
      },
      { autoCommit: true }
    );

    res.status(201).json({
      message: "Dirección creada correctamente",
      id: result.outBinds.P_ID
    });

  } catch (error) {
    console.error("Error Oracle:", error);
    res.status(500).json({ message: "Error al crear dirección", detalle: error.message });
  }
};

export const getDirecciones = async (req, res) => {
  try {
    const conn = await getConnection();

    const result = await conn.execute(
      `
      BEGIN
        SP_GET_DIRECCION(:P_CURSOR);
      END;
      `,
      { P_CURSOR: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR } }
    );

    const cursor = result.outBinds.P_CURSOR;
    const direcciones = [];
    let row;

    while ((row = await cursor.getRow())) {
      direcciones.push(row);
    }

    await cursor.close();

    res.json(direcciones);

  } catch (error) {
    console.error("Error Oracle:", error);
    res.status(500).json({ message: "Error al obtener direcciones", detalle: error.message });
  }
};

export const getDireccionById = async (req, res) => {
  try {
    const id = req.params.id;

    const conn = await getConnection();

    const result = await conn.execute(
      `
      BEGIN
        SP_GET_DIRECCION_BY_ID(:P_ID_DIRECCION, :P_CURSOR);
      END;
      `,
      {
        P_ID_DIRECCION: id,
        P_CURSOR: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR }
      }
    );

    const cursor = result.outBinds.P_CURSOR;
    const row = await cursor.getRow();
    await cursor.close();

    if (!row) {
      return res.status(404).json({ message: "Dirección no encontrada" });
    }

    res.json(row);

  } catch (error) {
    console.error("Error Oracle:", error);
    res.status(500).json({
      message: "Error al obtener dirección por id",
      detalle: error.message
    });
  }
};

export const updateDireccion = async (req, res) => {
  try {
    const id = req.params.id;
    const { calle, numero, depto } = req.body;

    if (!calle || numero == null) {
      return res.status(400).json({ message: "Datos insuficientes" });
    }

    const conn = await getConnection();

    await conn.execute(
      `
      BEGIN
        SP_UPDATE_DIRECCION(
          :P_ID_DIRECCION,
          :P_CALLE,
          :P_NUMERO,
          :P_DEPTO
        );
      END;
      `,
      {
        P_ID_DIRECCION: id,
        P_CALLE: calle,
        P_NUMERO: numero,
        P_DEPTO: depto
      },
      { autoCommit: true }
    );

    res.json({ message: "Dirección actualizada correctamente" });

  } catch (error) {
    console.error("Error Oracle:", error);
    res.status(500).json({ message: "Error al actualizar dirección", detalle: error.message });
  }
};

export const deleteDireccion = async (req, res) => {
  try {
    const id = req.params.id;
    const conn = await getConnection();

    await conn.execute(
      `
      BEGIN
        SP_DELETE_DIRECCION(:P_ID_DIRECCION);
      END;
      `,
      { P_ID_DIRECCION: id },
      { autoCommit: true }
    );

    res.json({ message: "Dirección eliminada correctamente" });

  } catch (error) {
    console.error("Error Oracle:", error);

    if (error.errorNum === 2292) {
      return res.status(409).json({
        message: "No se puede eliminar porque existen registros asociados",
        detalle: error.message
      });
    }

    res.status(500).json({ message: "Error al eliminar dirección", detalle: error.message });
  }
};
