@echo off
setlocal
cd /d "%~dp0"
where node >nul 2>&1
if errorlevel 1 (
  echo Node.js is not installed or is not available in PATH.
  echo Install the current Node.js LTS release, then reopen this file.
  pause
  exit /b 1
)
if not exist "client\.env" (
  copy "client\.env.example" "client\.env" >nul
  echo Created client\.env from the example.
  echo Add your Supabase URL and public publishable/anon key before using the app.
  notepad "client\.env"
  echo Save and close Notepad, then press any key to continue.
  pause >nul
)
pushd client
if not exist node_modules (
  echo Installing project dependencies. This may take a few minutes...
  call npm install
  if errorlevel 1 (
    echo Dependency installation failed. Check your internet connection and Node.js/npm installation.
    popd
    pause
    exit /b 1
  )
)
echo Starting InterviewCapture. Keep this terminal open while using the app.
call npm run dev
popd
pause
