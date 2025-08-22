@echo off
echo Starting Claude Flow Docker environment...
docker compose up -d
if %errorlevel% neq 0 (
    echo ERROR: Failed to start Claude Flow
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
echo.
pause