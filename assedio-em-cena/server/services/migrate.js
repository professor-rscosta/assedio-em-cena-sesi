/**
 * Migração idempotente — aplica as mudanças de schema necessárias
 * SEM apagar dados existentes. Pode rodar quantas vezes quiser.
 *
 * Uso: npm run db:migrate
 */
require('dotenv').config();
const mysql = require('mysql2/promise');

async function run() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'assedio_em_cena',
    multipleStatements: true,
  });

  const db = process.env.DB_NAME || 'assedio_em_cena';
  console.log(`Migrando o banco "${db}"...`);

  // 1) coluna cenarios.video_url
  const [colVideo] = await conn.query(
    `SELECT COUNT(*) AS n FROM information_schema.COLUMNS
     WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'cenarios' AND COLUMN_NAME = 'video_url'`,
    [db]
  );
  if (colVideo[0].n === 0) {
    await conn.query(`ALTER TABLE cenarios ADD COLUMN video_url VARCHAR(255) DEFAULT NULL AFTER midia_url`);
    console.log('  ✓ coluna cenarios.video_url adicionada');
  } else {
    console.log('  • cenarios.video_url já existe');
  }

  // 2) ampliar o ENUM de cenarios.tipo (inclui video, caso, multipla, vf, ordenar)
  await conn.query(
    `ALTER TABLE cenarios MODIFY COLUMN tipo
       ENUM('narrativa','quiz','dialogo','reflexao','final','video','caso','multipla','vf','ordenar')
       NOT NULL DEFAULT 'narrativa'`
  );
  console.log('  ✓ enum cenarios.tipo atualizado');

  // 3) tabela respostas
  const [tabResp] = await conn.query(
    `SELECT COUNT(*) AS n FROM information_schema.TABLES
     WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'respostas'`,
    [db]
  );
  if (tabResp[0].n === 0) {
    await conn.query(`
      CREATE TABLE respostas (
        id            BIGINT AUTO_INCREMENT PRIMARY KEY,
        usuario_id    INT NOT NULL,
        modulo_id     INT NOT NULL,
        cenario_id    INT NOT NULL,
        escolha_id    INT DEFAULT NULL,
        cenario_titulo  VARCHAR(160),
        cenario_tipo    VARCHAR(20),
        pergunta        TEXT,
        resposta_texto  VARCHAR(400),
        correta         BOOLEAN DEFAULT NULL,
        xp              INT NOT NULL DEFAULT 0,
        respondido_em   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
        FOREIGN KEY (modulo_id)  REFERENCES modulos(id)  ON DELETE CASCADE,
        INDEX idx_respostas_usuario (usuario_id, modulo_id)
      ) ENGINE=InnoDB`);
    console.log('  ✓ tabela respostas criada');
  } else {
    console.log('  • tabela respostas já existe');
  }

  console.log('\nMigração concluída. Para repopular o conteúdo do Módulo 1 (10 situações), rode também: npm run seed');
  await conn.end();
}

run().catch((e) => { console.error('Falha na migração:', e.message); process.exit(1); });
