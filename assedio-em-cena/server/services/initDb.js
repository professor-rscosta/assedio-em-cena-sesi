/**
 * Cria o banco e as tabelas executando database/schema.sql.
 * Uso: npm run db:init
 */
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

async function run() {
  const schemaPath = path.join(__dirname, '..', '..', 'database', 'schema.sql');
  const sql = fs.readFileSync(schemaPath, 'utf8');

  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    multipleStatements: true,
  });

  console.log('Executando schema.sql...');
  await conn.query(sql);
  console.log('✓ Banco e tabelas criados.');
  await conn.end();
}

run().catch((e) => { console.error('Falha ao inicializar o banco:', e.message); process.exit(1); });
