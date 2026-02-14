# Release v1.5.4

## Fixed

- Fixed stale data issue after system hibernation - dashboard now forces dynamic rendering to ensure fresh data on every refresh

---

This patch release addresses a caching issue where the dashboard would display stale pressure data after the system resumed from hibernation. The fix ensures that clicking the refresh button always fetches the most current data from the API.
