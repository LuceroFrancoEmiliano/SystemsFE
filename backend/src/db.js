import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

// Configuración optimizada del Connection Pool para mínimo uso de RAM
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/systems_db',
  max: 10, // Máximo 10 conexiones simultáneas (suficiente para miles de requests/seg)
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on('error', (err) => {
  console.error('[DB Error Inesperado]:', err.message);
});

/**
 * Ejecuta una función/paquete PL/pgSQL que retorna JSONB
 * @param {string} fnName - Nombre del paquete y función (ej: 'pkg_sistemas.listar_activos')
 * @param {Array} params - Parámetros posicionales para la función SQL
 * @returns {Promise<any>} Objeto JSON ya deserializado
 */
export async function callPackage(fnName, params = []) {
  const placeholders = params.map((_, i) => `$${i + 1}`).join(', ');
  const sql = `SELECT ${fnName}(${placeholders}) AS result;`;
  
  try {
    const { rows } = await pool.query(sql, params);
    if (!rows || rows.length === 0) return { ok: false, error: 'Sin respuesta de la base de datos' };
    return rows[0].result;
  } catch (error) {
    console.error(`[DB Error en ${fnName}]:`, error.message);
    return { ok: false, error: error.message };
  }
}

/**
 * Ejecuta una consulta SQL plana si se necesita
 */
export async function query(text, params) {
  return pool.query(text, params);
}

export default {
  callPackage,
  query,
  pool,
};
