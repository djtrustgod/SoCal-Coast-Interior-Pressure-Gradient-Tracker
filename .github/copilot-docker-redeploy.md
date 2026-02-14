# Docker Redeploy

When user says "redeploy docker", "rebuild docker", or similar:

## Standard Redeploy

```bash
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

## Verify

```bash
docker ps                                    # Should show "healthy"
docker logs --tail 20 socal-pressure-tracker # Should show "✓ Ready in Xms"
```

App at http://localhost:3000. Data in `./data` persists across redeploys (volume mount).

## Quick Redeploy (code-only changes, no dependency changes)

```bash
docker-compose down && docker-compose build && docker-compose up -d
```

## Full Clean Rebuild (troubleshooting only)

⚠️ Removes ALL Docker images/volumes system-wide.

```bash
docker-compose down -v
docker system prune -a -f
docker-compose build --no-cache
docker-compose up -d
```

## Troubleshooting

- **Container won't start**: `docker logs socal-pressure-tracker`
- **Port conflict**: `netstat -ano | findstr :3000`
- **Config check**: `docker-compose config`
