import oracledb from 'oracledb';
import { getConnection } from '../database/connection.js';


export const getPersonas = async (req, res) => {
  try {
    const conn = await getConnection();

    const result = await conn.execute(
      `
      BEGIN
        SP_GET_PERSONA(:P_CURSOR);
      END;
      `,
      {
        P_CURSOR: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR }
      }
    );

    const cursor = result.outBinds.P_CURSOR;

    const personas = [];
    let row;

    // Leer todas las filas del cursor
    while ((row = await cursor.getRow())) {
      personas.push(row);
    }

    await cursor.close();

    res.json(personas);

  } catch (error) {
    console.error("Error Oracle:", error);
    res.status(500).json({
      message: "Error al obtener personas",
      detalle: error.message
    });
  }
};


export const getPersonaById = async (req, res) => {
  try {
    const idPersona = req.params.id;

    const conn = await getConnection();

    const result = await conn.execute(
      `
      BEGIN
        SP_GET_PERSONA_BY_ID(
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
      return res.status(404).json({ message: "Persona no encontrada" });
    }

    res.json(row);

  } catch (error) {
    console.error("Error Oracle:", error);
    res.status(500).json({
      message: "Error al obtener persona",
      detalle: error.message
    });
  }
};


export const createPersona = async (req, res) => {
  const {
    nombre,
    ap1,
    ap2,
    rut,
    dv,
    fechaIngreso,
    fechaNacimiento,
    idDireccion,
    idTelefono,
    idEstado
  } = req.body;

  try {
    const pool = await getConnection();

    const result = await pool.execute(
      `
      BEGIN
        SP_INSERT_PERSONA(
          :P_NOMBRE,
          :P_AP1,
          :P_AP2,
          :P_RUT,
          :P_DV,
          :P_FECHA_INGRESO,
          :P_FECHA_NACIMIENTO,
          :P_ID_DIRECCION,
          :P_ID_TELEFONO,
          :P_ID_ESTADO,
          :P_ID
        );
      END;
      `,
      {
        P_NOMBRE: nombre,
        P_AP1: ap1,
        P_AP2: ap2,
        P_RUT: rut,
        P_DV: dv,
        P_FECHA_INGRESO: new Date(fechaIngreso),
        P_FECHA_NACIMIENTO: new Date(fechaNacimiento),
        P_ID_DIRECCION: idDireccion,
        P_ID_TELEFONO: idTelefono,
        P_ID_ESTADO: idEstado,
        P_ID: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
      },
      { autoCommit: true }
    );

    const nuevoId = result.outBinds.P_ID;

    res.status(201).json({
      message: 'Persona creada correctamente',
      id: nuevoId
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Error al crear la persona'
    });
  }
};


export const deletePersona = async (req, res) => {
  try {
    const idPersona = req.params.id;

    const conn = await getConnection();

    const result = await conn.execute(
      `
      BEGIN
        SP_DELETE_PERSONA(:P_ID);
      END;
      `,
      {
        P_ID: idPersona
      },
      { autoCommit: true }
    );

    res.json({
      message: "Persona eliminada correctamente"
    });

  } catch (error) {
    console.error("Error Oracle:", error);

    // ORA-02292: integridad referencial (registros hijos)
    if (error.errorNum === 2292) {
      return res.status(409).json({
        message: "No se puede eliminar la persona porque tiene registros asociados"
      });
    }

    res.status(500).json({
      message: "Error al eliminar persona",
      detalle: error.message
    });
  }
};


export const updatePersona = async (req, res) => {
  try {
    const idPersona = req.params.id;

    const { nombre, ap1, ap2 } = req.body;

    const conn = await getConnection();

    const result = await conn.execute(
      `
      BEGIN
        SP_UPDATE_PERSONA(
          :P_ID,
          :P_NOMBRE,
          :P_AP1,
          :P_AP2
        );
      END;
      `,
      {
        P_ID: idPersona,
        P_NOMBRE: nombre,
        P_AP1: ap1,
        P_AP2: ap2
      },
      { autoCommit: true }
    );

    res.json({
      message: "Persona actualizada correctamente"
    });

  } catch (error) {
    console.error("Error Oracle:", error);

    res.status(500).json({
      message: "Error al actualizar persona",
      detalle: error.message
    });
  }
};