@echo off
setlocal enabledelayedexpansion

set FORMATTER_DIR=%CD%
set ROUTES=status param dlg both mem
set INDEX_FILE=index.js

> %INDEX_FILE% echo // Auto-generated index.js

for %%R in (%ROUTES%) do (
    (
        echo export function %%RFormatter^(data^) ^{
        echo    const formattedData = JSON.stringify^(data, null, 4^);
        echo    return ^`^<pre^>Formatted by %%RFormatter:^<br^>^${formattedData}^</pre^>^`;
        echo ^}
    ) > %%RFormatter.js
    echo Created: %%RFormatter.js
    (
        echo export { %%RFormatter } from './%%RFormatter.js';
    ) >> %INDEX_FILE%
)

echo Created: %INDEX_FILE%

endlocal
