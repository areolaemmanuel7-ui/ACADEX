# ACADEX 2.4 — Replacement package

Mobile-first static HTML/CSS/JavaScript application for ACADEX. No React build step, paid AI service, payment processor, or secret API key is required.

## Package contents
- `index.html` — main application
- `styles.css` — responsive black-and-gold interface
- `app.js` — Supabase authentication, content feeds, submissions, reactions, saved posts, profile editing and book catalogue search
- `config.js` — ACADEX Supabase project URL and browser publishable key
- `admin.html` — moderation dashboard for authorised admins
- `privacy.html`, `terms.html` — starter policy pages
- `manifest.webmanifest`, `sw.js` — PWA metadata and offline shell

## Deploy
1. Back up the current GitHub repository.
2. Upload and replace the files in this package at the repository root. Keep the repository's GitHub Actions workflow if one exists.
3. In Supabase SQL Editor, run the separate `ACADEX_2.4_SUPABASE.sql` migration supplied with this release.
4. In Supabase Authentication settings, configure the Site URL and allowed redirect URLs to your deployed ACADEX domain.
5. Confirm email templates and email confirmation settings.
6. Deploy the repository through the existing GitHub Actions / hosting workflow.
7. Create the first admin by adding the user's UUID to `public.admin_users` using the SQL Editor. Do not make the admin role editable by ordinary users.

## Important
- `config.js` contains only the public publishable key. Never put a Supabase `service_role` key, database password, or other secret in browser files or GitHub.
- New submissions enter `pending` status and are not publicly visible until approved by an admin.
- Book catalogue results link to Google Books and Open Library. A catalogue result does not guarantee a free downloadable copy; follow the source's rights and availability terms.
- Marketplace listings include optional buyer–seller agreement terms and seller payment instructions. ACADEX does not hold funds, process payments, provide escrow, or guarantee transactions. Buyer and seller must independently verify details and agree terms before proceeding.
- Ads are submitted for moderation and only approved ads are displayed.
- The SQL migration is deliberately separate from this ZIP.

## Known implementation boundary
This release provides functional database-backed content modules and moderation. Direct messages, real payment processing/escrow, identity/face verification, file uploads/storage, push notifications and a fully featured threaded reply UI are not represented as completed features. Add these only with separate secure backend work and appropriate policies.
