-- Complete Shipping ERP Schema for Supabase - FIXED VERSION
-- Run this entire SQL in the Supabase SQL editor
-- This version has been tested and fixes all column reference issues

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ==================== MASTER TABLES ====================

-- Currencies Master
create table if not exists public.currencies (
  id bigint generated always as identity primary key,
  currency_code text not null unique,
  currency_name text not null,
  symbol text,
  is_active boolean default true,
  created_at timestamptz not null default now()
);

-- Container Types Master
create table if not exists public.container_types (
  id bigint generated always as identity primary key,
  container_code text not null unique,
  description text not null,
  size_category text check (size_category in ('20ft', '40ft', '45ft', 'Other')),
  teu numeric(3,1) default 1,
  is_active boolean default true,
  created_at timestamptz not null default now()
);

-- Services Master
create table if not exists public.services (
  id bigint generated always as identity primary key,
  service_code text not null unique,
  description text not null,
  is_active boolean default true,
  created_at timestamptz not null default now()
);

-- Approval Statuses Master
create table if not exists public.approval_statuses (
  id bigint generated always as identity primary key,
  status_code text not null unique,
  description text not null,
  is_active boolean default true,
  created_at timestamptz not null default now()
);

-- Freight Types Master
create table if not exists public.freight_types (
  id bigint generated always as identity primary key,
  freight_code text not null unique,
  description text not null,
  is_active boolean default true,
  created_at timestamptz not null default now()
);

-- Container Owners Master
create table if not exists public.container_owners (
  id bigint generated always as identity primary key,
  owner_code text not null unique,
  description text not null,
  is_active boolean default true,
  created_at timestamptz not null default now()
);

-- Activity Types Master
create table if not exists public.activity_types (
  id bigint generated always as identity primary key,
  activity_code text not null unique,
  description text not null,
  is_active boolean default true,
  created_at timestamptz not null default now()
);

-- Document Types Master
create table if not exists public.document_types (
  id bigint generated always as identity primary key,
  document_code text not null unique,
  description text not null,
  is_active boolean default true,
  created_at timestamptz not null default now()
);

-- Container Statuses Master
create table if not exists public.container_statuses (
  id bigint generated always as identity primary key,
  status_code text not null unique,
  description text not null,
  is_active boolean default true,
  created_at timestamptz not null default now()
);

-- Vessel Types Master
create table if not exists public.vessel_types (
  id bigint generated always as identity primary key,
  vessel_code text not null unique,
  description text not null,
  is_active boolean default true,
  created_at timestamptz not null default now()
);

-- Party Types Master (MUST be created before common_parties)
create table if not exists public.party_types (
  id bigint generated always as identity primary key,
  party_code text not null unique,
  description text not null,
  is_active boolean default true,
  created_at timestamptz not null default now()
);

-- Common Parties Master
create table if not exists public.common_parties (
  id bigint generated always as identity primary key,
  party_name text not null,
  party_type_id bigint references public.party_types(id),
  contact_person text,
  email text unique,
  phone text,
  address text,
  city text,
  country text,
  postal_code text,
  tax_id text,
  bank_name text,
  bank_account text,
  swift_code text,
  is_active boolean default true,
  credit_limit numeric(15, 2),
  payment_terms text,
  remarks text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Vessels Master
create table if not exists public.vessels (
  id bigint generated always as identity primary key,
  vessel_name text not null unique,
  imo_no text unique,
  voyage text,
  vessel_type_id bigint references public.vessel_types(id),
  capacity_teu integer,
  capacity_cbm numeric(12, 2),
  flag text,
  call_sign text,
  built_year integer,
  grt numeric(10, 2),
  nrt numeric(10, 2),
  owner_id bigint references public.common_parties(id),
  operator_id bigint references public.common_parties(id),
  eta date,
  etd date,
  port_of_registry text,
  is_active boolean default true,
  remarks text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Commodities Master
create table if not exists public.commodities (
  id bigint generated always as identity primary key,
  commodity_code text not null unique,
  hs_code text not null,
  description text,
  commodity_group text,
  is_dangerous boolean default false,
  is_perishable boolean default false,
  storage_requirement text,
  handling_notes text,
  is_active boolean default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Ports/Terminals Master
create table if not exists public.ports (
  id bigint generated always as identity primary key,
  port_code text not null unique,
  port_name text not null,
  country text,
  city text,
  coordinates text,
  timezone text,
  unlocode text,
  port_type text,
  facilities text,
  is_active boolean default true,
  created_at timestamptz not null default now()
);

-- ==================== TRANSACTION TABLES ====================

-- Bookings (Main Transaction)
create table if not exists public.bookings (
  id bigint generated always as identity primary key,
  booking_no text not null unique,
  approval_no text,
  reference_no text,
  booking_date date not null default now()::date,
  sailing_date date,
  carrier_id bigint references public.common_parties(id),
  commodity_id bigint references public.commodities(id),
  freight_type_id bigint references public.freight_types(id),
  container_owner_id bigint references public.container_owners(id),
  pol_id bigint references public.ports(id),
  pod_id bigint references public.ports(id),
  pot1 text,
  pot2 text,
  shipper_id bigint not null references public.common_parties(id),
  consignee_id bigint not null references public.common_parties(id),
  agent_pol_id bigint references public.common_parties(id),
  agent_pofd_id bigint references public.common_parties(id),
  agent1_id bigint references public.common_parties(id),
  agent2_id bigint references public.common_parties(id),
  act_shipper boolean default false,
  approval_status_id bigint references public.approval_statuses(id),
  special_requirements text,
  free_days_pol integer default 0,
  detention_free_days_pofd integer default 0,
  detention_currency_id bigint references public.currencies(id),
  slot_operator_t1_id bigint references public.common_parties(id),
  slot_operator_t2_id bigint references public.common_parties(id),
  cc_agent_id bigint references public.common_parties(id),
  egm text,
  berth text,
  wharf text,
  via_port text,
  temperature text,
  vent text,
  noc text,
  note text,
  cro_instruction text,
  container_info text,
  srr text,
  service1_id bigint references public.services(id),
  service2_id bigint references public.services(id),
  cargo_details jsonb default '[]'::jsonb,
  remarks text,
  total_cost numeric(15, 2) default 0,
  total_revenue numeric(15, 2) default 0,
  net_amount numeric(15, 2) default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Booking Items (Cargo Details)
create table if not exists public.booking_items (
  id bigint generated always as identity primary key,
  booking_id bigint not null references public.bookings(id) on delete cascade,
  sno integer,
  container_type_id bigint references public.container_types(id),
  quantity integer default 1,
  gross_weight text,
  packages text,
  unit text,
  cargo_volume text,
  comments text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Bills of Lading
create table if not exists public.bills_of_lading (
  id bigint generated always as identity primary key,
  bl_no text not null unique,
  booking_id bigint references public.bookings(id),
  issue_date date,
  shipper_id bigint references public.common_parties(id),
  consignee_id bigint references public.common_parties(id),
  notify_party_id bigint references public.common_parties(id),
  gross_weight text,
  packages text,
  volume text,
  vessel_name text,
  voyage_no text,
  port_of_loading_id bigint references public.ports(id),
  port_of_discharge_id bigint references public.ports(id),
  remarks text,
  bl_status text default 'Draft' check (bl_status in ('Draft', 'Issued', 'Surrendered', 'Cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Container Activities/Events
create table if not exists public.container_activities (
  id bigint generated always as identity primary key,
  booking_id bigint references public.bookings(id),
  bl_id bigint references public.bills_of_lading(id),
  container_no text,
  activity_date timestamptz,
  activity_type_id bigint references public.activity_types(id),
  status_id bigint references public.container_statuses(id),
  location text,
  terminal_name text,
  vessel_name text,
  voyage_no text,
  remarks text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Detention Rates
create table if not exists public.detention_rates (
  id bigint generated always as identity primary key,
  currency_id bigint references public.currencies(id),
  rate_per_day numeric(10, 2),
  rate_per_week numeric(10, 2),
  rate_per_month numeric(10, 2),
  container_type_id bigint references public.container_types(id),
  description text,
  effective_date date,
  is_active boolean default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Charges/Invoice Master
create table if not exists public.charges (
  id bigint generated always as identity primary key,
  booking_id bigint references public.bookings(id),
  charge_code text not null,
  charge_description text,
  charge_amount numeric(12, 2) not null,
  charge_currency_id bigint references public.currencies(id),
  quantity integer default 1,
  rate numeric(10, 2),
  vendor_id bigint references public.common_parties(id),
  is_billed boolean default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Documents Master
create table if not exists public.documents (
  id bigint generated always as identity primary key,
  booking_id bigint references public.bookings(id),
  bl_id bigint references public.bills_of_lading(id),
  document_type_id bigint references public.document_types(id),
  document_name text,
  file_url text,
  file_size integer,
  uploaded_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Port Charges Master
create table if not exists public.port_charges (
  id bigint generated always as identity primary key,
  port_id bigint references public.ports(id),
  charge_type text,
  charge_description text,
  base_rate numeric(12, 2),
  currency_id bigint references public.currencies(id),
  effective_date date,
  is_active boolean default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Container Master
create table if not exists public.containers (
  id bigint generated always as identity primary key,
  container_no text not null unique,
  container_type_id bigint references public.container_types(id),
  owner_id bigint references public.common_parties(id),
  status_id bigint references public.container_statuses(id),
  tare_weight numeric(8, 2),
  max_payload numeric(8, 2),
  last_inspection_date date,
  next_inspection_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ==================== INDEXES FOR PERFORMANCE ====================

create index if not exists idx_currencies_code on public.currencies(currency_code);
create index if not exists idx_container_types_code on public.container_types(container_code);
create index if not exists idx_services_code on public.services(service_code);
create index if not exists idx_approval_statuses_code on public.approval_statuses(status_code);
create index if not exists idx_freight_types_code on public.freight_types(freight_code);
create index if not exists idx_container_owners_code on public.container_owners(owner_code);
create index if not exists idx_activity_types_code on public.activity_types(activity_code);
create index if not exists idx_document_types_code on public.document_types(document_code);
create index if not exists idx_container_statuses_code on public.container_statuses(status_code);
create index if not exists idx_vessel_types_code on public.vessel_types(vessel_code);
create index if not exists idx_party_types_code on public.party_types(party_code);
create index if not exists idx_common_parties_type on public.common_parties(party_type_id);
create index if not exists idx_common_parties_email on public.common_parties(email);
create index if not exists idx_vessels_name on public.vessels(vessel_name);
create index if not exists idx_vessels_imo on public.vessels(imo_no);
create index if not exists idx_vessels_type on public.vessels(vessel_type_id);
create index if not exists idx_commodities_code on public.commodities(commodity_code);
create index if not exists idx_commodities_hs on public.commodities(hs_code);
create index if not exists idx_ports_code on public.ports(port_code);
create index if not exists idx_bookings_no on public.bookings(booking_no);
create index if not exists idx_bookings_date on public.bookings(booking_date);
create index if not exists idx_bookings_sailing on public.bookings(sailing_date);
create index if not exists idx_bookings_status on public.bookings(approval_status_id);
create index if not exists idx_bookings_shipper on public.bookings(shipper_id);
create index if not exists idx_bookings_consignee on public.bookings(consignee_id);
create index if not exists idx_booking_items_booking on public.booking_items(booking_id);
create index if not exists idx_bl_booking on public.bills_of_lading(booking_id);
create index if not exists idx_bl_no on public.bills_of_lading(bl_no);
create index if not exists idx_container_activities_booking on public.container_activities(booking_id);
create index if not exists idx_container_activities_date on public.container_activities(activity_date);
create index if not exists idx_charges_booking on public.charges(booking_id);
create index if not exists idx_documents_booking on public.documents(booking_id);
create index if not exists idx_documents_bl on public.documents(bl_id);
create index if not exists idx_containers_no on public.containers(container_no);
create index if not exists idx_containers_status on public.containers(status_id);

-- ==================== SEED DATA: MASTER TABLES ====================

-- Currencies
insert into public.currencies (currency_code, currency_name, symbol)
values
('USD', 'US Dollar', '$'),
('EUR', 'Euro', '€'),
('GBP', 'British Pound', '£'),
('BDT', 'Bangladeshi Taka', '৳'),
('JPY', 'Japanese Yen', '¥'),
('CNY', 'Chinese Yuan', '¥'),
('INR', 'Indian Rupee', '₹'),
('SGD', 'Singapore Dollar', 'S$'),
('AED', 'UAE Dirham', 'د.إ'),
('SAR', 'Saudi Riyal', '﷼')
on conflict (currency_code) do nothing;

-- Container Types
insert into public.container_types (container_code, description, size_category, teu)
values
('20DC', '20ft Dry Container', '20ft', 1),
('40DC', '40ft Dry Container', '40ft', 2),
('40HC', '40ft High Cube', '40ft', 2),
('45HC', '45ft High Cube', '45ft', 2.25),
('20OT', '20ft Open Top', '20ft', 1),
('40OT', '40ft Open Top', '40ft', 2),
('20FR', '20ft Flat Rack', '20ft', 1),
('40FR', '40ft Flat Rack', '40ft', 2),
('20TK', '20ft Tank Container', '20ft', 1),
('20RH', '20ft Reefer Container', '20ft', 1),
('40RH', '40ft Reefer Container', '40ft', 2)
on conflict (container_code) do nothing;

-- Services
insert into public.services (service_code, description)
values
('CY', 'Container Yard'),
('DOOR', 'Door Delivery'),
('PORT', 'Port to Port'),
('CFS', 'Container Freight Station'),
('ICD', 'Inland Container Depot'),
('AIR', 'Air Freight'),
('RAIL', 'Rail Freight'),
('ROAD', 'Road Freight')
on conflict (service_code) do nothing;

-- Approval Statuses
insert into public.approval_statuses (status_code, description)
values
('DRAFT', 'Draft'),
('PENDING', 'Pending Approval'),
('CONFIRMED', 'Confirmed'),
('CANCELLED', 'Cancelled'),
('COMPLETED', 'Completed'),
('ON_HOLD', 'On Hold')
on conflict (status_code) do nothing;

-- Freight Types
insert into public.freight_types (freight_code, description)
values
('REGULAR', 'Regular Freight'),
('DG', 'Dangerous Goods'),
('REEFER', 'Reefer Cargo'),
('PROJECT', 'Project Cargo'),
('BREAKBULK', 'Breakbulk'),
('RO_RO', 'Roll-on/Roll-off'),
('LIQUID', 'Liquid Bulk'),
('DRY', 'Dry Bulk')
on conflict (freight_code) do nothing;

-- Container Owners
insert into public.container_owners (owner_code, description)
values
('PRINCIPAL', 'Principal'),
('SHIP_OWNER', 'Ship Owner'),
('THIRD_PARTY', 'Third Party'),
('LESSOR', 'Container Lessor'),
('CARRIER', 'Shipping Line')
on conflict (owner_code) do nothing;

-- Activity Types
insert into public.activity_types (activity_code, description)
values
('GATE_IN', 'Gate In'),
('GATE_OUT', 'Gate Out'),
('LOAD', 'Load onto Vessel'),
('DISCHARGE', 'Discharge from Vessel'),
('DELIVERY', 'Delivery to Consignee'),
('RETURN', 'Return to Depot'),
('REPAIR', 'Repair/Maintenance'),
('INSPECTION', 'Inspection'),
('STORAGE', 'Storage'),
('TRANSHIPMENT', 'Transhipment')
on conflict (activity_code) do nothing;

-- Document Types
insert into public.document_types (document_code, description)
values
('BL', 'Bill of Lading'),
('INVOICE', 'Commercial Invoice'),
('PACKING_LIST', 'Packing List'),
('CERTIFICATE', 'Certificate of Origin'),
('LICENSE', 'Import/Export License'),
('INSURANCE', 'Insurance Certificate'),
('CO', 'Certificate of Origin'),
('COO', 'Certificate of Origin'),
('CI', 'Commercial Invoice'),
('PL', 'Packing List')
on conflict (document_code) do nothing;

-- Container Statuses
insert into public.container_statuses (status_code, description)
values
('AVAILABLE', 'Available'),
('IN_USE', 'In Use'),
('DAMAGED', 'Damaged'),
('REPAIR', 'Under Repair'),
('SCRAPPED', 'Scrapped'),
('LOST', 'Lost'),
('SOLD', 'Sold'),
('LEASED', 'Leased Out')
on conflict (status_code) do nothing;

-- Vessel Types
insert into public.vessel_types (vessel_code, description)
values
('CONTAINER', 'Container Ship'),
('BREAKBULK', 'Breakbulk Ship'),
('RO_RO', 'Roll-on/Roll-off Ship'),
('TANKER', 'Tanker'),
('GENERAL_CARGO', 'General Cargo Ship'),
('BULK_CARRIER', 'Bulk Carrier'),
('REEFER', 'Reefer Ship'),
('PASSENGER', 'Passenger Ship'),
('OTHER', 'Other')
on conflict (vessel_code) do nothing;

-- Party Types (CRITICAL: Must be inserted before common_parties)
insert into public.party_types (party_code, description)
values
('AGENT', 'Shipping Agent'),
('SHIPPER', 'Shipper'),
('CONSIGNEE', 'Consignee'),
('CARRIER', 'Shipping Carrier'),
('PORT', 'Port Authority'),
('CFS', 'Container Freight Station'),
('TERMINAL', 'Terminal Operator'),
('FORWARDER', 'Freight Forwarder'),
('CUSTOMS', 'Customs Broker'),
('INSURANCE', 'Insurance Provider')
on conflict (party_code) do nothing;

-- ==================== SEED DATA: COMMON PARTIES ====================
-- Now that party_types exists, we can insert common_parties

insert into public.common_parties (party_name, party_type_id, contact_person, email, phone, address, city, country)
values
('KD Shipping Agencies', (select id from public.party_types where party_code = 'AGENT' limit 1), 'MD. Kamal', 'kamal@kdshipping.com', '+880-123-456789', 'Port Road', 'Chittagong', 'Bangladesh'),
('WFF Shipping LLC', (select id from public.party_types where party_code = 'CARRIER' limit 1), 'John Smith', 'info@wffshipping.com', '+1-555-123-4567', 'Maritime Plaza', 'New York', 'USA'),
('Ocean Star Logistics', (select id from public.party_types where party_code = 'SHIPPER' limit 1), 'Ahmed Hassan', 'contact@oceanstar.com', '+880-112-233-445', 'Ghazi Industrial', 'Chittagong', 'Bangladesh'),
('Global Consignee Ltd', (select id from public.party_types where party_code = 'CONSIGNEE' limit 1), 'Sarah Lee', 'sarah@globalconsignee.com', '+44-20-1234-5678', 'London Port', 'London', 'UK'),
('Port Authority Chittagong', (select id from public.party_types where party_code = 'PORT' limit 1), 'Admin', 'admin@portchittagong.gov.bd', '+880-31-714501', 'Chittagong Port', 'Chittagong', 'Bangladesh'),
('Maersk Line', (select id from public.party_types where party_code = 'CARRIER' limit 1), 'Operations', 'ops@maersk.com', '+45-3313-3313', 'Copenhagen', 'Copenhagen', 'Denmark')
on conflict (email) do nothing;

-- ==================== SEED DATA: VESSELS ====================

insert into public.vessels (vessel_name, imo_no, voyage, vessel_type_id, capacity_teu, flag, call_sign)
values
('MSC CHITTAGONG', 'IMO1234567', 'VY-2026-001', (select id from public.vessel_types where vessel_code = 'CONTAINER' limit 1), 8000, 'Panama', 'MSCC'),
('HORIZON ARROW', 'IMO2345678', 'VY-2026-002', (select id from public.vessel_types where vessel_code = 'RO_RO' limit 1), 5000, 'Singapore', 'HOAR'),
('PACIFIC BREEZE', 'IMO3456789', 'VY-2026-003', (select id from public.vessel_types where vessel_code = 'BREAKBULK' limit 1), 20000, 'Marshall Islands', 'PBZE')
on conflict (vessel_name) do nothing;

-- ==================== SEED DATA: COMMODITIES ====================

insert into public.commodities (commodity_code, hs_code, description, commodity_group)
values
('TEX-001', '5208', 'Cotton yarn and woven fabric', 'Textiles'),
('ELE-001', '8471', 'Computer hardware and electronics', 'Electronics'),
('MAC-001', '8429', 'Industrial machinery and parts', 'Machinery'),
('CHE-001', '2905', 'Chemical products', 'Chemicals'),
('MET-001', '7208', 'Iron and steel products', 'Metals')
on conflict (commodity_code) do nothing;

-- ==================== SEED DATA: PORTS ====================

insert into public.ports (port_code, port_name, country, city, timezone, unlocode)
values
('BDCGA', 'Port of Chittagong', 'Bangladesh', 'Chittagong', 'Asia/Dhaka', 'BDCGP'),
('USNYC', 'Port of New York', 'USA', 'New York', 'America/New_York', 'USNYC'),
('GBLON', 'Port of London', 'UK', 'London', 'Europe/London', 'GBLON'),
('SGSIN', 'Port of Singapore', 'Singapore', 'Singapore', 'Asia/Singapore', 'SGSIN'),
('AEDXB', 'Port of Dubai', 'UAE', 'Dubai', 'Asia/Dubai', 'AEDXB'),
('HKHKG', 'Port of Hong Kong', 'Hong Kong', 'Hong Kong', 'Asia/Hong_Kong', 'HKHKG'),
('JPTYO', 'Port of Tokyo', 'Japan', 'Tokyo', 'Asia/Tokyo', 'JPTYO'),
('CNSHA', 'Port of Shanghai', 'China', 'Shanghai', 'Asia/Shanghai', 'CNSHA'),
('INBOM', 'Port of Mumbai', 'India', 'Mumbai', 'Asia/Kolkata', 'INBOM'),
('MYKUL', 'Port of Kuala Lumpur', 'Malaysia', 'Kuala Lumpur', 'Asia/Kuala_Lumpur', 'MYKUL')
on conflict (port_code) do nothing;

-- ==================== SEED DATA: DETENTION RATES ====================

insert into public.detention_rates (currency_id, rate_per_day, rate_per_week, rate_per_month, container_type_id, description, effective_date, is_active)
values
((select id from public.currencies where currency_code = 'USD' limit 1), 45.00, 280.00, 1000.00, (select id from public.container_types where container_code = '20DC' limit 1), '20ft Detention', now()::date, true),
((select id from public.currencies where currency_code = 'USD' limit 1), 60.00, 380.00, 1400.00, (select id from public.container_types where container_code = '40DC' limit 1), '40ft Detention', now()::date, true),
((select id from public.currencies where currency_code = 'USD' limit 1), 60.00, 380.00, 1500.00, (select id from public.container_types where container_code = '40HC' limit 1), '40ft HC Detention', now()::date, true),
((select id from public.currencies where currency_code = 'BDT' limit 1), 4200.00, 26000.00, 90000.00, (select id from public.container_types where container_code = '20DC' limit 1), '20ft Detention BDT', now()::date, true),
((select id from public.currencies where currency_code = 'BDT' limit 1), 5500.00, 34000.00, 120000.00, (select id from public.container_types where container_code = '40DC' limit 1), '40ft Detention BDT', now()::date, true)
on conflict do nothing;

-- ==================== VERIFICATION ====================
-- Run these queries to verify data was loaded:
-- SELECT COUNT(*) as currencies_count FROM public.currencies;
-- SELECT COUNT(*) as container_types_count FROM public.container_types;
-- SELECT COUNT(*) as party_types_count FROM public.party_types;
-- SELECT COUNT(*) as common_parties_count FROM public.common_parties;
-- SELECT COUNT(*) as vessels_count FROM public.vessels;
-- SELECT COUNT(*) as ports_count FROM public.ports;
-- SELECT COUNT(*) as detention_rates_count FROM public.detention_rates;
