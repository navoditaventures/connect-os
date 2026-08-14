# GitHub & Vercel Deployment

## Step 1: Create GitHub Repository

### Option A: Using GitHub Web UI (Recommended)

1. Go to https://github.com/new
2. Fill in:
   - **Repository name:** `connectos`
   - **Description:** Personal networking capture and relationship system PWA
   - **Public/Private:** Choose based on preference
   - **Do NOT initialize with README** (we already have one)
3. Click "Create repository"

### Option B: Using git commands

After creating the empty repo on GitHub, push your code:

```bash
# Add GitHub as remote (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/connectos.git

# Rename branch if needed
git branch -M main

# Push to GitHub
git push -u origin main
```

## Step 2: Deploy to Vercel

### Option A: Using Vercel Web UI (Quickest)

1. Go to https://vercel.com
2. Sign up or log in with GitHub account
3. Click "Import Project"
4. Paste your GitHub repo URL
5. Click "Import"
6. Vercel will auto-detect Next.js
7. Add environment variables in Settings:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_APP_URL` (use your Vercel domain)
8. Click "Deploy"

### Option B: Using Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy from project directory
vercel

# Follow prompts to link to GitHub and deploy
```

## Step 3: Configure Custom Domain (Optional)

1. In Vercel dashboard, go to Settings > Domains
2. Add your custom domain
3. Update DNS records as instructed
4. Update `NEXT_PUBLIC_APP_URL` in env vars to your custom domain

## Step 4: Update Google OAuth for Production

1. Go to Google Cloud Console
2. Update OAuth app redirect URIs to include:
   - `https://your-vercel-domain.vercel.app/auth/callback`
   - `https://your-custom-domain.com/auth/callback` (if using custom domain)
3. Update Supabase Google provider with new credentials if needed

## Step 5: Update Supabase Settings

1. In Supabase, go to Settings > Auth
2. Set Site URL to your production domain
3. Update redirect URLs to production domain

## Production Checklist

- [ ] Environment variables set in Vercel
- [ ] Google OAuth configured for production domain
- [ ] Supabase CORS settings updated
- [ ] Custom domain configured (if using one)
- [ ] Database has RLS policies enabled
- [ ] Test login flow end-to-end

## Automatic Deployments

Once GitHub is connected to Vercel:
- Every push to `main` automatically deploys
- Preview deployments created for pull requests
- Easy rollback to previous versions

## Monitoring

In Vercel dashboard:
- View deployment logs: Deployments > logs
- Monitor performance: Analytics
- Check function execution: Logs
- View errors: Monitoring

## Continuous Integration

Add GitHub Actions for testing (optional):

Create `.github/workflows/test.yml`:
```yaml
name: Test
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm ci
      - run: npm run lint
      - run: npm run build
```
