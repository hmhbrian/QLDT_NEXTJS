@echo off
echo === TU DONG SUA LOI ===

cd /d "e:\ThucTap\QLDT\qldt"

echo.
echo 1. Sua loi ESLint...
npx next lint --fix
echo [32m✅ Da sua cac loi ESLint co the tu dong sua[0m

echo.
echo 2. Kiem tra lai...
npx next lint --quiet
if %errorlevel% equ 0 (
    echo [32m✅ Khong con loi ESLint[0m
) else (
    echo [33m⚠️ Con mot so loi can sua thu cong[0m
    echo [37mChay: npx next lint de xem chi tiet[0m
)

echo.
echo === HOAN THANH ===
pause
