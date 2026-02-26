@echo off
echo ========================================
echo   EduLearn - Automatic Setup
echo ========================================
echo.

echo Checking Node.js installation...
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed!
    echo Please install Node.js from: https://nodejs.org/
    echo.
    pause
    exit /b 1
)

echo Node.js found!
echo.

echo Checking if dependencies are installed...
if not exist "node_modules\" (
    echo Dependencies not found. Installing...
    echo This may take 2-5 minutes. Please wait...
    echo.
    echo Installing uuid package...
    call npm install uuid
    echo.
    echo Installing all dependencies...
    call npm install
    if errorlevel 1 (
        echo.
        echo ERROR: Installation failed!
        echo Please check your internet connection and try again.
        pause
        exit /b 1
    )
    echo.
    echo Installation complete!
) else (
    echo Dependencies already installed!
    echo Checking for uuid package...
    call npm install uuid
)

echo.
echo ========================================
echo   Starting EduLearn...
echo ========================================
echo.
echo Backend Server: http://localhost:3001
echo Frontend App: http://localhost:5173
echo.
echo Press Ctrl+C to stop the servers
echo.

call npm run dev:full
