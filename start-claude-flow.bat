@echo off
REM Claude Flow Production Starter for Windows
echo Starting Claude Flow Docker environment...
echo ==========================================

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
        echo IMPORTANT: Please edit .env file and set your GITHUB_TOKEN
        notepad .env
        echo Please save the file and run this script again
        pause
        exit /b 0
    ) else (
        echo ERROR: .env.example not found
        echo Please run this script from the Claude Flow root directory
        pause
        exit /b 1
    )
)

REM Pull latest images
echo Pulling latest Docker images...
docker compose pull

REM Start services
echo Starting Claude Flow services...
docker compose up -d
if %errorlevel% neq 0 (
    echo ERROR: Failed to start Claude Flow
    echo.
    echo Troubleshooting steps:
    echo 1. Check if ports 3000, 3001, 6379 are available
    echo 2. Verify your .env file configuration
    echo 3. Check Docker Desktop is running and has sufficient resources
    echo 4. Run: docker compose logs claude-flow
    echo.
    pause
    exit /b 1
)

echo.
echo Claude Flow started successfully!
echo.
echo Services:
docker compose ps
echo.
echo Access Claude Flow at: http://localhost:3000
echo View logs: docker compose logs -f
echo Stop services: stop-claude-flow.bat
echo.
pause