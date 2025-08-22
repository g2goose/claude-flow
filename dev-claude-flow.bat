@echo off
REM Claude Flow Development Environment Starter for Windows
echo Starting Claude Flow Development Environment...
echo ================================================

REM Check if Docker is running
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Docker is not running or not accessible
    echo Please start Docker Desktop and try again
    pause
    exit /b 1
)

REM Check if .env file exists
if not exist .env (
    echo WARNING: .env file not found
    echo Creating .env from template...
    if exist .env.example (
        copy .env.example .env
        echo Please edit .env file and set your GITHUB_TOKEN
        notepad .env
    ) else (
        echo ERROR: .env.example not found
        pause
        exit /b 1
    )
)

echo Starting development environment with hot reload...
docker compose --profile development up -d --build

if %errorlevel% neq 0 (
    echo ERROR: Failed to start Claude Flow development environment
    echo Check the logs for more details
    pause
    exit /b 1
)

echo.
echo Development environment started successfully!
echo.
echo Services:
docker compose ps
echo.
echo Access URLs:
echo   Claude Flow:     http://localhost:3000
echo   MCP Server:      http://localhost:3001
echo   Debug Port:      localhost:9229
echo.
echo Useful commands:
echo   View logs:       docker compose logs -f claude-flow-dev
echo   Stop services:   docker compose down
echo   Restart:         docker compose restart claude-flow-dev
echo.
pause