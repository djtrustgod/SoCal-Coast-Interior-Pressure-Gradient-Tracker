# Release Automation

When user requests a release ("publish a release", "create a release", etc.), follow these steps.

## Steps

### 1. Pre-flight Checks
- Run `npm run build` to verify no errors
- Read version from `package.json` (semver: X.Y.Z)
- Confirm `CHANGELOG.md` has items under `[Unreleased]`
- Verify clean working directory: `git status`

### 2. Create Release Notes
If `RELEASE_NOTES_vX.Y.Z.md` doesn't exist, create it from `[Unreleased]` in CHANGELOG using:

```markdown
# Release vX.Y.Z - [Brief Title]

## [Emoji Headers: 🐛 Bug Fixes · ✨ Features · 🔧 Improvements · 📚 Docs · 🚀 Performance · 🔒 Security]

[Changes extracted from CHANGELOG [Unreleased] section]

## 📦 What's Included
[Major features in the application]

## 🚀 Getting Started
### Docker (Recommended)
docker-compose up -d

### Standard
npm install && npm run build && npm start

## 📚 Documentation
- README.md — Setup and usage
- IMPLEMENTATION.md — Technical details
- CHANGELOG.md — Full history

## 🙏 Acknowledgments
- [Open-Meteo](https://open-meteo.com/) · [shadcn/ui](https://ui.shadcn.com/) · [Next.js](https://nextjs.org/)

---
**Full Changelog**: https://github.com/djtrustgod/SoCal-Coast-Interior-Pressure-Gradient-Tracker/compare/v[PREVIOUS]...v[CURRENT]
```

### 3. Update CHANGELOG.md
- Move `[Unreleased]` items → `## [X.Y.Z] - YYYY-MM-DD` (today's date)
- Leave `[Unreleased]` empty with placeholder subsections

### 4. Update Version References
- `package.json` version field
- `components/footer.tsx` version string + build date

### 5. Commit & Push
```bash
git add RELEASE_NOTES_vX.Y.Z.md CHANGELOG.md package.json components/footer.tsx
git commit -m "Prepare release vX.Y.Z"
git push
```

### 6. Trigger Release
```bash
gh workflow run release.yml
```
If `gh` unavailable: GitHub → Actions → "Create GitHub Release" → Run workflow.

### 7. Post-Release
- Verify tag + release on GitHub Releases page
- Redeploy Docker per `.github/copilot-docker-redeploy.md`

## Version Bumps

| Change Type | Command | When |
|------------|---------|------|
| Patch (X.Y.**Z+1**) | `npm version patch` | Bug fixes, docs |
| Minor (X.**Y+1**.0) | `npm version minor` | New features, non-breaking |
| Major (**X+1**.0.0) | `npm version major` | Breaking changes |

After bump: push tags, then follow steps 2–7 above.

## Manual Fallback

```bash
git tag -a vX.Y.Z -m "Release vX.Y.Z"
git push origin vX.Y.Z
gh release create vX.Y.Z --title "Release vX.Y.Z" --notes-file RELEASE_NOTES_vX.Y.Z.md
```

## Troubleshooting

- **Tag exists**: `git tag -d vX.Y.Z && git push origin :refs/tags/vX.Y.Z`, then recreate
- **Workflow fails**: Check Actions logs, verify GITHUB_TOKEN has `contents: write`
- **No release notes**: Workflow auto-extracts from CHANGELOG.md as fallback

## Files Used
- `.github/workflows/release.yml` — GitHub Actions workflow
- `RELEASE_NOTES_vX.Y.Z.md` — Formatted release notes
- `CHANGELOG.md` — Source of truth for changes
