# ACADEX 2.1 — Authentication and Student Dashboard

## Files
- `index.html` — public welcome page, sign-up/login modal, protected student dashboard and eight modules.
- `styles.css` — coordinated black-and-gold responsive styling.
- `app.js` — Supabase sign-up, email verification flow, login, session restoration, logout and module navigation.
- `supabase-setup.sql` — student profile table, row-level security, profile sync trigger and student matching function.

## Keep your existing `config.js`
Do not replace it if it already contains your ACADEX Supabase project URL and public publishable key. The browser key is public/publishable; never put a service-role key or database password in frontend files.

Expected shape:
```js
window.ACADEX_CONFIG = {
  supabaseUrl: "YOUR_SUPABASE_PROJECT_URL",
  supabaseAnonKey: "YOUR_SUPABASE_PUBLISHABLE_KEY"
};
```

## Setup order
1. In the GitHub repository root, replace `index.html`, `styles.css`, and `app.js` with the matching files in this package.
2. Keep `config.js`, `manifest.json`, and `sw.js` unless there is a separate reason to change them.
3. In Supabase, open **SQL Editor**, create a new query, paste all of `supabase-setup.sql`, and run it.
4. In Supabase Authentication URL settings, add your GitHub Pages site URL to the allowed redirect URLs, for example:
   `https://YOUR-GITHUB-USERNAME.github.io/ACADEX/`
   Use your actual published ACADEX URL.
5. In Supabase Authentication settings, keep email confirmation enabled if you want users to verify email ownership before they can log in.
6. Commit the three website files. Wait for GitHub Pages deployment to finish before testing.

## What this version does
- Public visitors see the welcome page first.
- Students can register using any valid email address.
- Registration asks for full name, university, department and academic level.
- Supabase sends the confirmation email when email confirmation is enabled.
- Students can log in after confirming their email.
- A saved Supabase session restores the dashboard after refresh.
- Logout returns to the public welcome page.
- The eight-card dashboard is only shown when an authenticated Supabase session exists.
- Email verification is displayed separately from student enrolment verification.
- The matching function ranks same-university and same-department profiles first.

## Important matching limitation
The current matching setup can rank students at the same university and department. It does not yet calculate geographical distance or know whether an institution is truly nearby. That requires a maintained university/campus directory with verified location coordinates. The dashboard does not claim a student is enrolled just because their email was verified.

## Security notes
- The frontend publishable key is intended for browser use.
- Never expose Supabase service-role keys or database passwords.
- The SQL enables row-level security. The matching function only returns basic student profile fields to signed-in users.
- Do not collect student ID documents until a separate privacy, retention and administrator-review workflow has been designed.
