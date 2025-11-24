import oracledb from 'oracledb';
import { getConnection } from '../database/connection.js'



export const getTiposUsuarios = async (req, res) => {
  let connection;
  try {
    connection = await getConnection();

    const result = await connection.execute(
      `BEGIN
         SP_GET_TIPO_USUARIO(:cursor);
       END;`,
      {
        cursor: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR }
      }
    );

    const rs = result.outBinds.cursor;
    const rows = await rs.getRows(); // puedes pasar un número o dejarlo vacío para todos
    await rs.close();

    res.json(rows);

  } catch (error) {
    console.error('Error getTipoUsuarios:', error);
    res.status(500).json({ message: 'Error al obtener tipos de usuario' });
  } finally {
    if (connection) {
      try { await connection.close(); } catch (e) { console.error(e); }
    }
  }
};

// Obtener UN tipo de usuario por ID
export const getTipoUsuarioById = async (req, res) => {
  let connection;
  try {
    const { id } = req.params;
    connection = await getConnection();

    const result = await connection.execute(
      `BEGIN
         SP_GET_TIPO_USUARIO_BY_ID(:P_ID_TIPO_USUARIO, :cursor);
       END;`,
      {
        P_ID_TIPO_USUARIO: Number(id),
        cursor: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR }
      }
    );

    const rs = result.outBinds.cursor;
    const rows = await rs.getRows();
    await rs.close();

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Tipo de usuario no encontrado' });
    }

    res.json(rows[0]);

  } catch (error) {
    console.error('Error getTipoUsuarioById:', error);
    res.status(500).json({ message: 'Error al obtener tipo de usuario' });
  } finally {
    if (connection) {
      try { await connection.close(); } catch (e) { console.error(e); }
    }
  }
};