# GitHub Release Automation Prompt

This prompt file contains instructions for GitHub Copilot to automate the release process for the SoCal Pressure Gradient Tracker project.

## Trigger Phrases

When the user says any of the following, execute the release process:
- "Publish a release"
- "Create a release"
- "Release the current version"
- "Publish to GitHub releases"
- "Make a new release"

## Release Process Steps

### 1. Verify Current State
- Check `package.json` for the current version number
- Verify the version is properly formatted (semantic versioning: X.Y.Z)
- Check if there are unreleased changes in `CHANGELOG.md`

### 2. Prepare Release Notes
- Check if `RELEASE_NOTES_vX.Y.Z.md` already exists for the current version
- If it doesn't exist, create it using this template:

```markdown
# Release vX.Y.Z - [Brief Title]

## [Appropriate Emoji Section Headers]

Use these emoji conventions:
- 🐛 Bug Fixes
- ✨ New Features
- 🔧 Improvements
- 📚 Documentation
- 🚀 Performance
- 🔒 Security

Extract changes from the [Unreleased] section of CHANGELOG.md and organize them appropriately.

## 📦 What's Included

List all major features available in the application.

## 🚀 Getting Started

### Docker Deployment (Recommended)
[Include Docker instructions]

### Standard Installation
[Include npm instructions]

## 📚 Documentation

- [README.md](README.md) - Complete setup and usage guide
- [IMPLEMENTATION.md](IMPLEMENTATION.md) - Technical implementation details
- [CHANGELOG.md](CHANGELOG.md) - Full version history

## 🙏 Acknowledgments

- Weather data provided by [Open-Meteo](https://open-meteo.com/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Built with [Next.js](https://nextjs.org/)

---

**Full Changelog**: https://github.com/djtrustgod/SoCal-Coast-Interior-Pressure-Gradient-Tracker/compare/v[PREVIOUS]...v[CURRENT]
```

### 3. Update CHANGELOG.md
- Move items from `[Unreleased]` section to a new dated version section
- Format: `## [X.Y.Z] - YYYY-MM-DD`
- Leave `[Unreleased]` section empty or add placeholder text
- Ensure the date is the current date

### 4. Commit Changes
If any files were created or modified:
```bash
git add RELEASE_NOTES_vX.Y.Z.md CHANGELOG.md
git commit -m "Prepare release vX.Y.Z"
git push origin main
```

### 5. Trigger GitHub Actions Workflow
Run the automated release workflow:
```bash
# Using GitHub CLI (if available)
gh workflow run release.yml

# Or provide manual instructions
```

If GitHub CLI (`gh`) is not available, provide instructions to:
1. Go to GitHub repository
2. Click on "Actions" tab
3. Select "Create GitHub Release" workflow
4. Click "Run workflow"
5. Leave version empty (uses package.json version) or specify manually
6. Click "Run workflow" button

### 6. Verify Release
After the workflow completes, verify:
- Tag was created successfully
- GitHub Release is published
- Release notes are correctly displayed
- All assets are included (if applicable)

## Automation Files

This release process uses:
- **Workflow file**: `.github/workflows/release.yml` - GitHub Actions workflow
- **Release notes template**: `RELEASE_NOTES_vX.Y.Z.md` - Formatted release notes
- **Changelog**: `CHANGELOG.md` - Source of truth for changes

## Manual Release (Fallback)

If GitHub Actions is not available or preferred:

```bash
# 1. Create and push tag
git tag -a vX.Y.Z -m "Release vX.Y.Z"
git push origin vX.Y.Z

# 2. Create release using GitHub CLI
gh release create vX.Y.Z \
  --title "Release vX.Y.Z" \
  --notes-file RELEASE_NOTES_vX.Y.Z.md

# Or manually on GitHub:
# - Go to repository > Releases > Draft a new release
# - Choose the tag
# - Copy content from RELEASE_NOTES_vX.Y.Z.md
# - Publish release
```

## Pre-Release Checklist

Before creating a release, ensure:
- [ ] All tests pass (`npm run build`, `npm run lint`)
- [ ] Version number in `package.json` is correct
- [ ] `CHANGELOG.md` is up to date
- [ ] Release notes file exists or can be generated
- [ ] All changes are committed and pushed
- [ ] No uncommitted changes in working directory

## Post-Release Tasks

After release is published:
- [ ] Verify release appears on GitHub Releases page
- [ ] Check that Docker Hub builds (if auto-build is configured)
- [ ] Update any external documentation if needed
- [ ] Announce release (if applicable)

## Version Bump Guidelines

When the user asks to "bump version" or "increment version":

### Patch Version (X.Y.Z -> X.Y.Z+1)
Use for bug fixes, small improvements, documentation updates
```bash
npm version patch
```

### Minor Version (X.Y.Z -> X.Y+1.0)
Use for new features, significant improvements, non-breaking changes
```bash
npm version minor
```

### Major Version (X.Y.Z -> X+1.0.0)
Use for breaking changes, major rewrites, API changes
```bash
npm version major
```

After version bump:
1. Commit the version change: `git push && git push --tags`
2. Update CHANGELOG.md with new version section
3. Create release notes
4. Follow release process above

## Examples

### Example 1: Quick Release
```
User: "Publish a release"

Copilot should:
1. Check package.json version (e.g., 1.5.3)
2. Check if RELEASE_NOTES_v1.5.3.md exists
3. If not, create it from CHANGELOG.md [Unreleased] section
4. Update CHANGELOG.md (move [Unreleased] to [1.5.3])
5. Commit changes
6. Run: gh workflow run release.yml
7. Confirm: "Release v1.5.3 workflow started. Check Actions tab for progress."
```

### Example 2: Release with Version Bump
```
User: "Bump to 1.6.0 and release"

Copilot should:
1. Run: npm version minor (1.5.3 -> 1.6.0)
2. Update CHANGELOG.md with new [1.6.0] section
3. Create RELEASE_NOTES_v1.6.0.md
4. Commit all changes
5. Run: gh workflow run release.yml
6. Confirm release initiated
```

## Troubleshooting

### Tag already exists
```bash
# Delete local tag
git tag -d vX.Y.Z

# Delete remote tag
git push origin :refs/tags/vX.Y.Z

# Recreate tag
git tag -a vX.Y.Z -m "Release vX.Y.Z"
git push origin vX.Y.Z
```

### Release notes not found
- Create manually from CHANGELOG.md
- Or let workflow extract from CHANGELOG.md automatically

### Workflow fails
- Check workflow logs in GitHub Actions tab
- Verify GITHUB_TOKEN permissions (needs write access to contents)
- Ensure all required files exist

## Notes

- Always use semantic versioning (MAJOR.MINOR.PATCH)
- Tag names should be prefixed with 'v' (e.g., v1.5.3)
- Release notes should be user-friendly and highlight key changes
- Changelog should be developer-friendly and detailed
- Always test build before releasing: `npm run build`
