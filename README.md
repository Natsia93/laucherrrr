# Launcher OS - RevoU

The intelligent operating system for modern execution — powered by AI.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **UI**: Tailwind CSS v4, Framer Motion, Lucide Icons, Recharts
- **AI**: Google Gemini, DeepSeek (streaming)
- **Database**: Neon Postgres (Drizzle ORM)
- **Auth**: Better Auth
- **Export**: PPTX (pptxgenjs), DOCX

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to access the app.

## Project Structure

```
src/
├── app/              # Next.js pages & API routes
│   ├── overview/     # Dashboard overview
│   ├── dashboard/    # AI Chat interface
│   ├── workspace/    # Document workspace
│   ├── generate/     # Document generator
│   ├── decks/        # Slide deck builder
│   ├── settings/     # App settings
│   └── api/          # Backend API routes
├── components/       # Reusable UI components
│   ├── layout/       # AppShell, Sidebar, Header
│   ├── overview/     # Overview dashboard cards
│   ├── dashboard/    # Dashboard-specific components
│   ├── decks/        # Slide editor components
│   └── ui/           # Shared UI primitives (shadcn)
├── db/               # Database schema & connection
├── lib/              # Utilities (auth, export, search)
└── fonts/            # Local font files (SF Pro, Geist, etc.)
```
