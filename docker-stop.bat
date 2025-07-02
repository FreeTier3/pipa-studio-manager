
@echo off
echo Parando Pipa Studios...
echo.

docker-compose down

if %errorlevel% equ 0 (
    echo.
    echo ✅ Aplicação parada com sucesso!
    echo.
) else (
    echo.
    echo ❌ Erro ao parar a aplicação.
    echo.
)

pause
