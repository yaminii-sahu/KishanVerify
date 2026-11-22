#!/usr/bin/env bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "========================================================"
echo "🌾 KisanVerify - Automatic Startup"
echo "========================================================"

if [ ! -d "node_modules" ] || [ ! -d "backend/.venv" ]; then
    echo "[KisanVerify] Dependencies missing. Running setup..."
    npm run setup
fi

echo "[KisanVerify] Starting backend, frontend and launching browser..."
npm start
