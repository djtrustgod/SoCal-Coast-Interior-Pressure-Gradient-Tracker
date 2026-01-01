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

## Upgrading from Previous Versions

If you're already running an older Docker deployment (e.g., v1.5.0), follow these steps to upgrade:

### Option 1: Using Docker Compose (Recommended)

```bash
# Navigate to your project directory
cd SoCal-Coast-Interior-Pressure-Gradient-Tracker

# Pull latest code from GitHub
git pull origin main

# Stop the current container
docker-compose down

# Remove old images (optional but recommended)
docker rmi socal-pressure-tracker:latest

# Rebuild with latest code (no-cache ensures fresh build)
docker-compose build --no-cache

# Start with the new image
docker-compose up -d

# Verify it's running
docker ps
docker logs -f socal-pressure-tracker
```

### Option 2: Using Docker Directly

```bash
# Navigate to your project directory
cd SoCal-Coast-Interior-Pressure-Gradient-Tracker

# Pull latest code
git pull origin main

# Stop and remove old container
docker stop socal-pressure-tracker
docker rm socal-pressure-tracker

# Remove old image
docker rmi socal-pressure-tracker

# Rebuild the image
docker build -t socal-pressure-tracker:1.5.1 .

# Run with new image
docker run -d \\
  --name socal-pressure-tracker \\
  -p 3000:3000 \\
  -v $(pwd)/data:/app/data \\
  socal-pressure-tracker:1.5.1

# Verify
docker ps
docker logs -f socal-pressure-tracker
```

### What's Preserved During Upgrade

✅ **Your location data** - Stored in `./data/locations.json`, preserved by volume mount  
✅ **Custom configurations** - Home location, dashboard selections, API refresh interval  
✅ **Port mappings** - Unless you change them in docker-compose.yml  

### What's New in This Version

- Enhanced Dockerfile with better layer caching and libc6-compat
- Embedded health checks for monitoring
- Resource limits (512MB memory, 1 CPU)
- Log rotation (10MB max, 3 files)
- Timezone support (TZ environment variable)
- Security hardening with proper permissions
- Optimized image size (~235MB)

### Verification Steps

After upgrading, verify everything works:

```bash
# Check container health
docker inspect socal-pressure-tracker --format='{{.State.Health.Status}}'

# Test API endpoint
curl http://localhost:3000/api/locations

# View logs
docker logs socal-pressure-tracker
```

### Troubleshooting

**Container won't start?**
- Check logs: `docker logs socal-pressure-tracker`
- Verify port 3000 isn't in use: `netstat -an | findstr 3000`

**Data missing after upgrade?**
- Verify volume mount: `docker inspect socal-pressure-tracker | findstr data`
- Check file exists: `ls ./data/locations.json`

**Old image still showing?**
- Force remove: `docker rmi -f socal-pressure-tracker:old-version`
- Rebuild: `docker-compose build --no-cache`

## Files Included in This Release
- Dockerfile
- docker-compose.yml
- .dockerignore

These files enable containerized deployment with automatic health checks, persistent data storage, and optimized build processes.
