@echo off
echo ===============================================
echo    🎯 FINAL VALIDATION - CLEAN ARCHITECTURE
echo ===============================================
echo.

cd /d "e:\ThucTap\QLDT\qldt"

echo [36m📋 Running comprehensive checks...[0m
echo.

REM 1. TypeScript Check
echo [33m1. TypeScript compilation...[0m
npx tsc --noEmit --skipLibCheck --pretty
set TS_RESULT=%errorlevel%

echo.

REM 2. ESLint Check
echo [33m2. ESLint validation...[0m
npx next lint --quiet
set ESLINT_RESULT=%errorlevel%

echo.

REM 3. Build Test
echo [33m3. Build test...[0m
npm run build > nul 2>&1
set BUILD_RESULT=%errorlevel%

echo.

REM Summary
echo ===============================================
echo    📊 VALIDATION RESULTS
echo ===============================================

if %TS_RESULT% equ 0 (
    echo [32m✅ TypeScript: PASSED[0m
) else (
    echo [31m❌ TypeScript: FAILED[0m
)

if %ESLINT_RESULT% equ 0 (
    echo [32m✅ ESLint: PASSED[0m
) else (
    echo [31m❌ ESLint: FAILED[0m
)

if %BUILD_RESULT% equ 0 (
    echo [32m✅ Build: PASSED[0m
) else (
    echo [31m❌ Build: FAILED[0m
)

echo.

if %TS_RESULT% equ 0 if %ESLINT_RESULT% equ 0 if %BUILD_RESULT% equ 0 (
    echo [32m🎉 ALL CHECKS PASSED![0m
    echo [32m✨ Clean Architecture implementation successful![0m
    echo.
    echo [36m📁 New structure is ready:[0m
    echo [37m   ├── src/lib/core/           # ✅ Core business logic[0m
    echo [37m   ├── src/lib/services/modern/ # ✅ Unified services[0m
    echo [37m   └── Legacy files can be removed safely[0m
    echo.
    echo [36m🚀 Next steps:[0m
    echo [37m   1. Migrate remaining services to modern/[0m
    echo [37m   2. Update component imports[0m
    echo [37m   3. Remove legacy files[0m
) else (
    echo [31m❌ VALIDATION FAILED[0m
    echo [37mPlease fix the issues above before proceeding[0m
)

echo.
echo ===============================================
pause
