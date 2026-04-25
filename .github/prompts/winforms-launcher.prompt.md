# WinForms Server Launcher — Reusable Prompt

Use this prompt when creating a Windows GUI launcher for a new project, modeled after the one built for SoCal Pressure Tracker.

---

Create a Windows GUI launcher for this project using PowerShell + WinForms. Here's what it should include:

**Files to create (under `tools/`):**
- `server-gui.ps1` — the WinForms GUI script
- `server-gui.bat` — thin wrapper that launches the `.ps1` with `-STA -ExecutionPolicy Bypass -WindowStyle Hidden`
- `create-shortcut.ps1` — creates a Desktop `.lnk` shortcut that points to `powershell.exe -File server-gui.ps1` (so it's pinnable to the taskbar); uses the project's `public/favicon.ico` as the icon if it exists

**GUI layout (WinForms, `Segoe UI 9`, resizable `640×480` min `520×360`):**
- Status row: colored bullet dot (gray/green/gold/red) + state label (`Stopped` / `Starting` / `Running` / `Stopping` / `Error`), then **Dev / Prod** radio buttons
- Button row: **Start**, **Stop** (disabled when stopped), **Open in Browser**, **Clear Log**
- `RichTextBox` log panel (black bg, `Consolas 9`, ANSI-stripped, anchored to fill the window, capped at 2000 lines, auto-scrolls when near bottom)

**Behavior:**
- Server process launched via `cmd.exe /c npm run dev > logfile 2>&1` (file-redirect, never a .NET pipe) so the server keeps writing if the GUI dies
- A `System.Windows.Forms.Timer` (300 ms) tails the log file using `FileShare::ReadWrite`; detects the "ready" pattern (`Ready in|started server on|Local:\s+http`) to transition state to `Running`
- **Prod mode**: checks for `.next\BUILD_ID`; if missing, prompts to run `npm run build` first (builds synchronously with `DoEvents` pumping the GUI while tailing the same log file)
- **Stop**: uses `taskkill /PID <id> /T /F` (tree-kill, because npm spawns a child node process)
- **Close with server running**: confirmation dialog; cancels close if user says No
- Crash logging: unhandled GUI exceptions written to `%TEMP%\<appname>-gui-crash.log`
- Server log at `%TEMP%\<appname>-server.log`, truncated fresh on each Start
- On launch, appends repo root, log paths, and crash log path to the log panel

**Adapt these values for the new project:**
- App name / window title
- `$AppUrl` (e.g., `http://localhost:<port>`)
- The "ready" regex pattern if the framework logs something different than Next.js's `Ready in`
- The shortcut name and description strings
- The prod-mode build check artifact (`.next\BUILD_ID` is Next.js-specific — use whatever your framework produces)

Keep the logic structure identical to the reference; only change names, paths, port, and framework-specific details.

---

## Reference implementation

See `tools/server-gui.ps1`, `tools/server-gui.bat`, and `tools/create-shortcut.ps1` in the
[SoCal-Coast-Interior-Pressure-Gradient-Tracker](https://github.com/djtru/SoCal-Coast-Interior-Pressure-Gradient-Tracker) repo.
