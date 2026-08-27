const { spawn } = require('child_process');
const path = require('path');

console.log('\x1b[36m%s\x1b[0m', '================================================');
console.log('\x1b[36m%s\x1b[0m', '🚀 Iniciando Meu Quadro To Do (Backend + Frontend)');
console.log('\x1b[36m%s\x1b[0m', '================================================');

const isWin = process.platform === 'win32';
const npmCmd = isWin ? 'npm.cmd' : 'npm';

const server = spawn(npmCmd, ['run', 'dev'], {
  cwd: path.resolve(__dirname, '../server'),
  stdio: 'inherit',
  shell: true,
});

const client = spawn(npmCmd, ['run', 'dev'], {
  cwd: path.resolve(__dirname, '../client'),
  stdio: 'inherit',
  shell: true,
});

function handleExit(code) {
  server.kill();
  client.kill();
  process.exit(code);
}

process.on('SIGINT', () => handleExit(0));
process.on('SIGTERM', () => handleExit(0));
