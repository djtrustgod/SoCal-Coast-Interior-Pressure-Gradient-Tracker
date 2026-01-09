# Docker Redeployment Instructions

When the user requests "Redeploy Docker" or similar commands like "redeploy to docker", "rebuild docker", "update docker", or "docker redeploy", follow these steps:

## Standard Docker Compose Redeployment

Execute the following commands in sequence:

1. **Stop and remove existing containers**:
   ```bash
   docker-compose down
   ```

2. **Rebuild image with latest code** (no cache to ensure all changes are included):
   ```bash
   docker-compose build --no-cache
   ```

3. **Start container in detached mode**:
   ```bash
   docker-compose up -d
   ```

4. **Verify deployment**:
   ```bash
   docker ps
   docker logs --tail 20 socal-pressure-tracker
   ```

## Expected Output

- `docker ps` should show the container as "healthy"
- Logs should show "✓ Ready in Xms"
- Application should be accessible at http://localhost:3000

## Troubleshooting

If the container fails to start:
- Check logs: `docker logs socal-pressure-tracker`
- Verify port 3000 is not in use: `netstat -ano | findstr :3000`
- Check Docker Compose configuration: `docker-compose config`

## Data Persistence

The `./data` directory is mounted as a volume, so location configurations persist across redeployments.

## Quick Redeploy (Alternative)

For faster redeployment when only code changes (not dependencies):
```bash
docker-compose down && docker-compose build && docker-compose up -d
```

## Full Clean Rebuild

For a complete clean rebuild (removes all cached layers):
```bash
docker-compose down -v
docker system prune -a -f
docker-compose build --no-cache
docker-compose up -d
```

⚠️ **Warning**: The full clean rebuild removes all Docker images and volumes. Only use when troubleshooting persistent issues.
