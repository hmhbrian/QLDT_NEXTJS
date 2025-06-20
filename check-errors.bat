@echo off
echo === KIEM TRA LOI TOAN BO PROJECT ===

cd /d "e:\ThucTap\QLDT\qldt"

echo.
echo 1. Kiem tra TypeScript...
npx tsc --noEmit
if %errorlevel% equ 0 (
    echo [32m✅ TypeScript: Khong co loi[0m
) else (
    echo [31m❌ TypeScript: Co loi[0m
)

echo.
echo 2. Kiem tra ESLint Next.js...
if "%1"=="--fix" (
    npx next lint --fix
    echo [32mDa tu dong sua cac loi co the sua duoc[0m
)
npx next lint
if %errorlevel% equ 0 (
    echo [32m✅ ESLint: Khong co loi[0m
) else (
    echo [31m❌ ESLint: Co loi xem chi tiet o tren[0m
)

echo.
echo 3. Kiem tra Build Frontend...
npm run build
if %errorlevel% equ 0 (
    echo [32m✅ Build Frontend: Thanh cong[0m
) else (
    echo [31m❌ Build Frontend: That bai[0m
)

echo.
echo 4. Kiem tra Build Backend...
cd /d "e:\ThucTap\BE\QLDT_BECAMEX_BE"
dotnet build
if %errorlevel% equ 0 (
    echo [32m✅ Build Backend: Thanh cong[0m
) else (
    echo [31m❌ Build Backend: That bai[0m
)

echo.
echo === KET THUC KIEM TRA ===
echo Su dung: check-errors.bat --fix de tu dong sua loi ESLint
pause
