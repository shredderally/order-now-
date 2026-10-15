-- MenuBoxGh Premium Analytics
-- Initial database schema for Supabase.
--
-- Review this schema before applying it to your project.
-- Public analytics event ingestion must be implemented separately.
-- Do not enable unrestricted anonymous inserts into analytics_events.

create extension if not exists pgcrypto;


-- =====================================================
-- RESTAURANTS
-- Each restaurant belongs to an authenticated owner.
-- =====================================================

create table if not exists public.restaurants (
    id uuid primary key default gen_random_uuid(),

    owner_id uuid not null
        references auth.users(id)
        on delete cascade,

    name text not null,

    slug text unique,

    created_at timestamptz not null default now()
);


-- =====================================================
-- ANALYTICS EVENTS
-- Records interactions with restaurant menus.
-- =====================================================

create table if not exists public.analytics_events (
    id bigint generated always as identity primary key,

    restaurant_id uuid not null
        references public.restaurants(id)
        on delete cascade,

    event_type text not null
        check (
            event_type in (
                'menu_view',
                'dish_view',
                'dish_add_to_cart',
                'whatsapp_order_click'
            )
        ),

    dish_id text,

    dish_name text,

    session_id text,

    page_path text,

    created_at timestamptz not null default now()
);


-- =====================================================
-- INDEXES
-- Improve common analytics queries.
-- =====================================================

create index if not exists
    analytics_events_restaurant_created_idx
on public.analytics_events (
    restaurant_id,
    created_at desc
);


create index if not exists
    analytics_events_restaurant_type_created_idx
on public.analytics_events (
    restaurant_id,
    event_type,
    created_at desc
);


-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================

alter table public.restaurants
enable row level security;

alter table public.analytics_events
enable row level security;


-- =====================================================
-- RESTAURANT POLICIES
-- Owners can access their own restaurant records.
-- =====================================================

drop policy if exists
    "Owners can read their restaurants"
on public.restaurants;

create policy
    "Owners can read their restaurants"
on public.restaurants
for select
to authenticated
using (
    owner_id = (select auth.uid())
);


drop policy if exists
    "Owners can create their restaurants"
on public.restaurants;

create policy
    "Owners can create their restaurants"
on public.restaurants
for insert
to authenticated
with check (
    owner_id = (select auth.uid())
);


drop policy if exists
    "Owners can update their restaurants"
on public.restaurants;

create policy
    "Owners can update their restaurants"
on public.restaurants
for update
to authenticated
using (
    owner_id = (select auth.uid())
)
with check (
    owner_id = (select auth.uid())
);


drop policy if exists
    "Owners can delete their restaurants"
on public.restaurants;

create policy
    "Owners can delete their restaurants"
on public.restaurants
for delete
to authenticated
using (
    owner_id = (select auth.uid())
);


-- =====================================================
-- ANALYTICS POLICIES
-- Owners can read events belonging to their restaurants.
-- =====================================================

drop policy if exists
    "Owners can read their analytics events"
on public.analytics_events;

create policy
    "Owners can read their analytics events"
on public.analytics_events
for select
to authenticated
using (
    exists (
        select 1
        from public.restaurants r
        where r.id = analytics_events.restaurant_id
          and r.owner_id = (select auth.uid())
    )
);


-- =====================================================
-- IMPORTANT SECURITY NOTE
-- =====================================================
--
-- No public insert policy is created for analytics_events.
--
-- Do not allow anonymous visitors to insert arbitrary analytics
-- events directly into this table.
--
-- The next implementation stage must create a validated ingestion
-- function, such as a Supabase Edge Function.
--
-- That function should validate the restaurant identifier, accepted
-- event types, request payloads, and rate limits before recording events.
--
-- Never expose a Supabase service-role or secret key in browser code.
