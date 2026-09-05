# Krishi Sahayak 🌾

Farmer procurement and slot-booking hackathon platform.

## Stack
- React + Vite frontend
- Node.js + Express backend
- PostgreSQL database (recommended: Supabase)
- Git + GitHub

## Project structure
```text
krishi-sahayak/
├── backend/
│   ├── .env.example
│   ├── schema.sql
│   ├── server.js
│   └── package.json
└── frontend/
    ├── src/
    ├── index.html
    └── package.json
```

## 1. Create PostgreSQL database
The easiest option for this hackathon is Supabase. Create a project, open **SQL Editor**, paste all of `backend/schema.sql`, and run it.

Then open **Connect** in Supabase and copy a PostgreSQL connection string. Supabase documents the connection-string options in its Postgres connection guide.

## 2. Connect backend
In a terminal:
```bash
cd backend
npm install
```

Copy `.env.example` to `.env` and put your PostgreSQL connection string into `DATABASE_URL`.

Start the API:
```bash
npm run dev
```

Check:
```text
http://localhost:5000/api/health
```

## 3. Start frontend
Open a second terminal:
```bash
cd frontend
npm install
npm run dev
```

Open the Vite URL shown in the terminal, normally:
```text
http://localhost:5173
```

## Demo accounts
- Farmer: `farmer@example.com` / `farmer123`
- Admin: `admin@example.com` / `admin123`

## GitHub
Create an empty GitHub repository named `krishi-sahayak` (do not add a README, .gitignore, or license because this project already contains them). Then from this project folder:

```bash
git init
git add .
git commit -m "Initial Krishi Sahayak platform"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/krishi-sahayak.git
git push -u origin main
```

**Never commit `backend/.env`.** It contains your database credentials.

## Deployment plan
- Frontend: Vercel or another static hosting provider
- Backend: Render, Railway, or another Node.js host
- Database: Supabase PostgreSQL

After deployment, set `DATABASE_URL`, `FRONTEND_URL`, and `NODE_ENV=production` in the backend host's environment variables.
