const { Pool, Client } = require('pg');
require('dotenv').config();

const config = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'clickup_todo',
};

let pool = null;

async function ensureDatabaseExists() {
  const adminClient = new Client({
    host: config.host,
    port: config.port,
    user: config.user,
    password: config.password,
    database: 'postgres',
  });

  try {
    await adminClient.connect();
    const res = await adminClient.query(
      `SELECT 1 FROM pg_database WHERE datname = $1`,
      [config.database]
    );

    if (res.rowCount === 0) {
      console.log(`[DB] Database "${config.database}" does not exist. Creating...`);
      // Escape database name safely
      await adminClient.query(`CREATE DATABASE "${config.database}"`);
      console.log(`[DB] Database "${config.database}" created successfully.`);
    }
  } catch (err) {
    console.warn(`[DB] Notice during database check: ${err.message}`);
  } finally {
    try {
      await adminClient.end();
    } catch (_) {}
  }
}

async function initDB() {
  await ensureDatabaseExists();

  pool = new Pool(config);

  pool.on('error', (err) => {
    console.error('[DB] Unexpected error on idle client:', err);
  });

  const client = await pool.connect();
  try {
    // Create Tables
    await client.query(`
      CREATE TABLE IF NOT EXISTS projects (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS columns (
        id SERIAL PRIMARY KEY,
        project_id INT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
        name VARCHAR(100) NOT NULL,
        position INT NOT NULL DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS cards (
        id SERIAL PRIMARY KEY,
        column_id INT NOT NULL REFERENCES columns(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        position INT NOT NULL DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Check if initial project needs to be seeded
    const projectCountRes = await client.query('SELECT COUNT(*) FROM projects');
    const projectCount = parseInt(projectCountRes.rows[0].count, 10);

    if (projectCount === 0) {
      console.log('[DB] Seeding initial project and default columns...');
      const newProj = await client.query(
        `INSERT INTO projects (name, description) VALUES ($1, $2) RETURNING id`,
        ['Meu Primeiro Projeto', 'Projeto inicial criado automaticamente.']
      );
      const projectId = newProj.rows[0].id;

      const defaultColumns = [
        { name: 'Para fazer', pos: 0 },
        { name: 'Fazendo', pos: 1 },
        { name: 'Completo', pos: 2 },
        { name: 'Não deu certo', pos: 3 },
      ];

      const colMap = {};
      for (const col of defaultColumns) {
        const colRes = await client.query(
          `INSERT INTO columns (project_id, name, position) VALUES ($1, $2, $3) RETURNING id`,
          [projectId, col.name, col.pos]
        );
        colMap[col.name] = colRes.rows[0].id;
      }

      // Sample cards
      await client.query(
        `INSERT INTO cards (column_id, title, description, position) VALUES 
         ($1, $2, $3, $4),
         ($5, $6, $7, $8),
         ($9, $10, $11, $12)`,
        [
          colMap['Para fazer'], 'Planejar novas funcionalidades', 'Definir os próximos passos do sistema.', 0,
          colMap['Fazendo'], 'Desenvolver quadro Kanban', 'Criar componentes de cards e colunas com drag and drop.', 0,
          colMap['Completo'], 'Configuração inicial do banco', 'PostgreSQL configurado e tabelas criadas.', 0
        ]
      );
      console.log('[DB] Seed completed successfully.');
    }

    console.log('[DB] Database initialized and connected successfully.');
  } finally {
    client.release();
  }

  return pool;
}

function query(text, params) {
  if (!pool) {
    throw new Error('Database pool not initialized. Call initDB() first.');
  }
  return pool.query(text, params);
}

function getPool() {
  return pool;
}

module.exports = {
  initDB,
  query,
  getPool,
};
