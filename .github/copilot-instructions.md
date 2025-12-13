# GitHub Copilot Instructions for SoCal Pressure Gradient Tracker

## Project Overview

This is a Next.js 16 web application that tracks and displays Mean Sea Level Pressure (MSLP) differences between coastal and interior Southern California locations. The app helps visualize pressure gradients that indicate offshore vs. onshore wind patterns.

**Key Technologies:**
- **Framework**: Next.js 16 with App Router and Turbopack
- **Language**: TypeScript (strict mode enabled)
- **Styling**: Tailwind CSS with shadcn/ui components
- **Data Source**: Open-Meteo API (free, no API key required)
- **Data Storage**: JSON file-based storage (`data/locations.json`)

**Architecture:**
- Server components by default for better performance
- Client components only where interactivity is needed (marked with `"use client"`)
- API routes in `app/api/` directory
- Zod schema validation for API endpoints
- File system-based data persistence

## Build, Lint, and Development Commands

```bash
# Development server (runs on http://localhost:3000)
npm run dev

# Production build
npm run build

# Start production server
npm run start

# Run ESLint
npm run lint

# TypeScript type checking (useful in CI/CD)
npx tsc --noEmit
```

**Important Notes:**
- Always run `npm run build` before committing to catch TypeScript errors
- ESLint configuration uses `next/core-web-vitals` preset
- **No test framework is currently configured** - when adding tests, consider using:
  - Vitest or Jest for unit tests
  - React Testing Library for component tests
  - Playwright or Cypress for E2E tests
- Use Turbopack for faster development builds (automatic with Next.js 16)
- TypeScript strict mode is enabled - run `npx tsc --noEmit` to catch type errors

## Code Style and Conventions

### TypeScript
- **Strict mode is enabled** - all types must be explicitly defined
- Use TypeScript interfaces for data structures (see `types/location.ts`)
- Avoid using `any` type - use proper types or `unknown` with type guards
- Use path aliases: `@/` refers to the project root (e.g., `@/types/location`)

### React Components
- **Functional components only** - no class components
- Use React 19 features and hooks
- Default to **server components** - only add `"use client"` when necessary:
  - When using React hooks (useState, useEffect, etc.)
  - When using browser APIs
  - When handling user interactions that require client-side state
- Props interfaces should be defined inline or at the top of the file

### File Naming
- Components: PascalCase (e.g., `GradientCard.tsx`)
- API routes: lowercase with hyphens (e.g., `route.ts` in named directories)
- Utilities: camelCase (e.g., `gradient.ts`)
- Types: camelCase (e.g., `location.ts`)

### Styling
- Use Tailwind CSS utility classes
- Use shadcn/ui components for consistent UI (Button, Card, Dialog, etc.)
- Support both light and dark themes using `dark:` variants
- Use semantic color classes (e.g., `text-muted-foreground`, `bg-background`)

### Code Organization
```
app/               # Next.js App Router pages and API routes
  api/             # API endpoints (route.ts files)
  locations/       # Location management page
  layout.tsx       # Root layout
  page.tsx         # Dashboard page (home)
components/        # React components
  ui/              # shadcn/ui base components
  *.tsx            # Custom components
lib/               # Utility functions and business logic
  api/             # External API clients
  calculations/    # Business logic and calculations
  utils.ts         # Shared utilities
types/             # TypeScript type definitions
data/              # JSON data files
```

## Architecture and Design Patterns

### Data Flow
1. **Server Components** fetch data directly in the component
2. **API Routes** handle CRUD operations and external API calls
3. **Client Components** handle user interactions and browser-specific features
4. **JSON Storage** persists configuration (locations, settings)

### State Management
- **No global state management library** - use React state and server components
- Server-side data fetching with automatic revalidation
- Client-side state only for UI interactions (modals, forms, refresh)

### API Route Patterns
- Use Zod for request validation
- Return JSON responses with consistent structure:
  ```typescript
  { success: true, data: ... }  // Success
  { error: "message" }           // Error
  ```
- Use appropriate HTTP methods: GET, POST, PATCH, PUT, DELETE
- Handle errors with try/catch and return appropriate status codes

### Component Patterns
- **Container/Presentation Pattern**: Separate data fetching (server) from UI (client when needed)
- **Composition**: Build complex UIs from smaller, reusable components
- **Props Interface**: Always define explicit prop types

## Common Pitfalls and Gotchas

### Next.js 16 Specific
- **Dynamic Routes**: Mark dynamic API routes with `export const dynamic = 'force-dynamic'`
- **Revalidation**: Use `revalidatePath()` for on-demand revalidation after mutations
- **Server vs Client**: Avoid mixing server-only code with client components
- **Async Components**: Server components can be async, client components cannot

### Data Handling
- **File System Access**: Only use `fs` in server components or API routes, never in client components
- **Pressure Gradient Calculation**: Positive = Onshore Flow (coast > inland), Negative = Offshore Flow (inland > coast)
- **Timezone Display**: Always format dates with user's local timezone using `toLocaleString()`
- **Location Limits**: Maximum 25 locations, max 3 dashboard locations

### API Integration
- **Open-Meteo API**: No authentication required, but respect rate limits
- **Data Freshness**: Current hour data is fetched, not midnight values
- **Error Handling**: Always handle API failures gracefully with fallbacks

### TypeScript
- **Path Alias**: Use `@/` for imports, not relative paths like `../../`
- **Enum vs Union Types**: Prefer union types (`"coast" | "interior"`) over enums
- **Interface vs Type**: Use interfaces for object shapes, types for unions/intersections

## API Integration Details

### Open-Meteo API
```typescript
// Endpoint: https://api.open-meteo.com/v1/forecast
// Parameters:
// - latitude, longitude: Location coordinates
// - hourly: pressure_msl (Mean Sea Level Pressure)
// - timezone: auto
// - forecast_days: 1
```

### Internal API Endpoints

**GET `/api/locations`**
- Returns all locations, home location ID, dashboard location IDs, and API refresh interval
- No parameters required

**POST `/api/locations`**
- Add new location (max 25 total)
- Validates with Zod schema
- Body: `{ id, name, code, latitude, longitude, type, elevation? }`

**PATCH `/api/locations`**
- Update home location, dashboard selections, or API refresh interval
- Body options:
  - `{ homeLocationId: string }`
  - `{ dashboardLocationIds: string[] }` (max 3)
  - `{ apiRefreshInterval: number }` (60-3600 seconds)

**PUT `/api/locations`**
- Update existing location details
- Body: Complete location object

**DELETE `/api/locations?id=location-id`**
- Remove location (cannot delete home or dashboard locations)

**GET `/api/pressure?ids=sna,sba,dag`**
- Fetch pressure data for comma-separated location IDs
- Returns pressure, temperature, timestamp for each location

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

### 3. CHANGELOG.md
Update with each build or significant change:
- **[Unreleased] section**: Add changes under appropriate categories (Added, Changed, Fixed, etc.)
- Move items from [Unreleased] to a new version section when releasing
- Include the date in YYYY-MM-DD format for version releases
- Follow Keep a Changelog format with clear, concise descriptions

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

### CHANGELOG.md Standards
- Follow Keep a Changelog format (Added, Changed, Deprecated, Removed, Fixed, Security)
- Use present tense for descriptions ("Add feature" not "Added feature")
- Group related changes together
- Be specific and concise
- Add entries to [Unreleased] section during development
- Create dated version sections only when releasing

## Workflow

When implementing a feature:
1. **Complete the implementation** with all code changes
2. **Test the functionality** to ensure it works
3. **Update README.md** with user-facing documentation
4. **Update IMPLEMENTATION.md** with technical details
5. **Update CHANGELOG.md** by adding changes to the [Unreleased] section
6. **Verify documentation accuracy** by reading through changes
7. **Update version number** in `package.json` if the change is significant (new features, breaking changes, or major bug fixes)
8. **Commit all changes together** (code + documentation + changelog)

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

## Domain-Specific Guidelines

### Pressure Gradient Calculations

**Critical Understanding**: The pressure gradient calculation has specific meteorological meaning:

```typescript
gradient = homeLocation.pressure - compareLocation.pressure
```

**Interpretation**:
- **Positive Gradient** (+): Home pressure > Compare pressure
  - Indicates **Onshore Flow** (typical marine layer conditions)
  - Higher pressure at coast pushes air inland
  - Common in normal Southern California weather
  
- **Negative Gradient** (-): Home pressure < Compare pressure
  - Indicates **Offshore Flow** (Santa Ana wind conditions)
  - Higher pressure inland pushes air toward coast
  - Associated with dry, warm, and potentially dangerous fire weather

**Gradient Thresholds** (defined in `lib/calculations/gradient.ts`):
- Strong Onshore: > +5 hPa
- Moderate Onshore: +2 to +5 hPa
- Weak Onshore: +0.5 to +2 hPa
- Neutral: -0.5 to +0.5 hPa
- Weak Offshore: -2 to -0.5 hPa
- Moderate Offshore: -5 to -2 hPa
- Strong Offshore: < -5 hPa

**DO NOT change these thresholds** without consulting meteorological references, as they are based on practical observations of Southern California weather patterns.

### Location Management

- **Maximum 25 locations** total (configurable in code)
- **Maximum 3 dashboard locations** (selectable by user)
- **Location Types**: "coast" or "interior" (affects gradient interpretation)
- **Elevation**: Optional field in meters above sea level
- **Home Location**: Cannot be deleted while set as home
- **Dashboard Locations**: Automatically removed from dashboard when deleted

### Data Refresh Strategy

- **API Refresh Interval**: User-configurable from 60 to 3600 seconds (1-60 minutes)
- **Default**: 300 seconds (5 minutes)
- **Auto-Refresh**: Dashboard refreshes every 5 minutes in browser using `setInterval`
- **Current Hour Data**: Fetches most recent hourly reading, not daily aggregates
- **Timezone**: All timestamps converted to user's local timezone for display

## Security Considerations

- **No authentication** - this is a public weather tracking tool
- **Input Validation**: All API inputs validated with Zod schemas
- **File System Access**: Limited to `data/locations.json` for configuration
- **API Keys**: Not required for Open-Meteo API (free tier)
- **Rate Limiting**: None implemented - rely on Open-Meteo's fair use policy

## Reminder

🚨 **NEVER mark a task as complete without updating README.md, IMPLEMENTATION.md, and CHANGELOG.md!**

This ensures the documentation always reflects the current state of the application and helps other developers (and users) understand all available features.
