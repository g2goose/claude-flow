@echo off
echo Claude Flow Logs:
echo Press Ctrl+C to exit log viewing
echo.
docker compose logs -f claude-flow
pause