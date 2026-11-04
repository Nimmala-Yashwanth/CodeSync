# Architecture and design notes

## Main request flows

1. React renders Monaco and workspace UI.
2. Express handles authentication, workspace metadata, invitations and file CRUD.
3. Yjs CRDT document updates travel over WebSocket connections for live collaboration.
4. PostgreSQL stores durable data when `DATABASE_URL` is set; an in-memory fallback is available for development.
5. Cursor markers and collaborator presence are best-effort features, not a guarantee of global presence across horizontally scaled nodes.

## Security boundaries

- Workspace APIs require authentication and authorization; invitation acceptance is bound to the invited account email.
- The optional runner starts Node/Python Docker images with network disabled, read-only root filesystem, non-root user, dropped capabilities, process/memory/CPU limits and bounded output.
- **Known runner limitation:** terminating the Docker CLI process on timeout may leave the container running. There is no independently validated force-removal lifecycle, request queue, per-account quota, or public multi-tenant isolation. Keep `ENABLE_CODE_EXECUTION=false` for normal use.
- The PostgreSQL credentials in Compose are strictly local development defaults.

## Not yet implemented or verified

- Production-scale multi-node WebSocket coordination and failover.
- Comprehensive browser E2E tests and PostgreSQL integration tests.
- Production-grade sandbox hardening and rate limiting for untrusted execution.
- Production hosting and observability.
