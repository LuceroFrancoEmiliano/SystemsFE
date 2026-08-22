import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2500,
});

pool.on('error', (err) => {
  console.error('[Soderia DB Error]:', err.message);
});

export async function callPackage(fnName, params = []) {
  const start = Date.now();
  const placeholders = params.map((_, i) => `$${i + 1}`).join(', ');
  const sql = `SELECT ${fnName}(${placeholders}) AS result;`;

  try {
    const { rows } = await pool.query(sql, params);
    const duration = Date.now() - start;
    if (!rows || rows.length === 0) {
      console.log(`[PL/pgSQL SODERIA] ⚠️  ${fnName.padEnd(32)} -> 404 (${duration}ms)`);
      return { ok: false, error: 'Sin respuesta de la base de datos' };
    }
    const res = rows[0].result;
    const ok = res && res.ok !== false;
    console.log(`[PL/pgSQL SODERIA] ⚡ ${fnName.padEnd(32)} -> ${ok ? '200 OK' : '400 ERROR'} (${duration}ms)`);
    return res;
  } catch (error) {
    const duration = Date.now() - start;
    console.error(`[PL/pgSQL SODERIA] ❌ ${fnName.padEnd(32)} -> Error (${duration}ms) | ${error.message}`);
    return { ok: false, error: error.message };
  }
}

export async function query(text, params) {
  return pool.query(text, params);
}

export default {
  callPackage,
  query,
  pool
};
