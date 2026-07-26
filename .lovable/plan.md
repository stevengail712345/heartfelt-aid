## Compassion Beyond Borders Foundation

Suggested name: **Compassion Beyond Boarders Foundation** — "Every donation is a thread that mends a life." (Alternatives if you prefer: Hearts Across Borders, The Lifeline Fund, Kindred Hands.) I'll use Bright Threads unless you pick another.

## What gets built

**Public site**

- Home: hero with live totals (raised, lives helped, countries), 15 urgent stories, how it works, testimony highlights, donate CTA
- Stories: grid of all campaigns with filters (Medical, Education, Housing, Emergency, Small Business) and sort (most urgent, nearly funded, newest)
- Story detail: hero photo, full story, USD progress bar (raised / goal / still needed), donor count, days left, updates timeline, donate panel with preset amounts ($25 / $50 / $100 / custom)
- Testimonies: photos and quotes from people and families already helped, each linked back to the campaign that funded them
- About, Contact, Transparency (where the money goes), plus legal pages

**Funding states across the campaigns** (as you asked)

- Full-need cases: nothing raised yet, whole amount required
- Part-funded cases: family already has a portion, so goal reflects only the gap
- In-progress cases: donations already received, progress bar partway
- Nearly-funded and fully-funded cases, so the "completed" state is visible too

**Content I'll create**  
~12 campaigns across Kenya, Philippines, Peru, Bangladesh, Ukraine, Brazil, Guatemala and Nepal, plus ~6 testimonies, all with generated photography. Realistic placeholder text and imagery you can edit or replace later from the admin.

**Admin area** (login-protected)

- Sign in with email/password and Google
- Dashboard: totals, recent donations
- Create/edit/delete campaigns: title, beneficiary, country, category, story, goal, amount already secured offline, cover photo upload, gallery, status, post updates
- Manage testimonies
- View donation records

**Donations (Stripe)**

- Real payments through Lovable's built-in Stripe integration — no Stripe account or API keys needed from you; a test environment is created immediately so we can test without real money, and going live requires claiming the account.
- One-time donations in USD, optional monthly giving, optional donor name/message, anonymous option
- Stripe Checkout, with a webhook that records the donation and increments the campaign's raised total automatically
- Thank-you page after checkout
- Digital/nonprofit giving is Stripe's lane here; I'll set tax handling to calculation-and-collection as appropriate once we see your seller country in the onboarding form.

## Technical outline

- Lovable Cloud for the database, auth and storage.
- Tables: `campaigns` (goal_cents, raised_cents, pre_secured_cents, status, country, category, image paths), `campaign_updates`, `testimonies`, `donations` (stripe session id, amount, donor name, anonymous flag, status), `user_roles` (separate table, `has_role()` security-definer function — never roles on profiles), `profiles`.
- RLS: public `anon` SELECT on published campaigns/testimonies only; all writes restricted to admins via `has_role`. Donations readable by admins only; inserted by the verified webhook using the service role. Explicit GRANTs on every new table.
- Public pages read through public server functions (no bearer needed) so SSR and social previews work; admin pages live under `_authenticated/` and use authenticated server functions.
- Stripe checkout session creation via a server function; webhook at `/api/public/webhooks/stripe` with signature verification before any write.
- Campaign totals are computed server-side from confirmed donations plus `pre_secured_cents` — never trusted from the client.
- Seed campaigns, testimonies and their funding states go in the migration as literal INSERTs so the first render is populated.
- Per-route SEO metadata; campaign pages emit og:image from the cover photo.

## Build order

1. Design direction + design tokens, layout shell
2. Enable Cloud; schema, RLS, seed data, generated imagery
3. Public pages (home, stories, story detail, testimonies, about, transparency)
4. Auth + admin dashboard and content management
5. Enable Stripe payments, create products/prices, checkout + webhook + thank-you page
6. End-to-end test of a test-mode donation updating a progress bar