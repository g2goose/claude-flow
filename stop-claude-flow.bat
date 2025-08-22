@echo off
echo Stopping Claude Flow Docker environment...
docker compose down
if %errorlevel% neq 0 (
    echo ERROR: Failed to stop Claude Flow
    pause
    exit /b 1
)
echo.
echo Claude Flow stopped successfully!
echo.
pause