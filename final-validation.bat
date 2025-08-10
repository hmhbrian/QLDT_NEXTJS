@echo off
echo ===============================================
echo    FINAL VALIDATION - CLEAN ARCHITECTURE
echo ===============================================
echo.

cd /d "e:\ThucTap\QLDT\qldt"


npx tsc --noEmit --skipLibCheck --pretty

npx next lint --quiet