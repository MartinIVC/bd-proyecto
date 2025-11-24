import oracledb from 'oracledb';
import { getConnection } from '../database/connection.js';


export const getDirigenteById = async (req, res) => {
  try {
    const idPersona = req.params.id;

    const conn = await getConnection();

    const result = await conn.execute(
      `
      BEGIN
        SP_GET_DIRIGENTE_BY_ID(
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

    let row = await cursor.getRow();
    await cursor.close();

    if (!row) {
      return res.status(404).json({ message: "Dirigente no encontrado" });
    }

    res.json(row);

  } catch (error) {
    console.error("Error Oracle:", error);
    res.status(500).json({
      message: "Error al obtener dirigente",
      detalle: error.message
    });
  }
};


export const getDirigentes = async (req, res) => {
  try {
    const conn = await getConnection();

    const result = await conn.execute(
      `
      BEGIN
        SP_GET_DIRIGENTE(:P_CURSOR);
      END;
      `,
      {
        P_CURSOR: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR }
      }
    );

    const cursor = result.outBinds.P_CURSOR;

    const dirigentes = [];
    let row;

    while ((row = await cursor.getRow())) {
      dirigentes.push(row);
    }

    await cursor.close();

    res.json(dirigentes);

  } catch (error) {
    console.error("Error Oracle:", error);
    res.status(500).json({
      message: "Error al obtener dirigentes",
      detalle: error.message
    });
  }
};


export const createDirigente = async (req, res) => {
  try {
    const {
      idPersona,
      idCargo,
      idUnidad,
      certificaciones
    } = req.body;

    const conn = await getConnection();

    await conn.execute(
      `
      BEGIN
        SP_INSERT_DIRIGENTE(
          :P_ID_PERSONA,
          :P_ID_CARGO,
          :P_ID_UNIDAD,
          :P_CERTIFICACIONES
        );
      END;
      `,
      {
        P_ID_PERSONA: idPersona,
        P_ID_CARGO: idCargo,
        P_ID_UNIDAD: idUnidad,
        P_CERTIFICACIONES: certificaciones
      },
      { autoCommit: true }
    );

    res.status(201).json({
      message: "Dirigente creado correctamente"
    });

  } catch (error) {
    console.error("Error Oracle:", error);

    // Error por integridad referencial
    if (error.errorNum === 2291) {
      return res.status(409).json({
        message: "No se puede crear porque uno de los IDs no existe en las tablas relacionadas",
        detalle: error.message
      });
    }

    res.status(500).json({
      message: "Error al crear dirigente",
      detalle: error.message
    });
  }
};


export const updateDirigente = async (req, res) => {
  try {
    const idPersona = req.params.id;

    const {
      idCargo,
      idUnidad,
      certificaciones
    } = req.body;

    const conn = await getConnection();

    await conn.execute(
      `
      BEGIN
        SP_UPDATE_DIRIGENTE(
          :P_ID_PERSONA,
          :P_ID_CARGO,
          :P_ID_UNIDAD,
          :P_CERTIFICACIONES
        );
      END;
      `,
      {
        P_ID_PERSONA: idPersona,
        P_ID_CARGO: idCargo,
        P_ID_UNIDAD: idUnidad,
        P_CERTIFICACIONES: certificaciones
      },
      { autoCommit: true }
    );

    res.json({
      message: "Dirigente actualizado correctamente"
    });

  } catch (error) {
    console.error("Error Oracle:", error);

    // Error de integridad referencial FK
    if (error.errorNum === 2291) {
      return res.status(409).json({
        message: "No se puede actualizar porque uno de los IDs no existe en las tablas relacionadas",
        detalle: error.message
      });
    }

    res.status(500).json({
      message: "Error al actualizar dirigente",
      detalle: error.message
    });
  }
};


export const deleteDirigente = async (req, res) => {
  try {
    const idPersona = req.params.id;

    const conn = await getConnection();

    await conn.execute(
      `
      BEGIN
        SP_DELETE_DIRIGENTE(:P_ID_PERSONA);
      END;
      `,
      {
        P_ID_PERSONA: idPersona
      },
      { autoCommit: true }
    );

    res.json({
      message: "Dirigente eliminado correctamente"
    });

  } catch (error) {
    console.error("Error Oracle:", error);

    // ORA-02292 → No se puede borrar porque tiene registros hijos
    if (error.errorNum === 2292) {
      return res.status(409).json({
        message: "No se puede eliminar el dirigente porque tiene registros asociados",
        detalle: error.message
      });
    }

    res.status(500).json({
      message: "Error al eliminar dirigente",
      detalle: error.message
    });
  }
};