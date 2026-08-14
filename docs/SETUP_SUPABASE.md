# Supabase Setup Guide

This guide walks you through setting up Supabase for ConnectOS.

## 1. Create Supabase Project

1. Go to https://supabase.com and sign up (or log in)
2. Click "New project"
3. Fill in:
   - **Name:** ConnectOS
   - **Database password:** Create a strong password (save it!)
   - **Region:** Choose closest to you
4. Click "Create new project" and wait for it to be ready (~2 minutes)

## 2. Get API Keys

1. Go to Settings > API
2. Copy these values:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` secret → `SUPABASE_SERVICE_ROLE_KEY`

3. Update `.env.local`:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 3. Set Up Google OAuth

1. Go to Authentication > Providers
2. Find "Google" and enable it
3. You'll need Google OAuth credentials:
   - Go to https://console.cloud.google.com
   - Create a new project
   - Enable Google+ API
   - Create OAuth 2.0 credentials (Web application)
   - Authorized redirect URIs:
     - `http://localhost:3000/auth/callback`
     - `https://your-domain.com/auth/callback` (for production)
   - Copy Client ID and Secret
4. In Supabase, paste these into the Google provider
5. Set authorized redirect URLs to match

## 4. Create Database Tables

Run the SQL from `docs/DATABASE_SCHEMA.md` in Supabase SQL Editor:

1. Go to SQL Editor > New Query
2. Copy and paste the schema
3. Click "Run"

Alternatively, run each CREATE TABLE statement individually.

## 5. Enable Row Level Security (RLS)

For each table, go to Authentication > Policies and set up:

1. Users can only see their own data
2. Service role can manage data

Example policy:
```sql
CREATE POLICY "users_can_read_own_data" ON contacts
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "users_can_insert_own_data" ON contacts
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users_can_update_own_data" ON contacts
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users_can_delete_own_data" ON contacts
  FOR DELETE
  USING (auth.uid() = user_id);
```

## 6. Test the Setup

```bash
npm run dev
```

Navigate to http://localhost:3000 and try signing in with Google.

## Troubleshooting

### "Missing Supabase URL or anon key"
- Check `.env.local` has correct values
- Restart dev server after changing `.env.local`

### "Supabase client error"
- Verify SUPABASE_URL format: `https://xxx.supabase.co`
- Check anon key is correct

### Google OAuth redirect error
- Add redirect URL to Google OAuth: `http://localhost:3000/auth/callback`
- In Supabase, set Site URL to your app URL

### RLS errors
- Enable public access for development (disable RLS)
- Or set up RLS policies for your user

## Production Deployment

When deploying to Vercel:

1. Add environment variables in Vercel Settings
2. Set NEXT_PUBLIC_APP_URL to your production domain
3. Add production redirect URL to Google OAuth
4. Enable RLS on production database
