#  Flowbit: Multi-Tenant SaaS Platform

A multi-tenant support ticket system with authentication, RBAC, dynamic micro-frontends, workflow automation via **n8n**, and full Docker-based development setup.

---

## Tech Stack

- **Backend**: Node.js + Express + MongoDB + JWT + bcryptjs  
- **Frontend**: React + Vite + Webpack Module Federation  
- **Workflow**: n8n.io  
- **Containers**: Docker + Docker Compose  
- **Other**: Jest for unit tests  

---

## Project Structure

```
/flowbit
├── api/                   # Backend (Node.js + Express)
├── shell/                 # Frontend container (React shell + dynamic sidebar)
├── support-tickets-app/   # Micro-frontend for ticket management
├── docker-compose.yml     # Main orchestrator
├── registry.json          # Tenant-to-screens map
```

---

## ⚙️ Setup Instructions

###  1. Start All Services

```bash
docker-compose up --build
```

This will start:

| Service              | Port                      |
|----------------------|---------------------------|
| React Shell (Vite)   | http://localhost:3000     |
| API (Node.js)        | http://localhost:5000     |
| SupportTicketsApp    | Loaded into shell via MFE |
| MongoDB              | mongodb://localhost:27017 |
| n8n (workflow)       | http://localhost:5678     |

---

### 2. Seed Users & Tickets

```bash
docker exec -it flowbit-api-1 node scripts/seed.js
```

Seeds:

- 2 tenants (`tenant-a`, `tenant-b`)
- Users with roles: `admin`, `agent`, `user`, `customer`
- Sample tickets

---

###  3. Run Unit Tests (R2)

```bash
docker exec -it flowbit-api-1 npm test
```

Confirms tenant isolation:  
A user from `tenant-a` cannot access tickets from `tenant-b`.

---

## Feature Overview

### R1.  Auth & RBAC

- Login via `/api/auth/login`
- JWT contains `email`, `role`, `tenant`, `customerId`
- Middleware: `authenticate` and `authorizeRoles(...)`
- Protected routes:
  - `/admin/dashboard`
  - `/user/dashboard`

---

### R2.  Tenant Data Isolation

- All tickets include `customerId`
- Queries filter by `req.user.customerId`
- Unit test checks isolation

---

### R3.  Dynamic Registry

- `registry.json` maps tenant to available screens:

```json
{
  "tenant-a": ["/support"],
  "tenant-b": ["/support"]
}
```

- `/api/me/screens` returns allowed screens for current user

---

### R4.  Dynamic Navigation & Micro-Frontend (MFE)

- Shell app fetches `/me/screens` on login
- Loads MFE (`SupportTicketsApp`) dynamically using **Webpack Module Federation**
- Screens rendered based on tenant

---

### R5.  n8n Workflow Integration

When creating a ticket:

```http
POST /api/protected/tickets
```

- Ticket is created in the DB
- Then triggers an n8n webhook with:

```json
{
  "customerId": "xxx",
  "ticketId": "yyy"
}
```

- n8n workflow POSTs back to:

```http
/api/webhook/ticket-done
```

- With header: `x-n8n-secret`
- Flowbit validates the secret and updates the ticket

---

### R6.  Dockerized Development Setup

```bash
docker-compose up --build
```

Brings up:

- MongoDB  
- API (Express)  
- React Shell App  
- MFE (SupportTicketsApp)  
- n8n workflow engine  

All preconfigured and integrated automatically.

---

##  Sample Credentials

| Email                   | Password | Role     | Tenant    |
|--------------------------|----------|----------|-----------|
| admin-a@flowbit.com      | 123456   | admin    | tenant-a  |
| agent-a@flowbit.com      | 123456   | agent    | tenant-a  |
| customer-a@flowbit.com   | 123456   | customer | tenant-a  |
| admin-b@flowbit.com      | 123456   | admin    | tenant-b  |



---


```env
PORT=5000
MONGO_URI=mongodb://mongo:27017/flowbit
JWT_SECRET=supersecretjwt

WEBHOOK_SECRET=super-secret-shared-key
N8N_WEBHOOK_URL=http://n8n:5678/webhook/flowbit-ticket-start

N8N_SHARED_SECRET=secret123
```



