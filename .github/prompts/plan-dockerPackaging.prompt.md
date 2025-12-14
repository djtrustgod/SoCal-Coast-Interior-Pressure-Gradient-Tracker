# Docker Packaging Plan for SoCal Pressure Gradient Tracker

**Created**: December 13, 2025  
**Status**: Draft - Ready for implementation  
**Project Version**: 1.1.0

---

## Overview

Package the Next.js 16 application into a Docker container for local deployment. The app uses JSON file-based storage that must persist across container restarts.

---

## Prerequisites

- Docker Desktop installed
- Docker Compose (optional, for easier management)

---

## Implementation Steps

### Step 1: Update next.config.js for Standalone Output

Add `output: 'standalone'` to enable optimized Docker builds:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',  // Enables standalone output for Docker
};

module.exports = nextConfig;
```

**Why**: This creates a minimal production build that doesn't require `node_modules` in the final image, reducing image size significantly.

---

### Step 2: Create Dockerfile

Create `Dockerfile` in the project root:

```dockerfile
# Stage 1: Dependencies
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --only=production

# Stage 2: Builder
FROM node:22-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 3: Runner
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy standalone build
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Copy data directory with correct ownership
COPY --chown=nextjs:nodejs data ./data

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]
```

---

### Step 3: Create .dockerignore

Create `.dockerignore` in the project root:

```
# Dependencies
node_modules
.pnp
.pnp.js

# Build outputs
.next
out
build

# Development
.env.local
.env.development.local
.env.test.local
.env.production.local

# IDE
.vscode
.idea
*.swp
*.swo

# Git
.git
.gitignore

# Docker
Dockerfile
docker-compose.yml
.dockerignore

# Misc
*.md
!README.md
LICENSE
.github
```

---

### Step 4: Create docker-compose.yml (Recommended)

Create `docker-compose.yml` for easier container management:

```yaml
version: '3.8'

services:
  pressure-tracker:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: socal-pressure-tracker
    ports:
      - "3000:3000"
    volumes:
      # CRITICAL: Mount data directory for persistence
      - ./data:/app/data
    environment:
      - NODE_ENV=production
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "wget", "-q", "--spider", "http://localhost:3000/api/locations"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 10s
```

---

## Usage Commands

### Build the Docker Image

```bash
# Using Docker directly
docker build -t socal-pressure-tracker .

# Using Docker Compose
docker-compose build
```

### Run the Container

```bash
# Using Docker directly (with volume mount for data persistence)
docker run -d \
  --name socal-pressure-tracker \
  -p 3000:3000 \
  -v $(pwd)/data:/app/data \
  socal-pressure-tracker

# Using Docker Compose (recommended)
docker-compose up -d
```

### View Logs

```bash
# Docker
docker logs -f socal-pressure-tracker

# Docker Compose
docker-compose logs -f
```

### Stop the Container

```bash
# Docker
docker stop socal-pressure-tracker
docker rm socal-pressure-tracker

# Docker Compose
docker-compose down
```

### Rebuild After Code Changes

```bash
# Docker Compose (rebuilds and restarts)
docker-compose up -d --build
```

---

## Important Notes

### Data Persistence

⚠️ **Critical**: The `data/locations.json` file is read AND written at runtime. Location changes made through the UI modify this file.

- **Always use a volume mount** (`-v ./data:/app/data`) to persist data
- Without the volume, any location changes will be lost when the container restarts
- The initial `data/locations.json` from the repo serves as the default configuration

### Port Configuration

- Default port: **3000**
- To use a different port: `-p 8080:3000` maps host port 8080 to container port 3000

### Network Access

The container needs outbound internet access to reach the Open-Meteo API (`api.open-meteo.com`). No inbound firewall rules needed beyond the exposed port.

### Resource Requirements

- **Memory**: ~256MB minimum, ~512MB recommended
- **CPU**: Minimal requirements
- **Disk**: ~200MB for image + data volume

---

## Verification Checklist

After running the container, verify:

- [ ] App loads at http://localhost:3000
- [ ] Dashboard displays pressure data (requires internet for Open-Meteo API)
- [ ] Navigate to Settings and change home location
- [ ] Restart container: `docker-compose restart`
- [ ] Verify location change persisted after restart

---

## Files to Create

| File | Purpose |
|------|---------|
| `Dockerfile` | Multi-stage Docker build instructions |
| `.dockerignore` | Files to exclude from Docker build context |
| `docker-compose.yml` | Container orchestration (optional but recommended) |

## Files to Modify

| File | Change |
|------|--------|
| `next.config.js` | Add `output: 'standalone'` |
| `README.md` | Add Docker usage section |
| `CHANGELOG.md` | Document Docker support addition |

---

## Estimated Time

- Implementation: 15-30 minutes
- Testing: 15 minutes

---

## References

- [Next.js Docker Deployment](https://nextjs.org/docs/deployment#docker-image)
- [Next.js Standalone Output](https://nextjs.org/docs/advanced-features/output-file-tracing)
- [Docker Multi-stage Builds](https://docs.docker.com/build/building/multi-stage/)
