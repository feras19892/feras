@echo off
REM Launcher: opens Git Bash and starts auto-save script
cd /d "C:\Users\feras\Desktop\feras"
"C:\Program Files\Git\bin\bash.exe" --login -i -c "bash toolbox/scripts/auto-save.sh"
pause
