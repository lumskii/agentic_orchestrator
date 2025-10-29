@echo off
REM Quick Start Script for Windows
REM Agentic Orchestrator Setup

echo.
echo ========================================
echo Agentic Orchestrator - Quick Start
echo ========================================
echo.

REM Check Node.js
echo [1/5] Checking prerequisites...
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js is not installed. Please install Node.js 18+ first.
    exit /b 1
)
echo [OK] Node.js detected
node --version

REM Install dependencies
echo.
echo [2/5] Installing dependencies...
call npm run install:all
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to install dependencies
    exit /b 1
)

REM Setup environment
echo.
echo [3/5] Setting up environment...
if not exist .env (
    copy .env.example .env
    echo [OK] Created .env file - please configure it
) else (
    echo [OK] .env file already exists
)

REM Check Docker
echo.
echo [4/5] Checking Docker...
where docker >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo [OK] Docker detected
    echo      To start PostgreSQL: cd docker ^&^& docker-compose up -d
) else (
    echo [WARN] Docker not found - provide your own PostgreSQL
)

REM Done
echo.
echo [5/5] Setup complete!
echo.
echo ========================================
echo Next Steps:
echo ========================================
echo.
echo 1. Edit .env file with your credentials
echo 2. Start PostgreSQL (Docker or your own)
echo 3. Initialize database: psql %DATABASE_URL% -f scripts\enableSearch.sql
echo 4. Seed data: cd server ^&^& npm run seed
echo 5. Start servers: npm run dev
echo.
echo Application URLs:
echo   Frontend: http://localhost:3000
echo   Backend:  http://localhost:3001
echo.
echo See README.md for detailed documentation
echo See SETUP_COMPLETE.md for next steps
echo.
pause
