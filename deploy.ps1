# سكربت نشر المشروع على Vercel
# الاستخدام: .\deploy.ps1

$ErrorActionPreference = "Stop"

Write-Host "1. بناء المشروع..." -ForegroundColor Cyan
Push-Location apps\web
node ..\..\node_modules\vite\bin\vite.js build
if ($LASTEXITCODE -ne 0) {
    Write-Host "فشل البناء!" -ForegroundColor Red
    Pop-Location
    exit 1
}
Pop-Location

Write-Host "2. نشر dist على Vercel..." -ForegroundColor Cyan
Push-Location apps\web
$env:VERCEL_PROJECT_ID = "prj_YdO1WzgpfvhVvUUieVLwTjJbFpZe"
$env:VERCEL_ORG_ID = "team_AxzkGv6j3H6wXz6BZ5q66N4I"
npx vercel deploy dist --prod --yes
Pop-Location

Write-Host ""
Write-Host "تم النشر! الرابط الثابت: https://dist-eight-nu-90.vercel.app" -ForegroundColor Green
