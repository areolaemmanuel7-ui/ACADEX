ACADEX 2.3 — IMPLEMENTATION PACKAGE
===================================

This release builds on ACADEX 2.2 and preserves its authentication, student profile editor, dashboard, and existing modules. It removes the simulated checkout and all Flutterwave/payment-provider integration.

PACKAGE CONTENTS
----------------
index.html                         Main ACADEX application
styles.css                         Responsive black-and-gold styling
app.js                             Supabase auth, 2.2 profile system, modules and 2.3 features
ACADEX_2_2_Profile_Migration.sql   Additive profile migration reference
ACADEX_2_3_Preview_Migration.sql   Additive marketplace-listings-only migration
supabase-setup.sql                 Original setup reference; do not rerun on an existing project
config.example.js                  Placeholder only; retain your real config.js

VERSION 2.2 — PRESERVED
-----------------------
- Supabase registration, login, email confirmation, session restoration and logout.
- Student profile editing: name, university, faculty, department, academic level, campus location and interests.
- Existing profiles/student_profiles tables, triggers and student matching architecture.
- Existing dashboard and modules.

VERSION 2.3 — ADDED / UPDATED
-----------------------------
1. One unified Academic Library discovery module.
2. Google Books search results (public catalogue API; no API key configured).
3. Open Library search results (public catalogue API).
4. DOAB open-access discovery link with query forwarding.
5. Source attribution and licence reminder; ACADEX links to provider records and does not redistribute copyrighted books.
6. Marketplace seller–buyer MOU draft builder, including item, parties, amount, seller payment instructions, delivery terms and additional conditions.
7. Downloadable plain-text MOU draft. The draft is not legal advice, proof of payment, escrow or an ACADEX guarantee.
8. Direct buyer–seller payment instructions only. ACADEX does not collect, process, hold, transfer or refund money.
9. No checkout page, no simulated checkout, no Flutterwave scripts, keys or integration.
10. Privacy Policy, Terms of Service and FAQ support preview retained.
11. AE&co. ownership / ACADEX trademark / © 2026 wording retained.

DEPLOYMENT NOTES
----------------
- Keep your existing config.js beside index.html, styles.css and app.js. Do not replace it with config.example.js.
- Keep the existing Supabase project and tables. Do not rerun supabase-setup.sql on the live project.
- The 2.2 profile migration is additive; only run it if a required profile column is missing after checking the database.
- The 2.3 migration creates marketplace_listings only. It does not create payment, checkout, order, escrow or settlement tables. Review it before running in Supabase SQL Editor.
- Do not expose Supabase service-role keys, database passwords or other secrets in browser code or GitHub.
- The MOU is generated in the browser and is not saved to Supabase. Parties should verify identities, goods/services and payment details independently. Never share PINs, passwords or OTPs.
- Google Books and Open Library search depend on their public services and network availability. DOAB opens its catalogue search. Read each publisher/licence notice before downloading or sharing any book.
- Privacy Policy and Terms are draft product documents; obtain qualified Nigerian legal/privacy review before public launch.

DEPLOY
-----
1. Extract the ACADEX_2_3 folder.
2. Add your existing config.js (do not paste secret keys into public files).
3. Test on a separate Netlify preview/deploy context first.
4. Sign in with a test account; test profile editing, dashboard modules, library searches and MOU download.
5. Confirm there is no checkout page or Flutterwave integration.
6. Only replace the live deployment after reviewing the preview and confirming it works.

OWNERSHIP
---------
ACADEX™ — Owned by AE&co.
A product of AE&co.
© 2026 AE&co. All rights reserved.
