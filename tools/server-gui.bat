@echo off
REM Launcher for the server control GUI.
REM -STA is required for WinForms; -ExecutionPolicy Bypass avoids needing to sign the script.
set "SCRIPT_DIR=%~dp0"
powershell.exe -NoProfile -STA -ExecutionPolicy Bypass -WindowStyle Hidden -File "%SCRIPT_DIR%server-gui.ps1"
