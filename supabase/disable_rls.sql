-- Disable RLS on all tables to allow insert operations
-- Run this in the Supabase SQL editor

alter table if exists public.ports disable row level security;
alter table if exists public.common_parties disable row level security;
alter table if exists public.vessels disable row level security;
alter table if exists public.commodities disable row level security;
alter table if exists public.bookings disable row level security;
alter table if exists public.booking_items disable row level security;
alter table if exists public.bills_of_lading disable row level security;
alter table if exists public.container_activities disable row level security;
alter table if exists public.charges disable row level security;
alter table if exists public.documents disable row level security;
alter table if exists public.containers disable row level security;
alter table if exists public.port_charges disable row level security;
alter table if exists public.currencies disable row level security;
alter table if exists public.container_types disable row level security;
alter table if exists public.services disable row level security;
alter table if exists public.approval_statuses disable row level security;
alter table if exists public.freight_types disable row level security;
alter table if exists public.container_owners disable row level security;
alter table if exists public.activity_types disable row level security;
alter table if exists public.document_types disable row level security;
alter table if exists public.container_statuses disable row level security;
alter table if exists public.vessel_types disable row level security;
alter table if exists public.party_types disable row level security;
alter table if exists public.detention_rates disable row level security;
