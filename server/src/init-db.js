const { initDB, getPool } = require('./db');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

async function main() {
  console.log('\x1b[36m%s\x1b[0m', '=======================================================');
  console.log('\x1b[36m%s\x1b[0m', '📦 INICIALIZANDO BANCO DE DADOS - MEU QUADRO TO DO');
  console.log('\x1b[36m%s\x1b[0m', '=======================================================');

  console.log(`\nConfiguração atual:`);
  console.log(`- Host: ${process.env.DB_HOST || 'localhost'}`);
  console.log(`- Porta: ${process.env.DB_PORT || '5432'}`);
  console.log(`- Usuário: ${process.env.DB_USER || 'postgres'}`);
  console.log(`- Banco: ${process.env.DB_NAME || 'clickup_todo'}\n`);

  try {
    console.log('Conectando ao PostgreSQL e configurando tabelas...');
    await initDB();
    console.log('\n\x1b[32m✔ SUCESSO!\x1b[0m Banco de dados e tabelas prontos para uso.');
    console.log('Você já pode iniciar o sistema com: npm run dev\n');
  } catch (err) {
    console.error('\n\x1b[31m✖ ERRO AO INICIALIZAR BANCO:\x1b[0m', err.message);
    console.error('\nDica: Verifique se o serviço do PostgreSQL está rodando e se as credenciais no arquivo "server/.env" estão corretas.\n');
    process.exit(1);
  } finally {
    const pool = getPool();
    if (pool) {
      await pool.end();
    }
    process.exit(0);
  }
}

main();
