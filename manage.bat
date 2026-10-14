@echo off
setlocal enabledelayedexpansion

:: Ensure working directory is the app directory containing package.json
if exist "%~dp0package.json" (
    cd /d "%~dp0"
) else if exist "%~dp0app\package.json" (
    cd /d "%~dp0app"
)

:: Check for CLI arguments
if "%~1" == "setup" goto do_setup
if "%~1" == "demo" goto start_demo
if "%~1" == "prod" goto start_demo
if "%~1" == "dev" goto start_dev
if "%~1" == "studio" goto start_studio
if "%~1" == "reset-db" goto do_reset_db
if "%~1" == "stop" goto stop
if "%~1" == "restart" goto restart_dev

:menu
cls
echo ==============================================================
echo   🏛️  Cabanatuan City Ordinance Portal - Local Manager
echo ==============================================================
echo.
echo   Local Portal  : http://localhost:3000
echo   Prisma Studio : http://localhost:5555
echo   Database      : Local SQLite (prisma/dev.db)
echo.
echo   [1] Run One-Command Setup (npm run db:setup)
echo   [2] Build & Launch Live Demo (Production Mode :3000)
echo   [3] Start in Development Mode (npm run dev)
echo   [4] Open Prisma Studio (Database GUI on :5555)
echo   [5] Reset Local Database (Deletes dev.db & re-seeds)
echo   [6] Stop All Active Servers (:3000 & :5555)
echo   [7] Exit
echo.
set /p choice="Select an option [1-7]: "

if "%choice%"=="1" goto do_setup
if "%choice%"=="2" goto start_demo
if "%choice%"=="3" goto start_dev
if "%choice%"=="4" goto start_studio
if "%choice%"=="5" goto do_reset_db
if "%choice%"=="6" goto stop
if "%choice%"=="7" exit /b 0
goto menu

:do_setup
echo.
echo ==============================================================
echo [+] Running 100%% Local Setup (Prisma Generate + Push + Seed)...
echo ==============================================================
call npm run db:setup
if %ERRORLEVEL% NEQ 0 (
    echo [!] Setup encountered an error! Check the console output above.
) else (
    echo [*] Setup completed successfully! Local SQLite database ready.
)
echo.
if "%~1" == "" pause && goto menu
exit /b %ERRORLEVEL%

:start_demo
echo.
echo ==============================================================
echo [+] Starting Cabanatuan City Ordinance Portal in Production Demo Mode
echo ==============================================================
echo [*] Step 1/2: Building optimized production bundle...
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo [!] Build failed! Please check the error log above.
    pause
    goto menu
)
echo.
echo [*] Step 2/2: Launching Production Server on http://localhost:3000...
start "Cabanatuan Ordinance Portal (Demo - :3000)" cmd /c "npm run start"
echo [*] Server is now running on http://localhost:3000 in a separate window.
echo.
if "%~1" == "" pause && goto menu
exit /b 0

:start_dev
echo.
echo [+] Starting Cabanatuan City Ordinance Portal in Development Mode...
start "Cabanatuan Ordinance Portal (Dev - :3000)" cmd /c "npm run dev"
echo [*] Server starting on http://localhost:3000 in a new window.
echo.
if "%~1" == "" pause && goto menu
exit /b 0

:start_studio
echo.
echo [+] Launching Prisma Studio Database Manager...
start "Prisma Studio (:5555)" cmd /c "npm run db:studio"
echo [*] Prisma Studio is opening on http://localhost:5555.
echo.
if "%~1" == "" pause && goto menu
exit /b 0

:do_reset_db
echo.
echo ==============================================================
echo [!] WARNING: LOCAL DATABASE RESET CONFIRMATION
echo ==============================================================
echo This will delete the local SQLite database file (prisma\dev.db)
echo and re-run prisma db:setup with fresh seed accounts and data.
echo Remote databases will NEVER be touched.
echo.
set /p confirm="Are you sure you want to reset the local database? (y/N): "
if /i not "!confirm!"=="y" (
    echo [*] Database reset cancelled.
    if "%~1" == "" pause && goto menu
    exit /b 0
)

echo.
echo [-] Deleting local SQLite database files...
if exist "prisma\dev.db" del /f /q "prisma\dev.db"
if exist "prisma\dev.db-journal" del /f /q "prisma\dev.db-journal"
if exist "prisma\dev.db-shm" del /f /q "prisma\dev.db-shm"
if exist "prisma\dev.db-wal" del /f /q "prisma\dev.db-wal"
echo [*] Local database files deleted.
echo.
echo [+] Re-initializing database with db:setup...
call npm run db:setup
echo [*] Local database successfully reset and seeded!
echo.
if "%~1" == "" pause && goto menu
exit /b 0

:stop
echo.
echo [-] Stopping all active portal servers...
set "found=0"

:: Kill process listening on port 3000 (Next.js App)
for /f "tokens=5" %%p in ('netstat -aon ^| findstr :3000 ^| findstr LISTENING') do (
    taskkill /F /T /PID %%p >nul 2>&1
    set "found=1"
)

:: Kill process listening on port 5555 (Prisma Studio)
for /f "tokens=5" %%p in ('netstat -aon ^| findstr :5555 ^| findstr LISTENING') do (
    taskkill /F /T /PID %%p >nul 2>&1
    set "found=1"
)

if "!found!"=="0" (
    echo [*] No active portal servers found on ports 3000 or 5555.
) else (
    echo [*] Successfully stopped all portal servers.
)
echo.
if "%~1" == "" pause && goto menu
exit /b 0

:restart_dev
echo.
echo [*] Restarting Development Server...
for /f "tokens=5" %%p in ('netstat -aon ^| findstr :3000 ^| findstr LISTENING') do (taskkill /F /T /PID %%p >nul 2>&1)
for /f "tokens=5" %%p in ('netstat -aon ^| findstr :5555 ^| findstr LISTENING') do (taskkill /F /T /PID %%p >nul 2>&1)
timeout /t 2 >nul
goto start_dev
