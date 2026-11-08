-- ACADEX 2.3 — marketplace listings foundation
-- Additive only. Does not modify profiles, student_profiles, auth triggers, or existing policies.
-- No checkout, payment provider, escrow, payout credentials, or card data are implemented here.

create table if not exists public.marketplace_listings (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (char_length(title) between 3 and 140),
  description text not null default '',
  category text not null default 'Other',
  price numeric(12,2) not null check (price >= 0),
  currency text not null default 'NGN' check (currency = 'NGN'),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists marketplace_listings_active_created_idx
  on public.marketplace_listings (is_active, created_at desc);
create index if not exists marketplace_listings_seller_idx
  on public.marketplace_listings (seller_id);

alter table public.marketplace_listings enable row level security;

drop policy if exists "Authenticated users can view active marketplace listings" on public.marketplace_listings;
create policy "Authenticated users can view active marketplace listings"
on public.marketplace_listings for select
to authenticated
using (is_active = true or seller_id = auth.uid());

drop policy if exists "Sellers can create their own marketplace listings" on public.marketplace_listings;
create policy "Sellers can create their own marketplace listings"
on public.marketplace_listings for insert
to authenticated
with check (seller_id = auth.uid());

drop policy if exists "Sellers can update their own marketplace listings" on public.marketplace_listings;
create policy "Sellers can update their own marketplace listings"
on public.marketplace_listings for update
to authenticated
using (seller_id = auth.uid())
with check (seller_id = auth.uid());

drop policy if exists "Sellers can delete their own marketplace listings" on public.marketplace_listings;
create policy "Sellers can delete their own marketplace listings"
on public.marketplace_listings for delete
to authenticated
using (seller_id = auth.uid());

-- No checkout, payment-provider, order-settlement, or escrow tables are created.
-- Buyer/seller payment instructions and MOU drafts are handled directly by the parties.
