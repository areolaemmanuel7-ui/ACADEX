# ACADEX 2.4.1 — Consolidated repair audit

## Repairs applied

1. **Profile permissions:** the browser now requests only profile columns granted to authenticated users. This avoids selecting the private `email` column through PostgREST.
2. **Profile creation:** removed the redundant browser-side profile upsert during sign-up. The database trigger creates the profile from authentication metadata, including when email confirmation means there is no active browser session yet.
3. **Profile editing:** profile edits no longer attempt to update the private email column. Existing profiles are updated; a missing profile can be inserted as a fallback.
4. **Authentication and submissions:** added clearer error handling for startup, sign-in/sign-up and content submissions.
5. **Worldwide book search:** removed Google Books and the extra open-access shortcut. The library now has one worldwide catalogue search using Open Library.
6. **SQL reruns:** the migration now drops its own `authenticated profiles readable` policy before recreating it, fixing a policy-already-exists failure on a second run.
7. **Service worker:** changed the cache version, added the admin page assets, refreshes navigation/assets from the network first, and no longer returns the homepage HTML for every missing offline asset.
8. **Admin moderation:** improved configuration/session/error reporting and disabled moderation buttons while a status change is in progress.
9. **Package layout:** the deployment ZIP puts website files at the ZIP root, so `index.html` is not hidden inside an extra directory.

## Validation performed

- `node --check` passed for `app.js`, `admin.js`, `config.js` and `sw.js`.
- No duplicate HTML IDs were found in the main, admin, privacy or terms pages.
- All local `href` and `src` references in those pages resolve to files included in the package.
- The web manifest parses as valid JSON.
- The application source contains no Google Books integration after the repair.

## Not verifiable from the supplied files alone

This is a static-source repair. I could not verify live Supabase connectivity, database migration execution, email delivery, account confirmation, or real user transactions because those require access to the active Supabase project and a deployed browser session. A headless browser smoke test was attempted but did not complete within the runtime limit.

## Required deployment steps

1. Back up the existing GitHub repository.
2. Extract this ZIP and upload **the files inside it** to the repository root (not the ZIP's containing folder).
3. In the correct Supabase project, run `ACADEX_2.4_SUPABASE_FIXED.sql` in the SQL Editor as project owner.
4. In Supabase Authentication settings, set the Site URL and allowed redirect URL to `https://areolaemmanuel7-ui.github.io/ACADEX/`.
5. Confirm the email confirmation and SMTP/email settings match the sign-up experience you want.
6. Deploy GitHub Pages and test sign-up, email confirmation, login, profile edit, one post per module, admin approval, and logout.
7. Promote an administrator by inserting that account's Auth user UUID into `public.admin_users` using the commented SQL at the end of the migration. Never let ordinary users assign themselves admin status.

## Security and product boundaries

- `config.js` contains a browser publishable key. That key is designed to be public; never put a Supabase `service_role` key or database password in the website.
- Marketplace posts only share seller-provided contact/payment instructions. ACADEX does not process payments or provide escrow.
- Privacy and terms pages are starter copy and need review for the actual operator and applicable Nigerian data-protection/legal requirements.
- File uploads, push notifications, real payment/escrow, identity verification and direct messaging are not implemented in this package.
