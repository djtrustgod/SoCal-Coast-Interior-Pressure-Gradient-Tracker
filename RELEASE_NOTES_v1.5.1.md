# Release v1.5.1 - Docker Deployment Support

## Added
- Docker support for containerized deployment
- Multi-stage Dockerfile for optimized production builds
- Docker Compose configuration with health checks and automatic restarts
- Volume mounting for persistent data storage
- `.dockerignore` file for efficient Docker builds

## Changed
- Next.js config updated with `output: 'standalone'` for Docker optimization
- README.md expanded with comprehensive Docker deployment instructions

## Docker Deployment Files

This release includes the following files for Docker deployment:
- **Dockerfile** - Multi-stage build for optimized production deployment
- **docker-compose.yml** - Complete Docker Compose configuration with health checks
- **.dockerignore** - Optimized build context excluding unnecessary files

## Quick Start with Docker

```bash
# Clone the repository
git clone https://github.com/djtrustgod/SoCal-Coast-Interior-Pressure-Gradient-Tracker.git
cd SoCal-Coast-Interior-Pressure-Gradient-Tracker

# Start with Docker Compose
docker-compose up -d

# Access the application
# http://localhost:3000
```

## Manual Docker Build

```bash
# Build the image
docker build -t socal-pressure-tracker .

# Run the container
docker run -d \
  -p 3000:3000 \
  -v $(pwd)/data:/app/data \
  --name pressure-tracker \
  socal-pressure-tracker
```

## Files Included in This Release
- Dockerfile
- docker-compose.yml
- .dockerignore

These files enable containerized deployment with automatic health checks, persistent data storage, and optimized build processes.
