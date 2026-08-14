# ConnectOS Development Guide

## Project Overview

ConnectOS is a personal networking capture and relationship system PWA. It helps users scan business cards at networking events, organize contacts, and manage follow-ups.

## Architecture

- **Frontend:** Next.js 16 (App Router) + React 19 + TypeScript + Tailwind CSS
- **Database:** Supabase PostgreSQL with Row-Level Security
- **Authentication:** Supabase Auth with Google OAuth
- **Hosting:** Vercel
- **PWA:** next-pwa for offline capability

## Directory Structure

```
connectos/
├── app/                      # Next.js App Router
│   ├── (app)/               # Protected routes (require auth)
│   │   ├── dashboard/
│   │   ├── contacts/
│   │   ├── events/
│   │   ├── followups/
│   │   └── settings/
│   ├── auth/                # Auth-related routes
│   ├── layout.tsx           # Root layout with AuthProvider
│   ├── page.tsx             # Login page
│   └── globals.css
├── components/              # Reusable React components
│   ├── navigation.tsx       # Bottom/sidebar navigation
│   ├── contact-*            # Contact-related components
│   └── event-*              # Event-related components
├── lib/
│   ├── auth-context.tsx     # Auth state management
│   ├── supabase.ts          # Supabase client
│   └── hooks/               # Custom React hooks
│       ├── useContacts.ts   # Contact management
│       ├── useEvents.ts     # Event management
│       └── useInteractions.ts # Interaction history
├── public/
│   ├── manifest.json        # PWA manifest
│   └── (icons)              # App icons
└── docs/
    ├── DATABASE_SCHEMA.md   # Database structure
    ├── SETUP_SUPABASE.md    # Supabase setup guide
    └── GITHUB_DEPLOYMENT.md # Deployment guide
```

## Key Concepts

### Contacts
- **Types:** `historical` (archived cards) or `active` (relationships)
- **Fields:** name, company, designation, phone, email, address, industry
- **Duplicates:** Detected by phone, email, or name+company matching

### Events
- **Status:** `active` or `completed`
- **Purpose:** Group contacts captured at a specific networking event
- **Features:** Date, location, description, contact count

### Interactions
- **Purpose:** Track relationship history with each contact
- **Fields:** Date, event, relationship type, opportunity, stage, notes, follow-up date
- **One-to-many:** One contact can have multiple interactions

## Development Workflow

### Adding a New Feature

1. **Create hook** (`lib/hooks/useFeature.ts`) for database operations
2. **Create component** (`components/feature-*.tsx`) for UI
3. **Create page** (`app/(app)/feature/page.tsx`) to display
4. **Update navigation** if needed
5. **Test locally:** `npm run dev -- --webpack`
6. **Commit:** Use descriptive commit messages

### Database Changes

1. Update schema in `docs/DATABASE_SCHEMA.md`
2. Run SQL in Supabase SQL Editor
3. Update TypeScript interfaces in hooks
4. Add RLS policies for security

## Important Notes

### Authentication
- All app routes require authentication (protected by layout.tsx)
- User ID is automatically added to all database records
- Logout is available in Settings

### Database Access
- Always query with `user_id` to ensure data isolation
- Use hooks (useContacts, useEvents, etc.) instead of direct Supabase calls
- Enable RLS policies on production database

### Performance
- Contacts load with `order by created_at`
- Search uses case-insensitive ILIKE queries
- Duplicate detection checks phone/email first (fastest)

### PWA Features
- Offline-capable shell (navigation works offline)
- Service Worker handles caching (webpack mode only)
- Manifest allows installation on home screen

## Next Phases

### Phase 3: Smart Scanner
- Camera integration with browser APIs
- OCR text extraction (Tesseract.js or free API)
- AI structuring with Claude API
- Confidence scoring and review screen

### Phase 4: Relationships & Follow-ups
- Relationship category management
- Opportunity tracking
- Follow-up scheduling
- WhatsApp message templates

### Phase 5: Google Sheets Integration
- Export contacts to Google Sheets
- One-way sync (app → sheets)
- Event-specific tabs
- Automated updates

## Common Tasks

### To add a new field to contacts:
1. Update `Contact` interface in `lib/hooks/useContacts.ts`
2. Update SQL in `docs/DATABASE_SCHEMA.md`
3. Add column to Supabase table
4. Update `contact-form.tsx` to include new field
5. Update `contact-list.tsx` to display (if needed)

### To create a new database table:
1. Define interface in appropriate hook
2. Add SQL to `docs/DATABASE_SCHEMA.md`
3. Create table in Supabase
4. Add RLS policies
5. Create hook for CRUD operations

### To deploy:
1. Commit changes: `git add -A && git commit -m "..."`
2. Push to GitHub: `git push origin main`
3. Vercel auto-deploys on push
4. Check deployment status at vercel.com

## Environment Variables

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=ey...
SUPABASE_SERVICE_ROLE_KEY=ey...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Testing Locally

```bash
# Install dependencies
npm install

# Start dev server with webpack (required for PWA)
npm run dev -- --webpack

# Build for production
npm run build

# Test production build
npm run start
```

## Debugging Tips

- **Auth errors:** Check NEXT_PUBLIC_APP_URL and Supabase redirect URLs
- **Database errors:** Verify user_id is being set and RLS policies allow access
- **PWA not working:** Ensure webpack mode (--webpack flag)
- **Duplicate detection:** Check phone/email normalization logic
- **Component not rendering:** Verify it's in app/(app)/ for protection

## Code Style

- Use TypeScript for all new code
- Prefer hooks over class components
- Use Tailwind for styling (no CSS files)
- Keep components small and reusable
- Use descriptive variable names
- Add comments only for non-obvious logic

## Next Steps

1. Complete Phase 2 testing with sample data
2. Build Phase 3 (Smart Scanner) with OCR
3. Implement Phase 4 (Relationships)
4. Add Phase 5 (Google Sheets)
5. Production deployment and testing
