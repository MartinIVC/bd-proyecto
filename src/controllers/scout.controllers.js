import oracledb from 'oracledb';
import { getConnection } from '../database/connection.js';


export const getScouts = async (req, res) => {
  try {
    const conn = await getConnection();

    const result = await conn.execute(
      `
      BEGIN
        SP_GET_SCOUT(:P_CURSOR);
      END;
      `,
      {
        P_CURSOR: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR }
      }
    );

    const cursor = result.outBinds.P_CURSOR;

    const scouts = [];
    let row;

    // Leer todas las filas del cursor
    while ((row = await cursor.getRow())) {
      scouts.push(row);
    }

    // Cerrar cursor
    await cursor.close();

    res.json(scouts);

  } catch (error) {
    console.error("Error Oracle:", error);
    res.status(500).json({
      message: "Error al obtener scouts",
      detalle: error.message
    });
  }
};


export const getScoutById = async (req, res) => {
  try {
    const idPersona = req.params.id;

    const conn = await getConnection();

    const result = await conn.execute(
      `
      BEGIN
        SP_GET_SCOUT_BY_ID(
          :P_ID_PERSONA,
          :P_CURSOR
        );
      END;
      `,
      {
        P_ID_PERSONA: idPersona,
        P_CURSOR: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR }
      }
    );

    const cursor = result.outBinds.P_CURSOR;

    let row = await cursor.getRow(); // solo una fila
    await cursor.close();

    if (!row) {
      return res.status(404).json({
        message: "Scout no encontrado"
      });
    }

    res.json(row);

  } catch (error) {
    console.error("Error Oracle:", error);
    res.status(500).json({
      message: "Error al obtener scout",
      detalle: error.message
    });
  }
};


export const createScout = async (req, res) => {
  try {
    const {
      idPersona,
      idPatrulla,
      idTelefonoEmergencia
    } = req.body;

    const conn = await getConnection();

    const result = await conn.execute(
      `
      BEGIN
        SP_INSERT_SCOUT(
          :P_ID_PERSONA,
          :P_ID_PATRULLA,
          :P_ID_TELEFONO_EMERGENCIA
        );
      END;
      `,
      {
        P_ID_PERSONA: idPersona,
        P_ID_PATRULLA: idPatrulla,
        P_ID_TELEFONO_EMERGENCIA: idTelefonoEmergencia
      },
      { autoCommit: true }
    );

    res.status(201).json({
      message: "Scout creado correctamente"
    });

  } catch (error) {
    console.error("Error Oracle:", error);
    res.status(500).json({
      message: "Error al crear scout",
      detalle: error.message
    });
  }
};


export const updateScout = async (req, res) => {
  try {
    const idPersona = req.params.id;

    const { idPatrulla, idTelefonoEmergencia } = req.body;

    const conn = await getConnection();

    const result = await conn.execute(
      `
      BEGIN
        SP_UPDATE_SCOUT(
          :P_ID_PERSONA,
          :P_ID_PATRULLA,
          :P_ID_TELEFONO_EMERGENCIA
        );
      END;
      `,
      {
        P_ID_PERSONA: idPersona,
        P_ID_PATRULLA: idPatrulla,
        P_ID_TELEFONO_EMERGENCIA: idTelefonoEmergencia
      },
      { autoCommit: true }
    );

    res.json({
      message: "Scout actualizado correctamente"
    });

  } catch (error) {
    console.error("Error Oracle:", error);

    res.status(500).json({
      message: "Error al actualizar scout",
      detalle: error.message
    });
  }
};


export const deleteScout = async (req, res) => {
  try {
    const idPersona = req.params.id;

    const conn = await getConnection();

    const result = await conn.execute(
      `
      BEGIN
        SP_DELETE_SCOUT(:P_ID_PERSONA);
      END;
      `,
      {
        P_ID_PERSONA: idPersona
      },
      { autoCommit: true }
    );

    res.json({
      message: "Scout eliminado correctamente"
    });

  } catch (error) {
    console.error("Error Oracle:", error);

    // Error por restricción FK (si tiene dependencias)
    if (error.errorNum === 2292) {
      return res.status(409).json({
        message: "No se puede eliminar el scout porque tiene registros asociados"
      });
    }

    res.status(500).json({
      message: "Error al eliminar scout",
      detalle: error.message
    });
  }
};