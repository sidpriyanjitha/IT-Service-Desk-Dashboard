# IT Service Desk Ticket Dashboard

An advanced IT support ticketing dashboard built with React, Vite, Tailwind CSS, React Router, Recharts, lucide-react, date-fns, and Supabase-ready data structures.

## Features

- Supabase authentication wiring with local demo fallback
- Protected routes and role-based access for Admin, Technician, and End User
- Ticket creation, ticket queue filters, sorting, pagination, and responsive layouts
- Ticket detail workflow with assignment, status changes, priority changes, resolution summary, public comments, staff-only internal notes, activity timeline, and reopen flow
- SLA logic for Critical, High, Medium, and Low priorities with On Track, At Risk, and Breached states
- Admin user management for role, department, and active status
- Dashboard metrics, recent tickets, assigned tickets, and Recharts visualizations
- Dark mode, loading states, empty states, toast notifications, and confirmation modal

## Demo Login

The app runs without Supabase credentials using seeded in-browser demo data.

- Admin: `admin@servicedesk.dev` / `password123`
- Technician: `maya.chen@servicedesk.dev` / `password123`
- End User: `priya.shah@servicedesk.dev` / `password123`

## Screenshots

Add portfolio screenshots here after running the app:

- Dashboard overview
- Ticket queue filters
- Ticket detail workflow
- Admin user management
- Mobile ticket cards

## Supabase Setup

1. Create a Supabase project.
2. Run `supabase/schema.sql` in the SQL editor.
3. Create auth users that match the seed profile IDs, or adapt `supabase/seed.sql` to your auth user IDs.
4. Run `supabase/seed.sql` for realistic sample data.
5. Copy `.env.example` to `.env` and add your keys:

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

The current UI uses a local state provider for portfolio demo speed. `src/lib/supabase.js` is ready for replacing the demo provider calls with live Supabase queries.

## Run Locally

```bash
npm install
npm run dev
```

Build for production:

```bash
npm run build
```

## Portfolio Description

DeskOps is a realistic internal IT service desk platform that demonstrates role-based support workflows, SLA awareness, ticket ownership, user administration, and operational analytics. It is designed to look and behave like a production tool used by service desk teams in a medium-sized organization.

## Future Improvements

- Persist all ticket and comment operations directly to Supabase
- Add Supabase Storage attachments
- Add email notifications and escalation rules
- Add asset inventory and requester satisfaction scoring
- Add technician workload balancing and queue automation
