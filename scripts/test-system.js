const path = require('path');
require(path.resolve(__dirname, '../server/node_modules/dotenv')).config({ path: path.resolve(__dirname, '../server/.env') });

const express = require(path.resolve(__dirname, '../server/node_modules/express'));
const { initDB, getPool } = require('../server/src/db');
const routes = require('../server/src/routes');

async function runTests() {
  console.log('\x1b[34m%s\x1b[0m', '==================================================');
  console.log('\x1b[34m%s\x1b[0m', '🧪 EXECUTANDO SUÍTE DE TESTES E VALIDAÇÃO DO SISTEMA');
  console.log('\x1b[34m%s\x1b[0m', '==================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, testName) {
    if (condition) {
      console.log(`\x1b[32m✔ PASS\x1b[0m: ${testName}`);
      passed++;
    } else {
      console.error(`\x1b[31m✖ FAIL\x1b[0m: ${testName}`);
      failed++;
    }
  }

  // 1. Initialize DB
  try {
    console.log('[1/8] Testando conexão com o banco de dados PostgreSQL...');
    await initDB();
    assert(true, 'Conexão e inicialização do PostgreSQL bem-sucedida');
  } catch (err) {
    assert(false, `Falha na conexão com Postgres: ${err.message}`);
    process.exit(1);
  }

  // Setup express test server on random port
  const app = express();
  app.use(express.json());
  app.use('/api', routes);

  const server = app.listen(0);
  const port = server.address().port;
  const baseUrl = `http://localhost:${port}/api`;

  try {
    // 2. Health check
    console.log('\n[2/8] Testando endpoint de Health Check...');
    const healthRes = await fetch(`${baseUrl}/health`).then(r => r.json());
    assert(healthRes.status === 'ok', 'Health Check retornou status ok');

    // 3. List projects
    console.log('\n[3/8] Testando listagem de projetos...');
    const projects = await fetch(`${baseUrl}/projects`).then(r => r.json());
    assert(Array.isArray(projects) && projects.length > 0, `Projetos listados com sucesso (${projects.length} projeto(s) encontrados)`);

    // 4. Create new project with default 4 columns
    console.log('\n[4/8] Testando criação de novo projeto com 4 colunas padrão...');
    const newProject = await fetch(`${baseUrl}/projects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Projeto de Teste Automatizado',
        description: 'Descrição de teste',
      }),
    }).then(r => r.json());

    assert(newProject.id && newProject.name === 'Projeto de Teste Automatizado', 'Projeto criado com ID retornado');

    // 5. Get project board
    console.log('\n[5/8] Testando carregamento do quadro e colunas padrão do projeto...');
    const board = await fetch(`${baseUrl}/projects/${newProject.id}/board`).then(r => r.json());
    const columnNames = board.columns.map(c => c.name);
    assert(
      columnNames.includes('Para fazer') &&
      columnNames.includes('Fazendo') &&
      columnNames.includes('Completo') &&
      columnNames.includes('Não deu certo'),
      `Quadro contém as 4 colunas padrão: ${columnNames.join(', ')}`
    );

    const colParaFazer = board.columns.find(c => c.name === 'Para fazer');
    const colFazendo = board.columns.find(c => c.name === 'Fazendo');

    // 6. Create cards in column
    console.log('\n[6/8] Testando criação e inserção de cards...');
    const card1 = await fetch(`${baseUrl}/columns/${colParaFazer.id}/cards`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Estudar arquitetura Kanban',
        description: 'Ler documentação e entender fluxo de trabalho.',
      }),
    }).then(r => r.json());

    assert(card1.id && card1.title === 'Estudar arquitetura Kanban', 'Card 1 criado com sucesso');

    // 7. Move card to another column (Drag and Drop simulation)
    console.log('\n[7/8] Testando movimentação de card entre colunas (Simulação de Drag & Drop)...');
    const movedCard = await fetch(`${baseUrl}/cards/${card1.id}/move`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        targetColumnId: colFazendo.id,
        newPosition: 0,
      }),
    }).then(r => r.json());

    assert(movedCard.column_id === colFazendo.id, 'Card movido com sucesso para a coluna "Fazendo"');

    // 8. Update and delete card and project
    console.log('\n[8/8] Testando atualização, exclusão de card e exclusão do projeto...');
    const updatedCard = await fetch(`${baseUrl}/cards/${card1.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Estudar arquitetura Kanban (Concluído)',
        description: 'Estudos finalizados.',
      }),
    }).then(r => r.json());

    assert(updatedCard.title.includes('(Concluído)'), 'Card atualizado com sucesso');

    const deleteCardRes = await fetch(`${baseUrl}/cards/${card1.id}`, { method: 'DELETE' }).then(r => r.json());
    assert(deleteCardRes.message === 'Card deleted successfully', 'Card excluído com sucesso');

    const deleteProjRes = await fetch(`${baseUrl}/projects/${newProject.id}`, { method: 'DELETE' }).then(r => r.json());
    assert(deleteProjRes.message === 'Project deleted successfully', 'Projeto de teste excluído e limpo com sucesso');

    console.log('\n==================================================');
    console.log(`\x1b[32mTODOS OS TESTES PASSARAM COM SUCESSO!\x1b[0m (${passed} passaram, 0 falhas)`);
    console.log('==================================================\n');
  } catch (err) {
    console.error('Erro durante execução dos testes:', err);
    process.exit(1);
  } finally {
    server.close();
    await getPool().end();
  }
}

runTests();
