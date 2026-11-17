@echo off
setlocal
cd /d "%~dp0client"
where node >nul 2>&1
if errorlevel 1 (
  echo Node.js is not installed or is not available in PATH.
  pause
  exit /b 1
)
if not exist node_modules (
  call npm install
  if errorlevel 1 goto failed
)
call npm run build
if errorlevel 1 goto failed
echo.
echo Build completed successfully. Upload the client folder through Cloudflare Pages.
pause
exit /b 0
:failed
echo.
echo Build did not complete. Read the error above and fix it before deployment.
pause
exit /b 1
