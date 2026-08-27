@echo off
title Meu Quadro To Do
echo ===================================================
echo     Iniciando Meu Quadro To Do (PostgreSQL + React)
echo ===================================================
echo.

cd /d "%~dp0"

echo [1/2] Verificando dependencias...
if not exist "server\node_modules" (
    echo Instalando dependencias do servidor...
    cd server && call npm install && cd ..
)

if not exist "client\node_modules" (
    echo Instalando dependencias do cliente...
    cd client && call npm install && cd ..
)

echo.
echo [2/2] Iniciando aplicacao...
echo Acesso: http://localhost:5173
echo.
npm run dev

pause
