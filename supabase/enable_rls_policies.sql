-- Enable RLS and create proper policies for authenticated users
-- Run this in the Supabase SQL editor for production

-- Enable RLS on tables
alter table public.ports enable row level security;
alter table public.common_parties enable row level security;
alter table public.vessels enable row level security;
alter table public.commodities enable row level security;
alter table public.bookings enable row level security;
alter table public.booking_items enable row level security;
alter table public.bills_of_lading enable row level security;
alter table public.container_activities enable row level security;
alter table public.charges enable row level security;
alter table public.documents enable row level security;
alter table public.containers enable row level security;
alter table public.port_charges enable row level security;

-- Ports table policies
create policy "Allow authenticated users to insert ports" on public.ports
  for insert with check (auth.role() = 'authenticated');

create policy "Allow authenticated users to select ports" on public.ports
  for select using (auth.role() = 'authenticated');

create policy "Allow authenticated users to update ports" on public.ports
  for update using (auth.role() = 'authenticated');

create policy "Allow authenticated users to delete ports" on public.ports
  for delete using (auth.role() = 'authenticated');

-- Common Parties table policies
create policy "Allow authenticated users to insert parties" on public.common_parties
  for insert with check (auth.role() = 'authenticated');

create policy "Allow authenticated users to select parties" on public.common_parties
  for select using (auth.role() = 'authenticated');

create policy "Allow authenticated users to update parties" on public.common_parties
  for update using (auth.role() = 'authenticated');

create policy "Allow authenticated users to delete parties" on public.common_parties
  for delete using (auth.role() = 'authenticated');

-- Bookings table policies
create policy "Allow authenticated users to insert bookings" on public.bookings
  for insert with check (auth.role() = 'authenticated');

create policy "Allow authenticated users to select bookings" on public.bookings
  for select using (auth.role() = 'authenticated');

create policy "Allow authenticated users to update bookings" on public.bookings
  for update using (auth.role() = 'authenticated');

create policy "Allow authenticated users to delete bookings" on public.bookings
  for delete using (auth.role() = 'authenticated');

-- Booking Items table policies
create policy "Allow authenticated users to insert booking items" on public.booking_items
  for insert with check (auth.role() = 'authenticated');

create policy "Allow authenticated users to select booking items" on public.booking_items
  for select using (auth.role() = 'authenticated');

create policy "Allow authenticated users to update booking items" on public.booking_items
  for update using (auth.role() = 'authenticated');

create policy "Allow authenticated users to delete booking items" on public.booking_items
  for delete using (auth.role() = 'authenticated');

-- Vessels table policies
create policy "Allow authenticated users to insert vessels" on public.vessels
  for insert with check (auth.role() = 'authenticated');

create policy "Allow authenticated users to select vessels" on public.vessels
  for select using (auth.role() = 'authenticated');

create policy "Allow authenticated users to update vessels" on public.vessels
  for update using (auth.role() = 'authenticated');

create policy "Allow authenticated users to delete vessels" on public.vessels
  for delete using (auth.role() = 'authenticated');

-- Commodities table policies
create policy "Allow authenticated users to insert commodities" on public.commodities
  for insert with check (auth.role() = 'authenticated');

create policy "Allow authenticated users to select commodities" on public.commodities
  for select using (auth.role() = 'authenticated');

create policy "Allow authenticated users to update commodities" on public.commodities
  for update using (auth.role() = 'authenticated');

create policy "Allow authenticated users to delete commodities" on public.commodities
  for delete using (auth.role() = 'authenticated');

-- Bills of Lading table policies
create policy "Allow authenticated users to insert bills" on public.bills_of_lading
  for insert with check (auth.role() = 'authenticated');

create policy "Allow authenticated users to select bills" on public.bills_of_lading
  for select using (auth.role() = 'authenticated');

create policy "Allow authenticated users to update bills" on public.bills_of_lading
  for update using (auth.role() = 'authenticated');

create policy "Allow authenticated users to delete bills" on public.bills_of_lading
  for delete using (auth.role() = 'authenticated');

-- Container Activities table policies
create policy "Allow authenticated users to insert container activities" on public.container_activities
  for insert with check (auth.role() = 'authenticated');

create policy "Allow authenticated users to select container activities" on public.container_activities
  for select using (auth.role() = 'authenticated');

create policy "Allow authenticated users to update container activities" on public.container_activities
  for update using (auth.role() = 'authenticated');

create policy "Allow authenticated users to delete container activities" on public.container_activities
  for delete using (auth.role() = 'authenticated');

-- Charges table policies
create policy "Allow authenticated users to insert charges" on public.charges
  for insert with check (auth.role() = 'authenticated');

create policy "Allow authenticated users to select charges" on public.charges
  for select using (auth.role() = 'authenticated');

create policy "Allow authenticated users to update charges" on public.charges
  for update using (auth.role() = 'authenticated');

create policy "Allow authenticated users to delete charges" on public.charges
  for delete using (auth.role() = 'authenticated');

-- Documents table policies
create policy "Allow authenticated users to insert documents" on public.documents
  for insert with check (auth.role() = 'authenticated');

create policy "Allow authenticated users to select documents" on public.documents
  for select using (auth.role() = 'authenticated');

create policy "Allow authenticated users to update documents" on public.documents
  for update using (auth.role() = 'authenticated');

create policy "Allow authenticated users to delete documents" on public.documents
  for delete using (auth.role() = 'authenticated');

-- Containers table policies
create policy "Allow authenticated users to insert containers" on public.containers
  for insert with check (auth.role() = 'authenticated');

create policy "Allow authenticated users to select containers" on public.containers
  for select using (auth.role() = 'authenticated');

create policy "Allow authenticated users to update containers" on public.containers
  for update using (auth.role() = 'authenticated');

create policy "Allow authenticated users to delete containers" on public.containers
  for delete using (auth.role() = 'authenticated');

-- Port Charges table policies
create policy "Allow authenticated users to insert port charges" on public.port_charges
  for insert with check (auth.role() = 'authenticated');

create policy "Allow authenticated users to select port charges" on public.port_charges
  for select using (auth.role() = 'authenticated');

create policy "Allow authenticated users to update port charges" on public.port_charges
  for update using (auth.role() = 'authenticated');

create policy "Allow authenticated users to delete port charges" on public.port_charges
  for delete using (auth.role() = 'authenticated');
