@echo off
setlocal
echo ========================================================
echo 🌾 KisanVerify - Automatic Startup
echo ========================================================

cd /d "%~dp0"

if not exist "node_modules" (
    echo [KisanVerify] Dependencies missing. Running setup...
    call npm run setup
) else (
    if not exist "backend\.venv" (
        echo [KisanVerify] Python environment missing. Running setup...
        call npm run setup
    )
)

echo [KisanVerify] Starting backend, frontend and launching browser...
call npm start
