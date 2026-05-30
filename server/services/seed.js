/**
 * Popula dados base (Módulo 1) e cria o usuário admin com hash bcrypt.
 * Uso: npm run seed   (rode após npm run db:init)
 */
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');

async function run() {
  const seedPath = path.join(__dirname, '..', '..', 'database', 'seed_modulo1.sql');
  const sql = fs.readFileSync(seedPath, 'utf8');

  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'assedio_em_cena',
    multipleStatements: true,
  });

  console.log('Populando Módulo 1...');
  await conn.query(sql);

  // cria/atualiza admin
  const nome = process.env.ADMIN_NOME || 'Administrador';
  const email = process.env.ADMIN_EMAIL || 'admin@assedioemcena.com';
  const senha = process.env.ADMIN_SENHA || 'Admin@123';
  const hash = await bcrypt.hash(senha, Number(process.env.BCRYPT_ROUNDS) || 10);

  await conn.query(
    `INSERT INTO usuarios (nome, email, senha_hash, papel_sistema, nivel_maturidade)
     VALUES (?, ?, ?, 'admin', 'guardiao')
     ON DUPLICATE KEY UPDATE senha_hash = VALUES(senha_hash), papel_sistema='admin'`,
    [nome, email, hash]
  );

  console.log('✓ Módulo 1 populado.');
  console.log(`✓ Admin criado: ${email} / senha definida no .env`);
  await conn.end();
}

run().catch((e) => { console.error('Falha no seed:', e.message); process.exit(1); });
