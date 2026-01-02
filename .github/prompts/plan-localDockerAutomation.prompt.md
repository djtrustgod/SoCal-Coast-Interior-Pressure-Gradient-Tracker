# Plan: Automate Local Docker Deployment & GitHub Releases

Streamline Docker workflow and GitHub releases using industry-standard tools (Husky for git hooks, release-it for releases) with minimal custom scripting. This hybrid approach reduces maintenance burden while keeping project-specific customizations.

---

## Tool Overview

### Husky

**What it is:** Husky is a popular npm package (30k+ GitHub stars) that makes Git hooks easy to manage and share across a team.

**Why use it:**
- Hooks are stored in `.husky/` folder and committed to the repo
- Automatically installs hooks when running `npm install` (via `prepare` script)
- Works cross-platform (Windows, macOS, Linux) without separate scripts
- No manual `.git/hooks/` management needed
- Industry standard for JavaScript/TypeScript projects

**How it works:**
```bash
npm install -D husky
npx husky init
# Creates .husky/ folder with a sample pre-commit hook
```

### release-it

**What it is:** release-it is an interactive CLI tool that automates the entire release process: version bumping, changelog generation, git tagging, and GitHub release publishing.

**Why use it:**
- Interactive prompts guide you through each release
- Auto-generates changelog from conventional commits
- Updates `package.json` version automatically
- Creates git tags and pushes to remote
- Publishes GitHub releases with notes
- Supports `--dry-run` to preview changes
- Highly configurable via `.release-it.json`
- Supports hooks to run custom scripts at each stage

**How it works:**
```bash
npm install -D release-it @release-it/conventional-changelog
npx release-it
# Interactive prompts: version bump type, changelog preview, confirm release
```

---

---

## Implementation Steps

### Phase 1: Git Hooks with Husky

See **Updated Implementation Steps (Windows-Optimized)** section below for Windows-compatible instructions.

### Phase 2: Docker Convenience Scripts

See **Updated Implementation Steps (Windows-Optimized)** section below for cross-platform npm scripts.

### Phase 3: Release Automation with release-it

6. **Install release-it**
   ```bash
   npm install -D release-it @release-it/conventional-changelog
   ```

7. **Create configuration** (`.release-it.json`):
   ```json
   {
     "git": {
       "commitMessage": "chore: release v${version}",
       "tagName": "v${version}",
       "requireCleanWorkingDir": true
     },
     "github": {
       "release": true,
       "releaseName": "v${version}"
     },
     "npm": {
       "publish": false
     },
     "plugins": {
       "@release-it/conventional-changelog": {
         "preset": "angular",
         "infile": "CHANGELOG.md"
       }
     },
     "hooks": {
       "before:init": ["npm run lint", "npm run build"],
       "after:bump": ["node scripts/update-version-refs.js ${version}"],
       "after:release": "echo Successfully released ${name} v${version}"
     }
   }
   ```

8. **Create version update hook script** (`scripts/update-version-refs.js`):
   - Updates version string in `footer.tsx`
   - Updates "Last Updated" date in `IMPLEMENTATION.md`
   - ~30 lines of JavaScript

9. **Add release script** to `package.json`:
   ```json
   {
     "scripts": {
       "release": "release-it",
       "release:dry": "release-it --dry-run"
     }
   }
   ```

### Phase 4: GitHub Copilot Prompt Templates

10. **Create Copilot prompts** for assisted release tasks:
    - `.github/prompts/release-notes.prompt.md` — Generate release notes from commits
    - `.github/prompts/update-changelog.prompt.md` — Format changelog entries

---

## File Structure After Implementation

```
.husky/
  post-commit           # Docker rebuild prompt hook
  _/
    husky.sh            # Husky internal script
scripts/
  update-version-refs.js  # Updates footer.tsx & IMPLEMENTATION.md
.release-it.json        # release-it configuration
.github/
  prompts/
    release-notes.prompt.md
    update-changelog.prompt.md
```

---

## Workflow Summary

### Daily Development
1. Make code changes
2. `git commit` → Husky prompts: "Rebuild Docker? (y/n)"
3. If yes → runs `npm run docker:rebuild` automatically

### Creating a Release
1. Run `npm run release` (or `npm run release:dry` to preview)
2. release-it prompts for version bump type (patch/minor/major)
3. release-it shows changelog preview
4. Confirm to proceed
5. Automatically:
   - Updates `package.json` version
   - Runs hook to update `footer.tsx` and `IMPLEMENTATION.md`
   - Updates `CHANGELOG.md`
   - Commits changes
   - Creates git tag
   - Pushes to remote
   - Creates GitHub Release

---

## What This Replaces

| Original Plan | Replaced By |
|---------------|-------------|
| `scripts/deploy.ps1` / `deploy.sh` | `npm run docker:rebuild` |
| `scripts/rebuild.ps1` / `rebuild.sh` | `npm run docker:build` |
| `scripts/release.ps1` / `release.sh` | `npx release-it` |
| `scripts/install-hooks.ps1` / `install-hooks.sh` | Husky `prepare` script |
| Manual `.git/hooks/` management | `.husky/` folder |
| Manual changelog updates | `@release-it/conventional-changelog` |
| Manual git tag/push | release-it automation |

**Reduction:** ~500+ lines of custom scripts → ~50 lines of config + 1 small hook script

---

## Prerequisites

- **Node.js** — Required for Husky and release-it
- **Docker Desktop for Windows** — Includes Docker Engine and Docker Compose v2
- **GitHub CLI (`gh`)** — Optional, release-it can use GitHub API directly with token
- **Git for Windows** — Includes Git Bash for running Husky shell hooks
- **WSL2 Backend** — Recommended for Docker Desktop on Windows (better performance)

---

## Windows Compatibility Notes

### Docker Compose on Windows

The plan uses **Docker Compose v2** (the `docker compose` plugin syntax, not legacy `docker-compose`). Docker Desktop for Windows includes this by default.

| Syntax | Version | Windows Support |
|--------|---------|-----------------|
| `docker compose` | v2 (plugin) | ✅ Recommended |
| `docker-compose` | v1 (standalone) | ⚠️ Legacy, may not be installed |

### npm Scripts for Cross-Platform

The `&&` operator works differently across shells:
- **PowerShell**: ✅ Works
- **cmd.exe**: ⚠️ May fail silently on first command error
- **Git Bash**: ✅ Works

**Solution**: Use `npm-run-all` for reliable cross-platform script chaining:

```bash
npm install -D npm-run-all
```

Updated npm scripts:
```json
{
  "scripts": {
    "docker:build": "docker compose build",
    "docker:up": "docker compose up -d",
    "docker:down": "docker compose down",
    "docker:rebuild": "npm-run-all docker:down docker:build docker:up",
    "docker:logs": "docker compose logs -f",
    "docker:clean": "docker compose down && docker compose build --no-cache && docker compose up -d"
  }
}
```

### Husky on Windows

Husky hooks are shell scripts that run via **Git Bash** (installed with Git for Windows). This works automatically because:
1. Git for Windows includes Git Bash
2. Git executes hooks using the shebang (`#!/bin/sh`)
3. Husky v9+ is designed for cross-platform compatibility

**Important**: The `.husky/post-commit` hook must use POSIX shell syntax, not PowerShell.

Example Windows-compatible hook:
```sh
#!/bin/sh

# Check if running interactively (has a TTY)
if [ -t 0 ]; then
  exec < /dev/tty
  echo ""
  printf "Rebuild Docker image? (y/n): "
  read -r answer
  if [ "$answer" = "y" ] || [ "$answer" = "Y" ]; then
    npm run docker:rebuild
  fi
fi
```

### Volume Mounts on Windows

Your current `docker-compose.yml` uses relative paths which work correctly:
```yaml
volumes:
  - ./data:/app/data
```

This works on Windows because:
- Docker Desktop translates Windows paths automatically
- WSL2 backend handles path conversion

**Avoid**: Absolute Windows paths like `C:\Users\...` in docker-compose.yml

### Docker Compose Watch on Windows

Docker Compose Watch (`docker compose watch`) works on Windows with Docker Desktop 4.24+. However, file system events may be slightly delayed compared to Linux due to WSL2 file system bridging.

---

## Updated Implementation Steps (Windows-Optimized)

### Phase 1: Git Hooks with Husky

1. **Install Husky**
   ```powershell
   npm install -D husky
   npx husky init
   ```

2. **Create post-commit hook** (`.husky/post-commit`) — POSIX shell syntax for Git Bash:
   ```sh
   #!/bin/sh
   
   # Only prompt if running interactively
   if [ -t 0 ]; then
     exec < /dev/tty
     echo ""
     printf "Rebuild Docker image? (y/n): "
     read -r answer
     if [ "$answer" = "y" ] || [ "$answer" = "Y" ]; then
       npm run docker:rebuild
     fi
   fi
   ```

3. **Husky auto-setup** — Add to `package.json`:
   ```json
   {
     "scripts": {
       "prepare": "husky"
     }
   }
   ```

### Phase 2: Docker Convenience Scripts (Cross-Platform)

4. **Install npm-run-all** for reliable script chaining:
   ```powershell
   npm install -D npm-run-all
   ```

5. **Add npm scripts** to `package.json`:
   ```json
   {
     "scripts": {
       "docker:build": "docker compose build",
       "docker:up": "docker compose up -d",
       "docker:down": "docker compose down",
       "docker:rebuild": "npm-run-all docker:down docker:build docker:up",
       "docker:logs": "docker compose logs -f",
       "docker:clean": "npm-run-all docker:down \"docker:build -- --no-cache\" docker:up",
       "docker:watch": "docker compose watch"
     }
   }
   ```

6. **Optional: Docker Compose Watch** — Add to `docker-compose.yml`:
   ```yaml
   services:
     pressure-tracker:
       develop:
         watch:
           - action: rebuild
             path: .
             ignore:
               - node_modules/
               - .git/
               - .husky/
               - data/
   ```

---

1. **Conventional Commits?** — release-it works best with conventional commit messages (`feat:`, `fix:`, `chore:`). Consider adding commitlint for enforcement.

2. **Pre-release versions?** — release-it supports `--preRelease=beta` for versions like `v1.6.0-beta.1`.

3. **Docker image tagging?** — Should `docker:rebuild` also tag the image with the current version from `package.json`?

4. **CI/CD integration?** — This plan focuses on local automation. Consider GitHub Actions for automated releases on push to main.
