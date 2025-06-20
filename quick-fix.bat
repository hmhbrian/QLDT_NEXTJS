@echo off
echo === QUICK FIX TYPESCRIPT ERRORS ===
echo.

cd /d "e:\ThucTap\QLDT\qldt"

echo [33mChecking TypeScript errors...[0m
npx tsc --noEmit --pretty --skipLibCheck

if %errorlevel% equ 0 (
    echo.
    echo [32m✅ No TypeScript errors found![0m
    echo.
    echo [36mRunning ESLint check...[0m
    npx next lint --quiet
    
    if %errorlevel% equ 0 (
        echo [32m✅ No ESLint errors found![0m
        echo.
        echo [32m🎉 ALL CHECKS PASSED![0m
    ) else (
        echo [33m⚠️  Some ESLint issues found.[0m
        echo [37mRun: npx next lint --fix to auto-fix[0m
    )
) else (
    echo.
    echo [31m❌ TypeScript errors found above[0m
    echo [37mPlease fix these errors first[0m
)

echo.
pause
