@echo off
REM ============================================================
REM  EDS — Especialista em Cantos — Lançador local
REM ============================================================
REM  Este script sobe um servidor HTTP local na porta 8765 e abre
REM  o app no seu navegador padrão. Rodar em http://localhost elimina
REM  as restrições de file:// (onde cache se prende, CSP vira imprevisível
REM  e alguns carregamentos de arquivos locais dão 'Unsafe attempt to
REM  load URL' no console).
REM
REM  Feche esta janela quando terminar — o servidor encerra junto.
REM ============================================================

cd /d "%~dp0"

echo.
echo   EDS - Especialista em Cantos
echo   ---------------------------------
echo   Subindo servidor local em http://localhost:8765
echo   Feche esta janela para encerrar.
echo.

REM Abre o navegador depois de 1.5s para dar tempo do server subir
start "" cmd /c "timeout /t 2 /nobreak > NUL && start http://localhost:8765/index.html"

REM Sobe o servidor (bloqueia esta janela — fechar encerra)
python -m http.server 8765 --bind 127.0.0.1
