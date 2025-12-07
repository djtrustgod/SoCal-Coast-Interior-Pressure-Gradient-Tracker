# GitHub Copilot Instructions for SoCal Pressure Gradient Tracker

## Documentation Update Policy

**CRITICAL**: Whenever you implement a new feature, fix a bug, or make significant changes to the application, you MUST update the following documentation files:

### 1. README.md
Update the following sections as applicable:
- **Features section**: Add new capabilities with appropriate emoji icons
- **Technology Stack**: Update if new dependencies are added
- **Usage section**: Document new user-facing functionality
- **API Endpoints**: Add/update endpoint documentation for API changes
- **Configuration section**: Document new settings or environment variables
- **Project Structure**: Update if new files/folders are created

### 2. IMPLEMENTATION.md
Update the following sections as applicable:
- **Key Features Implemented**: Add detailed technical descriptions
- **Technical Implementation**: Document data layer, calculations, or component changes
- **File Structure**: Update with new components or files
- **Dependencies**: Add newly installed packages
- **Working Features**: Add completed functionality to the checklist
- **Known Issues/Limitations**: Document any new limitations or issues
- **Project Status**: Update metrics (lines of code, last updated date)

## When to Update Documentation

Update documentation for:
- ✅ New UI features or components
- ✅ New API endpoints or modifications to existing ones
- ✅ New npm packages or dependencies
- ✅ New configuration options or environment variables
- ✅ Bug fixes that affect documented behavior
- ✅ Performance improvements worth noting
- ✅ New data structures or types
- ✅ Changes to build/deployment process

Do NOT update documentation for:
- ❌ Minor code refactoring that doesn't change functionality
- ❌ Code comments or formatting changes
- ❌ Internal variable renames
- ❌ Minor style/CSS adjustments

## Documentation Standards

### README.md Standards
- Use clear, user-friendly language
- Include code examples for API endpoints
- Keep feature descriptions concise (1-2 lines)
- Use proper markdown formatting
- Maintain consistent emoji usage for features

### IMPLEMENTATION.md Standards
- Use technical language appropriate for developers
- Include file paths and component names
- Document technical decisions and architecture
- Keep metrics accurate (lines of code, dependencies count)
- Update "Last Updated" date to current date

## Workflow

When implementing a feature:
1. **Complete the implementation** with all code changes
2. **Test the functionality** to ensure it works
3. **Update README.md** with user-facing documentation
4. **Update IMPLEMENTATION.md** with technical details
5. **Verify documentation accuracy** by reading through changes
6. **Update version number** in `package.json` if the change is significant (new features, breaking changes, or major bug fixes)
7. **Commit all changes together** (code + documentation)

## Example Documentation Updates

### Example 1: Adding a New Feature
**Feature**: Debug API Output Section

**README.md Update**:
```markdown
- 🐛 **Debug Mode**: View raw API output for all locations in Settings
```

**IMPLEMENTATION.md Update**:
```markdown
#### Debug Section (`/locations`)
- View raw JSON output from Open-Meteo API
- Displays formatted cards with pressure, temperature, timestamp
- On-demand data fetching with refresh button
- Shows all configured locations simultaneously
```

### Example 2: Adding a New API Endpoint
**Feature**: PATCH endpoint for settings

**README.md Update**:
```markdown
### PATCH /api/locations
Update home location or dashboard location selections.

**Body (Set Home):**
\`\`\`json
{
  "homeLocationId": "sba"
}
\`\`\`
```

**IMPLEMENTATION.md Update**:
```markdown
**`/api/locations`**
- PATCH: Update homeLocationId or dashboardLocationIds
- Validation with Zod schema
- Automatic cleanup (removes deleted locations from dashboard list)
```

## Reminder

🚨 **NEVER mark a task as complete without updating both README.md and IMPLEMENTATION.md!**

This ensures the documentation always reflects the current state of the application and helps other developers (and users) understand all available features.
