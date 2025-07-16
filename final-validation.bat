@echo off
echo ===============================================
echo    FINAL VALIDATION - CLEAN ARCHITECTURE
echo ===============================================
echo.

cd /d "e:\ThucTap\QLDT\qldt"


npx tsc --noEmit --skipLibCheck --pretty
set TS_RESULT=%errorlevel%

echo.

REM 2. ESLint Check
echo [33m2. ESLint validation...[0m
npx next lint --quiet
set ESLINT_RESULT=%errorlevel%

echo.
