@echo off
cd /d "C:\Users\feras\Desktop\feras"
git add . >nul 2>&1
git commit -m "save: %date% %time%" >nul 2>&1
echo [Saved] %date% %time%
pause
