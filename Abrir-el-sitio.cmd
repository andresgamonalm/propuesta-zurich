@echo off
setlocal
title Seguros Zurich para clientes de Banco BICE
cd /d "%~dp0"
set "PUERTO=5178"

echo.
echo   ====================================================
echo    SEGUROS ZURICH PARA CLIENTES DE BANCO BICE
echo    Propuesta de mini sitio - version local
echo   ====================================================
echo.
echo    Se va a abrir en:  http://127.0.0.1:%PUERTO%/login/
echo.
echo    Para entrar como administrador usa: hola@andresgamonal.com
echo    Cualquier otro correo entra como cliente.
echo.
echo    DEJA ESTA VENTANA ABIERTA mientras lo revisas.
echo    Para cerrarlo, cierra esta ventana.
echo.

where py >nul 2>nul
if %ERRORLEVEL%==0 (
    start "" "http://127.0.0.1:%PUERTO%/login/"
    py -3 -m http.server %PUERTO% --bind 127.0.0.1
    goto fin
)

where python >nul 2>nul
if %ERRORLEVEL%==0 (
    start "" "http://127.0.0.1:%PUERTO%/login/"
    python -m http.server %PUERTO% --bind 127.0.0.1
    goto fin
)

where node >nul 2>nul
if %ERRORLEVEL%==0 (
    start "" "http://127.0.0.1:%PUERTO%/login/"
    npx --yes http-server -p %PUERTO% -a 127.0.0.1 -c-1
    goto fin
)

echo.
echo    No encontre Python ni Node en este computador.
echo.
echo    El sitio no se puede abrir con doble clic sobre index.html:
echo    esta hecho con modulos de JavaScript y el navegador los bloquea
echo    cuando la pagina no viene de un servidor.
echo.
echo    Con Python instalado (python.org), este mismo archivo lo resuelve solo.
echo.
pause

:fin
endlocal
