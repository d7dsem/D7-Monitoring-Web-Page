@echo off
setlocal enabledelayedexpansion

set "SCRIPT_DIR=%~dp0"


set "SRC_PATH=%SCRIPT_DIR%\..\backend (simply demo proj)\go\proj1"
set "OUT_PATH=%SCRIPT_DIR%\..\backend (simply demo proj)\go\bin"
set NAME=proj1
set "OUTPUT=%OUT_PATH%\%NAME%.exe"

if not exist "%OUT_PATH%" (
    echo Error with path!
    exit
)

echo.
echo Build for Windows
echo Target: %OUTPUT%

go build -o "%OUTPUT%"  "%SRC_PATH%\main.go"

if %errorlevel% neq  0 (
    echo fail build
)

endlocal
