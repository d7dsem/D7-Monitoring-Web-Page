@echo off
setlocal enabledelayedexpansion

set FORMATTER_DIR=dbg-frontend\js\submodules
set FORMATTER_DIR=%CD%
set ROUTES=status param dlg both mem

for %%R in (%ROUTES%) do (
    (
        echo export function %%RFormatter^(data^) ^{
        echo    return JSON.stringify^(data, null, 2^);
        echo ^}
    ) > %FORMATTER_DIR%\%%RFormatter.js
    echo Created: %FORMATTER_DIR%\%%RFormatter.js
)

endlocal
