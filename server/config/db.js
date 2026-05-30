require('dotenv').config();
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'assedio_em_cena',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: 'utf8mb4_unicode_ci',
  namedPlaceholders: true,
});

// Helper: query simples retornando rows
async function query(sql, params = {}) {
  const [rows] = await pool.execute(sql, params);
  return rows;
}

// Helper: primeiro registro ou null
async function queryOne(sql, params = {}) {
  const rows = await query(sql, params);
  return rows.length ? rows[0] : null;
}

module.exports = { pool, query, queryOne };
