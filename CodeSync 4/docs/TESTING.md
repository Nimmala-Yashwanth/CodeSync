# Testing guide

## Automated checks

```bash
npm install
npm test
npm run build
npm audit
```

## Manual verification checklist

- [ ] Register and log in with Account A.
- [ ] Create a workspace, add a file, rename it, and delete it.
- [ ] Register Account B using a different email.
- [ ] Invite B, accept the token, and open the shared workspace.
- [ ] Confirm changes synchronize in both directions.
- [ ] Confirm remote cursor marker is visible.
- [ ] Refresh and restart the server to verify persistence with PostgreSQL configured.
- [ ] Check unauthorized account cannot access a private workspace.
- [ ] Confirm `ENABLE_CODE_EXECUTION=false` prevents code execution.

Do not claim these tests have passed solely because they are listed here. Record results after running them.
