# ConnectOS

A personal networking capture and relationship system PWA. Scan business cards at networking events, organize contacts, and manage follow-ups.

## Tech Stack

- **Frontend:** Next.js 16, React 19, TypeScript, Tailwind CSS
- **Backend:** Supabase (PostgreSQL + Auth)
- **Hosting:** Vercel
- **PWA:** next-pwa

## Getting Started

### Prerequisites

- Node.js 18+
- Supabase account (free tier works great)

### Setup

1. **Clone the repository**
```bash
git clone https://github.com/vinayhegde/connectos.git
cd connectos
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up Supabase**
   - Create a new Supabase project at https://supabase.com
   - Enable Google OAuth provider in Authentication
   - Create tables using the schema in `docs/DATABASE_SCHEMA.md`

4. **Environment variables**
```bash
cp .env.local.example .env.local
```

Update `.env.local` with your Supabase credentials:
```
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

5. **Run development server**
```bash
npm run dev
```

Open http://localhost:3000 in your browser.

## Project Structure

```
connectos/
├── app/                    # Next.js app router
│   ├── (app)/             # Protected app routes
│   ├── auth/              # Auth routes
│   └── layout.tsx         # Root layout with auth provider
├── components/            # Reusable React components
├── lib/                   # Utilities (auth, db, etc.)
├── public/                # Static assets & PWA manifest
├── docs/                  # Documentation
└── package.json
```

## Database Setup

See `docs/DATABASE_SCHEMA.md` for the complete schema. Tables include:
- `contacts` - Business card information
- `events` - Networking events
- `interactions` - Relationship history
- `message_templates` - WhatsApp message templates
- `communications` - Sent messages tracking

## Features (Phase 1)

- ✅ Google authentication
- ✅ PWA installable on mobile
- ✅ Protected routes
- ✅ Basic navigation

## Next Steps

- Phase 2: Events & Contact Management
- Phase 3: Smart Card Scanner
- Phase 4: OCR & AI Extraction
- Phase 5: Relationship Intelligence
- Phase 6: WhatsApp Outreach
- Phase 7: Google Sheets Integration
- Phase 8: Export & Offline Sync

## Deployment

Deploy to Vercel with a single click:

```bash
vercel deploy
```

## License

MIT
