
@echo off
echo Iniciando Pipa Studios no Docker...
echo.

REM Verificar se o Docker está rodando
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo ERRO: Docker não está rodando. Por favor, inicie o Docker Desktop.
    pause
    exit /b 1
)

echo Docker detectado. Construindo e iniciando a aplicação...
echo.

REM Construir e iniciar os containers
docker-compose up --build -d

if %errorlevel% equ 0 (
    echo.
    echo ✅ Aplicação iniciada com sucesso!
    echo.
    echo 🌐 Acesse: http://localhost:8080
    echo.
    echo Para parar a aplicação, execute: docker-compose down
    echo.
) else (
    echo.
    echo ❌ Erro ao iniciar a aplicação.
    echo.
)

pause
