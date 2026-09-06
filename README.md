# Student Profile SaaS

Multi-tenant college profile and academic records platform for students, teachers, and college administrators.

## Development

Install dependencies:

```bash
npm install
```

Start PostgreSQL with the schema and demo data:

```bash
npm run db:up
```

Copy `.env.example` to `.env`, then start the API and web app in separate terminals:

```bash
npm run dev:api
npm run dev
```

The API runs at `http://localhost:4000` and the web app at `http://localhost:5173`.

Demo accounts are seeded by `database/seed.sql` with password `ChangeMe123!`:

- `admin@northstar.edu`
- `teacher@northstar.edu`
- `student@northstar.edu`

The database seed is for local development only. Change all credentials before deployment.

## Validation

```bash
npm run build:api
npm run build
npm run lint
```

## Architecture

- React + Vite + TypeScript frontend
- Express + JWT API
- PostgreSQL schema with college tenant ownership
- S3-compatible presigned document uploads
- Server-side teacher assignment scoping for marks, students, analytics, and AI tools
- Fixed parameterized AI tools with audit logging
