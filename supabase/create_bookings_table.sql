    -- Complete Shipping ERP Schema for Supabase
    -- Run this SQL in the Supabase SQL editor. Creates all tables needed for a production ERP.

    -- Enable UUID extension (if not already enabled)
    create extension if not exists "uuid-ossp";

    -- Common Parties Master (Shippers, Consignees, Agents, Carriers, etc.)
    create table if not exists public.common_parties (
    id bigint generated always as identity primary key,
    party_name text not null,
    party_type text not null check (party_type in ('Agent', 'Shipper', 'Consignee', 'Carrier', 'Port', 'CFS', 'Terminal')),
    contact_person text,
    email text,
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
    updated_at timestamptz not null default now(),
    unique(email)
    );

    -- Vessels Master
    create table if not exists public.vessels (
    id bigint generated always as identity primary key,
    vessel_name text not null unique,
    imo_no text unique,
    voyage text,
    vessel_type text check (vessel_type in ('Container', 'Breakbulk', 'RoRo', 'Tanker', 'General Cargo', 'Other')),
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
    is_active boolean default true,
    created_at timestamptz not null default now()
    );

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
    freight_type text default 'Regular' check (freight_type in ('Regular', 'DG', 'Reefer', 'Project', 'Breakbulk')),
    container_owner text default 'Principal' check (container_owner in ('Principal', 'Ship Owner', 'Third Party')),
    pol text,
    pod text,
    pot1 text,
    pot2 text,
    shipper_id bigint not null references public.common_parties(id),
    consignee_id bigint not null references public.common_parties(id),
    agent_pol_id bigint references public.common_parties(id),
    agent_pofd_id bigint references public.common_parties(id),
    agent1_id bigint references public.common_parties(id),
    agent2_id bigint references public.common_parties(id),
    act_shipper boolean default false,
    approval_status text not null default 'Draft' check (approval_status in ('Draft', 'Pending', 'Confirmed', 'Cancelled', 'Completed')),
    special_requirements text,
    free_days_pol integer default 0,
    detention_free_days_pofd integer default 0,
    detention_currency text default 'USD',
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
    service1 text default 'CY',
    service2 text default 'CY',
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
    size text,
    item_type text,
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
    port_of_loading text,
    port_of_discharge text,
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
    activity_type text check (activity_type in ('Gate In', 'Gate Out', 'Load', 'Discharge', 'Delivery', 'Return', 'Repair', 'Other')),
    status text,
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
    currency text not null,
    rate_per_day numeric(10, 2),
    rate_per_week numeric(10, 2),
    rate_per_month numeric(10, 2),
    container_type text check (container_type in ('20DC', '40DC', '40HC', 'Other')),
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
    charge_currency text default 'USD',
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
    document_type text check (document_type in ('B/L', 'Invoice', 'Packing List', 'Certificate', 'License', 'Insurance', 'Other')),
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
    currency text default 'USD',
    effective_date date,
    is_active boolean default true,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
    );

    -- Container Master
    create table if not exists public.containers (
    id bigint generated always as identity primary key,
    container_no text not null unique,
    container_type text check (container_type in ('20DC', '40DC', '40HC', 'HC', 'OT', 'FR', 'TK', 'RH')),
    owner_id bigint references public.common_parties(id),
    status text default 'Available' check (status in ('Available', 'In-Use', 'Damaged', 'Repair', 'Scrapped')),
    tare_weight numeric(8, 2),
    max_payload numeric(8, 2),
    last_inspection_date date,
    next_inspection_date date,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
    );

    -- Indexes for performance
    create index if not exists common_parties_party_type_idx on public.common_parties(party_type);
    create index if not exists common_parties_email_idx on public.common_parties(email);
    create index if not exists vessels_vessel_name_idx on public.vessels(vessel_name);
    create index if not exists vessels_imo_no_idx on public.vessels(imo_no);
    create index if not exists commodities_commodity_code_idx on public.commodities(commodity_code);
    create index if not exists commodities_hs_code_idx on public.commodities(hs_code);
    create index if not exists bookings_booking_no_idx on public.bookings(booking_no);
    create index if not exists bookings_booking_date_idx on public.bookings(booking_date);
    create index if not exists bookings_sailing_date_idx on public.bookings(sailing_date);
    create index if not exists bookings_approval_status_idx on public.bookings(approval_status);
    create index if not exists bookings_shipper_idx on public.bookings(shipper_id);
    create index if not exists bookings_consignee_idx on public.bookings(consignee_id);
    create index if not exists booking_items_booking_idx on public.booking_items(booking_id);
    create index if not exists bl_booking_idx on public.bills_of_lading(booking_id);
    create index if not exists bl_no_idx on public.bills_of_lading(bl_no);
    create index if not exists container_activities_booking_idx on public.container_activities(booking_id);
    create index if not exists container_activities_date_idx on public.container_activities(activity_date);
    create index if not exists charges_booking_idx on public.charges(booking_id);
    create index if not exists documents_booking_idx on public.documents(booking_id);
    create index if not exists documents_bl_idx on public.documents(bl_id);
    create index if not exists containers_container_no_idx on public.containers(container_no);
    create index if not exists containers_status_idx on public.containers(status);

    -- Seed Data: Common Parties
    insert into public.common_parties (party_name, party_type, contact_person, email, phone, address, city, country)
    values
    ('KD Shipping Agencies', 'Agent', 'MD. Kamal', 'kamal@kdshipping.com', '+880-123-456789', 'Port Road', 'Chittagong', 'Bangladesh'),
    ('WFF Shipping LLC', 'Carrier', 'John Smith', 'info@wffshipping.com', '+1-555-123-4567', 'Maritime Plaza', 'New York', 'USA'),
    ('Ocean Star Logistics', 'Shipper', 'Ahmed Hassan', 'contact@oceanstar.com', '+880-112-233-445', 'Ghazi Industrial', 'Chittagong', 'Bangladesh'),
    ('Global Consignee Ltd', 'Consignee', 'Sarah Lee', 'sarah@globalconsignee.com', '+44-20-1234-5678', 'London Port', 'London', 'UK'),
    ('Port of Chittagong', 'Port', 'Admin', 'admin@portchittagong.gov.bd', '+880-31-714501', 'Chittagong Port', 'Chittagong', 'Bangladesh'),
    ('Maersk Line', 'Carrier', 'Operations', 'ops@maersk.com', '+45-3313-3313', 'Copenhagen', 'Copenhagen', 'Denmark')
    on conflict do nothing;

    -- Seed Data: Vessels
    insert into public.vessels (vessel_name, imo_no, voyage, vessel_type, capacity_teu, flag, call_sign)
    values
    ('MSC CHITTAGONG', 'IMO1234567', 'VY-2026-001', 'Container', 8000, 'Panama', 'MSCC'),
    ('HORIZON ARROW', 'IMO2345678', 'VY-2026-002', 'RoRo', 5000, 'Singapore', 'HOAR'),
    ('PACIFIC BREEZE', 'IMO3456789', 'VY-2026-003', 'Breakbulk', 20000, 'Marshall Islands', 'PBZE')
    on conflict do nothing;

    -- Seed Data: Commodities
    insert into public.commodities (commodity_code, hs_code, description, commodity_group)
    values
    ('TEX-001', '5208', 'Cotton yarn and woven fabric', 'Textiles'),
    ('ELE-001', '8471', 'Computer hardware and electronics', 'Electronics'),
    ('MAC-001', '8429', 'Industrial machinery and parts', 'Machinery'),
    ('CHE-001', '2905', 'Chemical products', 'Chemicals'),
    ('MET-001', '7208', 'Iron and steel products', 'Metals')
    on conflict do nothing;

    -- Seed Data: Ports
    insert into public.ports (port_code, port_name, country, city, timezone)
    values
    ('BDCGA', 'Port of Chittagong', 'Bangladesh', 'Chittagong', 'Asia/Dhaka'),
    ('USNYC', 'Port of New York', 'USA', 'New York', 'America/New_York'),
    ('GBLON', 'Port of London', 'UK', 'London', 'Europe/London'),
    ('SGSIN', 'Port of Singapore', 'Singapore', 'Singapore', 'Asia/Singapore'),
    ('AEDXB', 'Port of Dubai', 'UAE', 'Dubai', 'Asia/Dubai')
    on conflict do nothing;

    -- Seed Data: Detention Rates
    insert into public.detention_rates (currency, rate_per_day, rate_per_week, rate_per_month, container_type)
    values
    ('USD', 45.00, 280.00, 1000.00, '20DC'),
    ('USD', 60.00, 380.00, 1400.00, '40DC'),
    ('USD', 60.00, 380.00, 1500.00, '40HC'),
    ('BDT', 4200.00, 26000.00, 90000.00, '20DC'),
    ('BDT', 5500.00, 34000.00, 120000.00, '40DC')
    on conflict do nothing;
