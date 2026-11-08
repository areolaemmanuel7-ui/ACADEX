# ACADEX 2.2 — Student Profile System

## Files
- `index.html` — public welcome page, sign-up/login modal, protected student dashboard and eight modules.
- `styles.css` — coordinated black-and-gold responsive styling.
- `app.js` — Supabase sign-up, email verification flow, login, session restoration, logout and module navigation.
- `supabase-setup.sql` — full initial database setup.
- `ACADEX_2_2_Profile_Migration.sql` — additive migration for the editable student profile fields.

## Keep your existing `config.js`
Do not replace it if it already contains your ACADEX Supabase project URL and public publishable key. The browser key is public/publishable; never put a service-role key or database password in frontend files.

Expected shape:
```js
window.ACADEX_CONFIG = {
  supabaseUrl: "YOUR_SUPABASE_PROJECT_URL",
  supabaseAnonKey: "YOUR_SUPABASE_PUBLISHABLE_KEY"
};
```

## ACADEX 2.2 update order
1. Back up the currently working ACADEX 2.1 `index.html`, `styles.css`, and `app.js` before replacing anything.
2. In Supabase SQL Editor, run `ACADEX_2_2_Profile_Migration.sql` first. It only adds missing profile columns and does not delete student data or triggers.
3. Replace `index.html`, `styles.css`, and `app.js` in the GitHub repository with the matching files in this package.
4. Keep your existing `config.js`, `manifest.json`, and `sw.js` unchanged.
5. Commit the files to `main` and let Netlify deploy from GitHub.
6. Keep the existing Supabase Site URL and Redirect URL for `https://acadexng.netlify.app`.
7. Test profile loading and editing while signed in. Check that a student's edits update only their own `student_profiles` row.

## Profile privacy
- The campus location field should describe the student's campus or city, not a home address or precise personal location.
- Interests are comma-separated in the form and saved as a PostgreSQL text array.
- Email confirmation verifies control of an email address; it does not verify university enrolment.
- Before public launch, review the current broad authenticated SELECT policy on `student_profiles` and decide which profile fields should be discoverable by other signed-in students.

## What ACADEX 2.2 adds
- An authenticated student can open an Edit student profile panel.
- Students can update full name, university, faculty, department, academic level, campus location and interests.
- Profile data is loaded from and saved to `public.student_profiles`.
- The existing registration, login, email confirmation, session restoration, logout and eight dashboard cards are preserved.

## What the base version does
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
