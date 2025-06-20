@echo off
echo === KIEM TRA NHANH ===

cd /d "e:\ThucTap\QLDT\qldt"

echo.
echo 1. TypeScript...
npx tsc --noEmit --pretty
if %errorlevel% equ 0 (
    echo [32m✅ TypeScript OK[0m
) else (
    echo [31m❌ TypeScript co loi[0m
)

echo.
echo 2. ESLint...
npx next lint --quiet
if %errorlevel% equ 0 (
    echo [32m✅ ESLint OK[0m
) else (
    echo [31m❌ ESLint co loi[0m
)

echo.
echo === HOAN THANH ===
pause
