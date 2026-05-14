-- Migration script to update existing tables to match new schema
-- Run this BEFORE running create_bookings_table.sql

-- Drop old tables in correct order (respecting foreign keys)
drop table if exists public.container_activities cascade;
drop table if exists public.booking_items cascade;
drop table if exists public.bills_of_lading cascade;
drop table if exists public.bookings cascade;
drop table if exists public.detention_rates cascade;
drop table if exists public.port_charges cascade;
drop table if exists public.charges cascade;
drop table if exists public.documents cascade;
drop table if exists public.containers cascade;
drop table if exists public.ports cascade;
drop table if exists public.commodities cascade;
drop table if exists public.vessels cascade;
drop table if exists public.common_parties cascade;

-- After dropping, run: create_bookings_table.sql to create fresh schema
