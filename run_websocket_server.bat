@echo off
setlocal

REM Parse options: -h/--host, -p/--port, -s/--ssl
set "WS_HOST="
set "WS_PORT="
set "WS_SSL=0"

:parse_args
if "%~1"=="" goto args_done
if /i "%~1"=="-h" (
  set "WS_HOST=%~2"
  shift
  shift
  goto parse_args
)
if /i "%~1"=="--host" (
  set "WS_HOST=%~2"
  shift
  shift
  goto parse_args
)
if /i "%~1"=="-p" (
  set "WS_PORT=%~2"
  shift
  shift
  goto parse_args
)
if /i "%~1"=="--port" (
  set "WS_PORT=%~2"
  shift
  shift
  goto parse_args
)
if /i "%~1"=="-s" (
  set "WS_SSL=1"
  shift
  goto parse_args
)
if /i "%~1"=="--ssl" (
  set "WS_SSL=1"
  shift
  goto parse_args
)
if /i "%~1"=="-?" goto usage
if /i "%~1"=="--help" goto usage

echo Unknown option: %~1
goto usage

:args_done
REM Use bundled Node.js if present, otherwise fall back to system node.
set "NODE_EXE=%~dp0js\node-v24.13.1-win-x64\node.exe"
if not exist "%NODE_EXE%" (
  for /f "delims=" %%D in ('dir /b /ad "%~dp0js\node-*-win-x64" 2^>nul') do (
    if exist "%~dp0js\%%D\node.exe" set "NODE_EXE=%~dp0js\%%D\node.exe"
  )
)

if not defined WS_PORT if "%WS_SSL%"=="1" set "WS_PORT=5001"
if not defined WS_PORT if defined WS_HOST set "WS_PORT=5001"

set "NODE_ARGS="
if defined WS_PORT set "NODE_ARGS=%NODE_ARGS% %WS_PORT%"
if "%WS_SSL%"=="1" (
  set "NODE_ARGS=%NODE_ARGS% ssl"
) else (
  if defined WS_HOST set "NODE_ARGS=%NODE_ARGS% nossl"
)
if defined WS_HOST set "NODE_ARGS=%NODE_ARGS% %WS_HOST%"

if exist "%NODE_EXE%" (
  "%NODE_EXE%" "%~dp0js\websocket_server.js"%NODE_ARGS%
) else (
  node "%~dp0js\websocket_server.js"%NODE_ARGS%
)

goto end

:usage
echo Usage: %~nx0 [-h HOST] [-p PORT] [-s]
echo   -h, --host   Bind address (default: 0.0.0.0)
echo   -p, --port   Port number (default: 5001)
echo   -s, --ssl    Enable SSL (requires cert.pem/key.pem)
exit /b 1

:end

endlocal
