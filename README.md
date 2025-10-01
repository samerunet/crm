# CRM — Makeup Artist Platform (Starter with DB)

Next.js (App Router) + Tailwind v4 + Framer Motion + **Prisma/Postgres**.
- Homepage to showcase wedding work (convert to bookings)
- Courses/Guides stubs
- Admin dashboard stub
- API route to capture **Leads** (saved in Postgres)

## Quickstart
```bash
npm i
cp .env.example .env.local   # fill DATABASE_URL for Postgres
npm run prisma:generate
npm run prisma:migrate -- --name init
npm run dev
```

Open http://localhost:3000

## Useful
- `npm run prisma:studio` — browse DB visually
- API test:
```bash
curl -X POST http://localhost:3000/api/leads \\
  -H 'content-type: application/json' \\
  -d '{ "name":"Bride","email":"bride@example.com","message":"Sept 21", "source":"homepage" }'
```

## Routes
- `/` — Homepage (hero + showcase + booking CTA)
- `/portfolio` — Weddings showcase
- `/courses`, `/guides` — stubs
- `/auth/sign-in` — placeholder sign-in UI
- `/dashboard` — admin stub
- `/api/leads` — POST to create a Lead
- `/api/health` — health check
