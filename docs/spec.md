# CRM — Product Specification

## Entities
- **User** — id, email, passwordHash, firstName, lastName, role, orgId, active
- **Organization** — id, name, plan, createdAt
- **Contact** — id, firstName, lastName, email, phone, companyId, ownerId, orgId, tags, notes, deletedAt
- **Company** — id, name, industry, website, phone, address, orgId, deletedAt
- **Deal** — id, title, value, currency, stageId, contactId, companyId, ownerId, closeDate, probability, orgId, deletedAt
- **Pipeline** — id, name, orgId
- **PipelineStage** — id, name, pipelineId, order, probability, color
- **Activity** — id, type (CALL/EMAIL/NOTE/MEETING), body, contactId, dealId, userId, orgId, createdAt
- **Task** — id, title, dueDate, status, assigneeId, contactId, dealId, orgId
- **AuditLog** — id, userId, action, entityType, entityId, diff (jsonb), createdAt

## MVP Features
1. Auth — register, login, refresh token, logout
2. Contact CRUD — search, filter, CSV import
3. Company CRUD — linked contacts
4. Deal pipeline — Kanban + list view, drag-drop stage change
5. Activity timeline per contact/deal
6. Task management — create, assign, complete, reminders
7. Dashboard — deal funnel, revenue forecast, recent activities, overdue tasks
8. Role-based access — ADMIN, MANAGER, REP
9. REST API — full CRUD, paginated, OpenAPI documented
10. Audit log — every mutation tracked

## Non-functional
- JWT auth, tokens expire in 1h, refresh token 7d
- Multi-tenant — orgId on all queries
- Soft deletes on Contact, Company, Deal
- API response envelope: { data, error, meta }
- Pagination: page/size/sort query params
- Input validation on all endpoints
- CORS configured for Angular dev server
