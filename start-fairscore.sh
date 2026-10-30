#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

PYTHON_BIN=""
if [ -x "apps/api/.venv/bin/python" ]; then
  PYTHON_BIN="apps/api/.venv/bin/python"
elif [ -x ".venv/bin/python" ]; then
  PYTHON_BIN=".venv/bin/python"
else
  echo "FairScore backend virtual environment is missing."
  echo "Run the following commands first:"
  echo "  python3 -m venv apps/api/.venv"
  echo "  apps/api/.venv/bin/pip install -r apps/api/requirements.txt"
  exit 1
fi

if [ ! -d "node_modules" ]; then
  echo "FairScore frontend dependencies are missing."
  echo "Run: npm install"
  exit 1
fi

echo ""
echo "Starting FairScore..."
echo "  Frontend: http://localhost:3000"
echo "  Backend:  http://localhost:8000"
echo "  API docs: http://localhost:8000/docs"
echo "Press Ctrl+C to stop both servers."
echo ""

npx concurrently --kill-others --names "API,WEB" --prefix-colors "red,cyan" \
  "cd apps/api && ../../$PYTHON_BIN -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000" \
  "npm run dev --workspace web"
