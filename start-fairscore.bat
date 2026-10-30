@echo off
setlocal

cd /d "%~dp0"

if not exist "apps\api\.venv\Scripts\python.exe" (
  echo FairScore backend environment is missing.
  echo Run the first-time setup command before starting FairScore.
  pause
  exit /b 1
)

if not exist "node_modules" (
  echo FairScore frontend dependencies are missing.
  echo Run npm install from: %~dp0
  pause
  exit /b 1
)

echo.
echo Starting FairScore in this window...
echo Frontend: http://localhost:3000
echo Backend:  http://localhost:8000
echo API docs: http://localhost:8000/docs
echo Press Ctrl+C to stop both servers.
echo.

call ".\node_modules\.bin\concurrently.cmd" --kill-others --names "API,WEB" --prefix-colors "red,cyan" "cd apps/api && .venv\Scripts\python.exe -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000" "npm run dev --workspace web"

