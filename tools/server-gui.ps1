# SoCal Pressure Tracker - Server Control GUI
# Small WinForms launcher to start/stop the Next.js server.
# Launch via tools\server-gui.bat (needs -STA for WinForms).

Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing
[System.Windows.Forms.Application]::EnableVisualStyles()

$RepoRoot = Split-Path -Parent $PSScriptRoot
$AppUrl   = 'http://localhost:3000'
$MaxLogLines = 2000
$ServerLogPath = Join-Path $env:TEMP 'socal-pressure-server.log'
$CrashLogPath  = Join-Path $env:TEMP 'socal-pressure-gui-crash.log'

# ---------- shared state ----------
$script:Proc = $null
$script:State = 'Stopped'  # Stopped | Starting | Running | Stopping | Error
$script:LogPos = 0         # byte offset into $ServerLogPath we've consumed

# ---------- crash logging ----------
# If the GUI dies from an unhandled exception, leave a breadcrumb so we can
# tell why instead of just "the window disappeared."
function Write-Crash([string]$source, $err) {
    try {
        $stamp = (Get-Date).ToString('o')
        "[$stamp] $source`n$err`n" | Out-File -FilePath $CrashLogPath -Append -Encoding utf8
    } catch { }
}
[System.Windows.Forms.Application]::add_ThreadException({
    param($s, $e) Write-Crash 'ThreadException' $e.Exception
})
[System.AppDomain]::CurrentDomain.add_UnhandledException({
    param($s, $e) Write-Crash 'UnhandledException' $e.ExceptionObject
})

# ---------- form ----------
$form = New-Object System.Windows.Forms.Form
$form.Text = 'SoCal Pressure Tracker - Server Control'
$form.Size = New-Object System.Drawing.Size(640, 480)
$form.MinimumSize = New-Object System.Drawing.Size(520, 360)
$form.StartPosition = 'CenterScreen'
$form.Font = New-Object System.Drawing.Font('Segoe UI', 9)

# Status row
$statusDot = New-Object System.Windows.Forms.Label
$statusDot.Text = [char]0x25CF  # bullet
$statusDot.Font = New-Object System.Drawing.Font('Segoe UI', 14, [System.Drawing.FontStyle]::Bold)
$statusDot.ForeColor = [System.Drawing.Color]::Gray
$statusDot.Location = New-Object System.Drawing.Point(12, 10)
$statusDot.Size = New-Object System.Drawing.Size(22, 26)

$statusLabel = New-Object System.Windows.Forms.Label
$statusLabel.Text = 'Stopped'
$statusLabel.Location = New-Object System.Drawing.Point(34, 16)
$statusLabel.Size = New-Object System.Drawing.Size(160, 20)

$modeLabel = New-Object System.Windows.Forms.Label
$modeLabel.Text = 'Mode:'
$modeLabel.Location = New-Object System.Drawing.Point(210, 16)
$modeLabel.Size = New-Object System.Drawing.Size(40, 20)

$devRadio = New-Object System.Windows.Forms.RadioButton
$devRadio.Text = 'Dev'
$devRadio.Checked = $true
$devRadio.Location = New-Object System.Drawing.Point(252, 14)
$devRadio.Size = New-Object System.Drawing.Size(55, 22)

$prodRadio = New-Object System.Windows.Forms.RadioButton
$prodRadio.Text = 'Prod'
$prodRadio.Location = New-Object System.Drawing.Point(310, 14)
$prodRadio.Size = New-Object System.Drawing.Size(60, 22)

# Buttons
$startBtn = New-Object System.Windows.Forms.Button
$startBtn.Text = 'Start'
$startBtn.Location = New-Object System.Drawing.Point(12, 44)
$startBtn.Size = New-Object System.Drawing.Size(90, 30)

$stopBtn = New-Object System.Windows.Forms.Button
$stopBtn.Text = 'Stop'
$stopBtn.Enabled = $false
$stopBtn.Location = New-Object System.Drawing.Point(108, 44)
$stopBtn.Size = New-Object System.Drawing.Size(90, 30)

$openBtn = New-Object System.Windows.Forms.Button
$openBtn.Text = 'Open in Browser'
$openBtn.Location = New-Object System.Drawing.Point(204, 44)
$openBtn.Size = New-Object System.Drawing.Size(130, 30)

$clearBtn = New-Object System.Windows.Forms.Button
$clearBtn.Text = 'Clear Log'
$clearBtn.Location = New-Object System.Drawing.Point(340, 44)
$clearBtn.Size = New-Object System.Drawing.Size(90, 30)

# Log box
$logBox = New-Object System.Windows.Forms.RichTextBox
$logBox.Location = New-Object System.Drawing.Point(12, 84)
$logBox.Size = New-Object System.Drawing.Size(600, 340)
$logBox.ReadOnly = $true
$logBox.BackColor = [System.Drawing.Color]::Black
$logBox.ForeColor = [System.Drawing.Color]::Gainsboro
$logBox.Font = New-Object System.Drawing.Font('Consolas', 9)
$logBox.DetectUrls = $false
$logBox.WordWrap = $false
$logBox.ScrollBars = 'Both'
$logBox.Anchor = 'Top,Bottom,Left,Right'

$openBtn.Anchor = 'Top,Left'
$clearBtn.Anchor = 'Top,Left'
$statusLabel.Anchor = 'Top,Left'

$form.Controls.AddRange(@($statusDot, $statusLabel, $modeLabel, $devRadio, $prodRadio, $startBtn, $stopBtn, $openBtn, $clearBtn, $logBox))

# Timer polls the server log file so we don't rely on a process pipe
# that would block the server if this GUI ever died.
$logTimer = New-Object System.Windows.Forms.Timer
$logTimer.Interval = 300
$logTimer.add_Tick({ Read-LogTail })

# ---------- helpers ----------
function Set-State([string]$next) {
    $script:State = $next
    $color = switch ($next) {
        'Running'  { [System.Drawing.Color]::LimeGreen }
        'Starting' { [System.Drawing.Color]::Goldenrod }
        'Stopping' { [System.Drawing.Color]::Goldenrod }
        'Error'    { [System.Drawing.Color]::Firebrick }
        default    { [System.Drawing.Color]::Gray }
    }
    $statusDot.ForeColor = $color
    $statusLabel.Text = $next

    $running = ($next -eq 'Running' -or $next -eq 'Starting')
    $startBtn.Enabled = -not $running -and ($next -ne 'Stopping')
    $stopBtn.Enabled  = $running
    $devRadio.Enabled = -not $running
    $prodRadio.Enabled = -not $running
}

function Append-Log([string]$line) {
    if ($null -eq $line) { return }
    # Strip common ANSI escape sequences (Next.js/Turbopack color codes)
    $clean = [regex]::Replace($line, "\x1B\[[0-9;?]*[A-Za-z]", '')

    # Auto-scroll only if caret is already near the bottom
    $atBottom = ($logBox.SelectionStart -ge ($logBox.TextLength - 2))

    $logBox.AppendText($clean + "`r`n")

    # Cap lines
    if ($logBox.Lines.Count -gt $MaxLogLines) {
        $trim = $logBox.Lines.Count - $MaxLogLines
        $cut = 0
        for ($i = 0; $i -lt $trim; $i++) { $cut += $logBox.Lines[$i].Length + 1 }
        $logBox.Select(0, $cut)
        $logBox.SelectedText = ''
    }

    if ($atBottom) {
        $logBox.SelectionStart = $logBox.TextLength
        $logBox.ScrollToCaret()
    }
}

function Safe-UI([scriptblock]$block) {
    if ($form.IsHandleCreated -and $form.InvokeRequired) {
        $form.BeginInvoke([Action]$block) | Out-Null
    } else {
        & $block
    }
}

function Start-ServerProcess([string]$npmScript) {
    # Truncate the log file so each run starts fresh.
    '' | Out-File -FilePath $ServerLogPath -Encoding utf8 -Force
    $script:LogPos = 0

    # Redirect stdout/stderr INSIDE cmd (> file 2>&1) rather than through a
    # .NET pipe. If the GUI dies, the child keeps writing to a real file and
    # never blocks on a broken pipe. The GUI tails the file on a timer.
    $psi = New-Object System.Diagnostics.ProcessStartInfo
    $psi.FileName = 'cmd.exe'
    $escLog = $ServerLogPath -replace '"', '""'
    $psi.Arguments = "/c npm run $npmScript > `"$escLog`" 2>&1"
    $psi.WorkingDirectory = $RepoRoot
    $psi.UseShellExecute = $false
    $psi.RedirectStandardOutput = $false
    $psi.RedirectStandardError = $false
    $psi.CreateNoWindow = $true
    $psi.EnvironmentVariables['FORCE_COLOR'] = '0'
    $psi.EnvironmentVariables['NO_COLOR'] = '1'

    $p = New-Object System.Diagnostics.Process
    $p.StartInfo = $psi
    $p.EnableRaisingEvents = $true

    $p.add_Exited({
        param($s, $e)
        Safe-UI {
            $code = try { $s.ExitCode } catch { -1 }
            Read-LogTail
            Append-Log "[process exited with code $code]"
            $logTimer.Stop()
            $script:Proc = $null
            if ($script:State -ne 'Stopping' -and $code -ne 0) {
                Set-State 'Error'
            } else {
                Set-State 'Stopped'
            }
        }
    })

    [void]$p.Start()
    $script:Proc = $p
    $logTimer.Start()
}

function Read-LogTail {
    if (-not (Test-Path $ServerLogPath)) { return }
    try {
        # Open with FileShare::ReadWrite so cmd can keep writing while we read.
        $fs = [System.IO.File]::Open($ServerLogPath, [System.IO.FileMode]::Open, [System.IO.FileAccess]::Read, [System.IO.FileShare]::ReadWrite)
        try {
            if ($fs.Length -lt $script:LogPos) {
                # File was truncated (new Start). Reset.
                $script:LogPos = 0
            }
            if ($fs.Length -gt $script:LogPos) {
                [void]$fs.Seek($script:LogPos, [System.IO.SeekOrigin]::Begin)
                $sr = New-Object System.IO.StreamReader($fs, [System.Text.Encoding]::UTF8)
                $chunk = $sr.ReadToEnd()
                $script:LogPos = $fs.Position
                if ($chunk) {
                    foreach ($line in ($chunk -split "`r?`n")) {
                        if ($line.Length -gt 0) {
                            Append-Log $line
                            if ($script:State -eq 'Starting' -and ($line -match 'Ready in|started server on|Local:\s+http')) {
                                Set-State 'Running'
                            }
                        }
                    }
                }
            }
        } finally {
            $fs.Dispose()
        }
    } catch {
        # Swallow transient I/O errors — next tick will retry.
    }
}

function Stop-ServerProcess {
    if ($null -eq $script:Proc) { return }
    Set-State 'Stopping'
    $pidToKill = $script:Proc.Id
    try {
        # Tree-kill: npm spawns node; plain Stop-Process leaves the child running.
        Start-Process -FilePath 'taskkill.exe' -ArgumentList "/PID $pidToKill /T /F" -WindowStyle Hidden -Wait
    } catch {
        Append-Log "[stop error: $($_.Exception.Message)]"
    }
}

# ---------- event wiring ----------
$startBtn.Add_Click({
    if ($script:State -eq 'Running' -or $script:State -eq 'Starting') { return }

    $mode = if ($devRadio.Checked) { 'dev' } else { 'prod' }

    if ($mode -eq 'prod') {
        $buildId = Join-Path $RepoRoot '.next\BUILD_ID'
        if (-not (Test-Path $buildId)) {
            $ans = [System.Windows.Forms.MessageBox]::Show(
                "No production build found (.next\BUILD_ID missing). Run 'npm run build' first?",
                'Build required',
                [System.Windows.Forms.MessageBoxButtons]::YesNo,
                [System.Windows.Forms.MessageBoxIcon]::Question)
            if ($ans -ne [System.Windows.Forms.DialogResult]::Yes) { return }
            Append-Log '[running npm run build ...]'
            Set-State 'Starting'
            # Redirect to the same log file via cmd-level redirection so we
            # never hold a stdout pipe to the child. Pump the GUI and tail
            # the file while we wait for cmd to exit.
            '' | Out-File -FilePath $ServerLogPath -Encoding utf8 -Force
            $script:LogPos = 0
            $buildPsi = New-Object System.Diagnostics.ProcessStartInfo
            $buildPsi.FileName = 'cmd.exe'
            $escBuildLog = $ServerLogPath -replace '"', '""'
            $buildPsi.Arguments = "/c npm run build > `"$escBuildLog`" 2>&1"
            $buildPsi.WorkingDirectory = $RepoRoot
            $buildPsi.UseShellExecute = $false
            $buildPsi.CreateNoWindow = $true
            $buildPsi.EnvironmentVariables['FORCE_COLOR'] = '0'
            $buildPsi.EnvironmentVariables['NO_COLOR'] = '1'
            $buildProc = [System.Diagnostics.Process]::Start($buildPsi)
            while (-not $buildProc.HasExited) {
                Read-LogTail
                [System.Windows.Forms.Application]::DoEvents()
                Start-Sleep -Milliseconds 150
            }
            Read-LogTail
            if ($buildProc.ExitCode -ne 0) {
                Append-Log "[build failed: exit $($buildProc.ExitCode)]"
                Set-State 'Error'
                return
            }
            Append-Log '[build ok]'
        }
    }

    Append-Log "[starting: npm run $(if($mode -eq 'prod'){'start'}else{'dev'})]"
    Set-State 'Starting'
    try {
        Start-ServerProcess $(if ($mode -eq 'prod') { 'start' } else { 'dev' })
    } catch {
        Append-Log "[start error: $($_.Exception.Message)]"
        Set-State 'Error'
    }
})

$stopBtn.Add_Click({ Stop-ServerProcess })

$openBtn.Add_Click({
    try { Start-Process $AppUrl } catch { Append-Log "[open error: $($_.Exception.Message)]" }
})

$clearBtn.Add_Click({ $logBox.Clear() })

$form.Add_FormClosing({
    param($sender, $e)
    if ($null -ne $script:Proc) {
        $ans = [System.Windows.Forms.MessageBox]::Show(
            'Server is still running. Stop it and exit?',
            'Confirm exit',
            [System.Windows.Forms.MessageBoxButtons]::YesNo,
            [System.Windows.Forms.MessageBoxIcon]::Warning)
        if ($ans -ne [System.Windows.Forms.DialogResult]::Yes) {
            $e.Cancel = $true
            return
        }
        Stop-ServerProcess
        # Give taskkill a moment so the Exited handler runs cleanly.
        Start-Sleep -Milliseconds 250
    }
})

Set-State 'Stopped'
Append-Log "[repo: $RepoRoot]"
Append-Log "[server log: $ServerLogPath]"
Append-Log "[crash log if GUI fails: $CrashLogPath]"
try {
    [void]$form.ShowDialog()
} catch {
    Write-Crash 'ShowDialog' $_
    throw
}
