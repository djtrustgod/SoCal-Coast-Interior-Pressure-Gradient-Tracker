# Creates a Desktop shortcut that launches the server GUI.
# Windows 11 won't pin a .bat directly, so the shortcut targets powershell.exe
# (which IS pinnable) and passes our .ps1 as -File. After running this once,
# right-click the Desktop shortcut -> "Show more options" -> "Pin to taskbar".

$ErrorActionPreference = 'Stop'

$ToolsDir   = $PSScriptRoot
$RepoRoot   = Split-Path -Parent $ToolsDir
$TargetPs1  = Join-Path $ToolsDir 'server-gui.ps1'

if (-not (Test-Path $TargetPs1)) {
    throw "Cannot find $TargetPs1. Run this from the tools/ directory."
}

$Desktop    = [Environment]::GetFolderPath('Desktop')
$LinkPath   = Join-Path $Desktop 'SoCal Pressure Server.lnk'
$IconPath   = Join-Path $RepoRoot 'public\favicon.ico'

$PwshExe = Join-Path $env:WINDIR 'System32\WindowsPowerShell\v1.0\powershell.exe'

$shell = New-Object -ComObject WScript.Shell
$lnk   = $shell.CreateShortcut($LinkPath)
$lnk.TargetPath       = $PwshExe
$lnk.Arguments        = "-NoProfile -STA -ExecutionPolicy Bypass -WindowStyle Hidden -File `"$TargetPs1`""
$lnk.WorkingDirectory = $RepoRoot
$lnk.Description      = 'Start/stop the SoCal Pressure Tracker Next.js server'
$lnk.WindowStyle      = 7   # Minimized (the GUI window opens from the script itself)
if (Test-Path $IconPath) {
    $lnk.IconLocation = "$IconPath,0"
}
$lnk.Save()

Write-Host "Created shortcut: $LinkPath" -ForegroundColor Green
Write-Host ''
Write-Host 'Next steps to pin to taskbar:' -ForegroundColor Cyan
Write-Host '  1. Find "SoCal Pressure Server" on your Desktop'
Write-Host '  2. Right-click it -> "Show more options" -> "Pin to taskbar"'
Write-Host '  3. (Optional) Right-click -> Properties -> Change Icon... to customize'
