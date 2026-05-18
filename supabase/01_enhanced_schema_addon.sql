-- NVOCC ERP Enhanced Schema - Market Ready Features
-- This script adds approval workflows, role-based access, locking mechanisms, and audit trail
-- Run AFTER create_bookings_table.sql

-- ============================================================================
-- SECTION 1: USER MANAGEMENT & ROLES
-- ============================================================================

-- User Roles Enum
CREATE TABLE IF NOT EXISTS public.user_roles (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  role_code TEXT NOT NULL UNIQUE,
  role_name TEXT NOT NULL,
  description TEXT,
  permissions JSONB DEFAULT '{}', -- Stores allowed actions per role
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- System Users
CREATE TABLE IF NOT EXISTS public.system_users (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  phone TEXT,
  company_id BIGINT,
  department TEXT,
  role_id BIGINT NOT NULL REFERENCES public.user_roles(id),
  is_active BOOLEAN DEFAULT TRUE,
  last_login TIMESTAMPTZ,
  failed_login_attempts INT DEFAULT 0,
  locked_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- SECTION 2: BOOKING WORKFLOW & APPROVAL SYSTEM
-- ============================================================================

-- Booking Status Master
CREATE TABLE IF NOT EXISTS public.booking_statuses (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  status_code TEXT NOT NULL UNIQUE,
  status_name TEXT NOT NULL,
  description TEXT,
  display_order INT,
  color_code TEXT, -- For UI (e.g., #FF5733)
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Insert standard booking statuses
INSERT INTO public.booking_statuses (status_code, status_name, description, display_order, color_code) VALUES
('DRAFT', 'Draft', 'Booking created but not submitted', 1, '#E8E8E8'),
('PENDING_APPROVAL', 'Pending Approval', 'Awaiting approval', 2, '#FFC300'),
('APPROVED', 'Approved', 'Booking approved and locked', 3, '#28A745'),
('LOCKED', 'Locked', 'Booking locked after approval', 4, '#0056B3'),
('UNLOCKED', 'Unlocked', 'Temporarily unlocked by admin', 5, '#FF9800'),
('REJECTED', 'Rejected', 'Booking rejected by approver', 6, '#DC3545'),
('CANCELLED', 'Cancelled', 'Booking cancelled', 7, '#6C757D')
ON CONFLICT (status_code) DO NOTHING;

-- Approval Workflow Table
CREATE TABLE IF NOT EXISTS public.booking_approvals (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  booking_id BIGINT NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  approval_level INT NOT NULL, -- 1, 2, 3, etc.
  approval_type TEXT NOT NULL, -- 'COMPLIANCE', 'FINANCIAL', 'ADMIN'
  status TEXT NOT NULL DEFAULT 'PENDING', -- PENDING, APPROVED, REJECTED
  approver_id BIGINT REFERENCES public.system_users(id),
  approval_date TIMESTAMPTZ,
  comments TEXT,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- B/L Lock History & Auto-Unlock Timer
CREATE TABLE IF NOT EXISTS public.bl_lock_history (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  booking_id BIGINT NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  locked_by_id BIGINT REFERENCES public.system_users(id),
  locked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  unlock_expires_at TIMESTAMPTZ, -- 24 hours from unlock
  unlocked_by_id BIGINT REFERENCES public.system_users(id),
  unlock_reason TEXT,
  unlock_date TIMESTAMPTZ,
  relock_date TIMESTAMPTZ,
  lock_status TEXT DEFAULT 'LOCKED', -- LOCKED, UNLOCKED, EXPIRED_RELOCK
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- SECTION 3: AUDIT TRAIL
-- ============================================================================

-- Audit Log for all data changes
CREATE TABLE IF NOT EXISTS public.audit_log (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  table_name TEXT NOT NULL,
  record_id BIGINT NOT NULL,
  operation TEXT NOT NULL, -- INSERT, UPDATE, DELETE
  user_id BIGINT REFERENCES public.system_users(id),
  old_values JSONB, -- Previous values
  new_values JSONB, -- Current values
  changed_fields TEXT[], -- List of fields changed
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- SECTION 4: DOCUMENT MANAGEMENT
-- ============================================================================

-- Documents (POD, D/O, CRO, GI, etc.)
CREATE TABLE IF NOT EXISTS public.bl_documents (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  booking_id BIGINT NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  document_type_id BIGINT REFERENCES public.document_types(id),
  document_number TEXT,
  document_status TEXT DEFAULT 'DRAFT', -- DRAFT, PREPARED, ISSUED, CANCELLED
  file_url TEXT,
  file_size INT,
  file_hash TEXT,
  issued_date TIMESTAMPTZ,
  issued_by_id BIGINT REFERENCES public.system_users(id),
  recipient_email TEXT,
  sent_date TIMESTAMPTZ,
  recipient_received_date TIMESTAMPTZ,
  remarks TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- SECTION 5: CONTAINER TRACKING & EQUIPMENT
-- ============================================================================

-- Container Records with status tracking
CREATE TABLE IF NOT EXISTS public.container_records (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  booking_id BIGINT NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  container_no TEXT NOT NULL UNIQUE,
  container_type_id BIGINT REFERENCES public.container_types(id),
  container_owner_id BIGINT REFERENCES public.container_owners(id),
  seal_no TEXT,
  seal2_no TEXT,
  load_type TEXT, -- FCL, LCL, CY, DOOR
  current_status_id BIGINT REFERENCES public.container_statuses(id),
  current_location TEXT,
  gross_weight NUMERIC(10, 2),
  net_weight NUMERIC(10, 2),
  tare_weight NUMERIC(10, 2),
  cbm NUMERIC(10, 2),
  commodity_id BIGINT REFERENCES public.commodities(id),
  hs_code TEXT,
  is_dangerous BOOLEAN DEFAULT FALSE,
  temperature_required NUMERIC(5, 2), -- For reefer containers
  last_status_update TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Container Activity Log (gating, stuffing, unstuffing, etc.)
CREATE TABLE IF NOT EXISTS public.container_activity_log (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  container_id BIGINT NOT NULL REFERENCES public.container_records(id) ON DELETE CASCADE,
  activity_type_id BIGINT REFERENCES public.activity_types(id),
  activity_date TIMESTAMPTZ NOT NULL,
  activity_location TEXT,
  remarks TEXT,
  recorded_by_id BIGINT REFERENCES public.system_users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- SECTION 6: CHARGES & BILLING
-- ============================================================================

-- Detention Charges Configuration
CREATE TABLE IF NOT EXISTS public.detention_rates (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  container_type_id BIGINT REFERENCES public.container_types(id),
  port_id BIGINT REFERENCES public.ports(id),
  free_days INT DEFAULT 7,
  daily_rate NUMERIC(10, 2),
  currency_id BIGINT REFERENCES public.currencies(id),
  effective_from DATE,
  effective_to DATE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Charges Ledger (detention, port, handling, etc.)
CREATE TABLE IF NOT EXISTS public.charges (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  booking_id BIGINT NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  charge_type TEXT NOT NULL, -- DETENTION, PORT, HANDLING, DOCUMENTATION, OTHER
  charge_code TEXT,
  description TEXT,
  amount NUMERIC(12, 2) NOT NULL,
  currency_id BIGINT REFERENCES public.currencies(id),
  is_cost BOOLEAN DEFAULT TRUE, -- TRUE = cost, FALSE = revenue
  charge_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  due_date TIMESTAMPTZ,
  paid_date TIMESTAMPTZ,
  payment_status TEXT DEFAULT 'PENDING', -- PENDING, PAID, WRITTEN_OFF
  invoice_no TEXT,
  remarks TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Port Charges Matrix
CREATE TABLE IF NOT EXISTS public.port_charges (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  port_id BIGINT NOT NULL REFERENCES public.ports(id),
  charge_code TEXT NOT NULL,
  charge_description TEXT,
  base_rate NUMERIC(12, 2),
  unit TEXT, -- PER_CONTAINER, PER_CBM, PER_TON, FLAT
  currency_id BIGINT REFERENCES public.currencies(id),
  effective_from DATE,
  effective_to DATE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- SECTION 7: STATEMENT OF ACCOUNT (SOA)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.soa_headers (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  soa_no TEXT NOT NULL UNIQUE,
  party_id BIGINT NOT NULL REFERENCES public.common_parties(id),
  soa_period_from DATE NOT NULL,
  soa_period_to DATE NOT NULL,
  total_amount NUMERIC(15, 2),
  currency_id BIGINT REFERENCES public.currencies(id),
  soa_status TEXT DEFAULT 'DRAFT', -- DRAFT, ISSUED, PAID, CANCELLED
  issued_date TIMESTAMPTZ,
  due_date TIMESTAMPTZ,
  payment_date TIMESTAMPTZ,
  created_by_id BIGINT REFERENCES public.system_users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- SECTION 8: SYSTEM CONFIGURATION
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.system_config (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  config_key TEXT NOT NULL UNIQUE,
  config_value TEXT,
  config_type TEXT, -- STRING, NUMBER, BOOLEAN, JSON
  description TEXT,
  updated_by_id BIGINT REFERENCES public.system_users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Insert default configurations
INSERT INTO public.system_config (config_key, config_value, config_type, description) VALUES
('BOOKING_LOCK_DURATION_HOURS', '24', 'NUMBER', 'Hours before auto-relock after manual unlock'),
('APPROVAL_LEVEL_1_NAME', 'Department Head', 'STRING', 'First approval level name'),
('APPROVAL_LEVEL_2_NAME', 'Senior Manager', 'STRING', 'Second approval level name'),
('APPROVAL_LEVEL_3_NAME', 'Admin', 'STRING', 'Third approval level name'),
('MAX_FAILED_LOGINS', '5', 'NUMBER', 'Max failed login attempts before account lock'),
('SESSION_TIMEOUT_MINUTES', '30', 'NUMBER', 'User session timeout duration'),
('ENABLE_AUDIT_LOGGING', 'true', 'BOOLEAN', 'Enable/disable audit trail logging')
ON CONFLICT (config_key) DO NOTHING;

-- ============================================================================
-- SECTION 9: INDEXES FOR PERFORMANCE
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_booking_approvals_booking_id ON public.booking_approvals(booking_id);
CREATE INDEX IF NOT EXISTS idx_booking_approvals_approver_id ON public.booking_approvals(approver_id);
CREATE INDEX IF NOT EXISTS idx_booking_approvals_status ON public.booking_approvals(status);
CREATE INDEX IF NOT EXISTS idx_bl_lock_history_booking_id ON public.bl_lock_history(booking_id);
CREATE INDEX IF NOT EXISTS idx_bl_lock_history_lock_status ON public.bl_lock_history(lock_status);
CREATE INDEX IF NOT EXISTS idx_audit_log_table_record ON public.audit_log(table_name, record_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_user_id ON public.audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON public.audit_log(created_at);
CREATE INDEX IF NOT EXISTS idx_bl_documents_booking_id ON public.bl_documents(booking_id);
CREATE INDEX IF NOT EXISTS idx_container_records_booking_id ON public.container_records(booking_id);
CREATE INDEX IF NOT EXISTS idx_container_activity_container_id ON public.container_activity_log(container_id);
CREATE INDEX IF NOT EXISTS idx_charges_booking_id ON public.charges(booking_id);
CREATE INDEX IF NOT EXISTS idx_charges_status ON public.charges(payment_status);
CREATE INDEX IF NOT EXISTS idx_soa_headers_party_id ON public.soa_headers(party_id);

-- ============================================================================
-- SECTION 10: VIEWS FOR DASHBOARDS
-- ============================================================================

-- Pending Approvals View
CREATE OR REPLACE VIEW public.v_pending_approvals AS
SELECT 
  ba.id,
  ba.booking_id,
  b.booking_no,
  b.sailing_date,
  ba.approval_level,
  ba.approval_type,
  ur.role_name,
  u.full_name as approver_name,
  ba.created_at,
  ba.updated_at
FROM public.booking_approvals ba
JOIN public.bookings b ON ba.booking_id = b.id
JOIN public.system_users u ON ba.approver_id = u.id
JOIN public.user_roles ur ON u.role_id = ur.id
WHERE ba.status = 'PENDING'
ORDER BY ba.created_at DESC;

-- Locked & Unlocked B/L View
CREATE OR REPLACE VIEW public.v_bl_lock_status AS
SELECT 
  blh.id,
  blh.booking_id,
  b.booking_no,
  blh.locked_at,
  blh.unlock_expires_at,
  blh.lock_status,
  CASE 
    WHEN blh.lock_status = 'UNLOCKED' AND blh.unlock_expires_at < NOW() THEN 'RELOCK_DUE'
    ELSE blh.lock_status
  END as effective_status,
  EXTRACT(HOUR FROM (blh.unlock_expires_at - NOW())) as hours_until_relock
FROM public.bl_lock_history blh
JOIN public.bookings b ON blh.booking_id = b.id
WHERE blh.lock_status IN ('LOCKED', 'UNLOCKED')
ORDER BY blh.unlock_expires_at ASC;

-- Cost Summary View
CREATE OR REPLACE VIEW public.v_booking_financial_summary AS
SELECT 
  b.id,
  b.booking_no,
  COALESCE(SUM(CASE WHEN c.is_cost THEN c.amount ELSE 0 END), 0) as total_cost,
  COALESCE(SUM(CASE WHEN NOT c.is_cost THEN c.amount ELSE 0 END), 0) as total_revenue,
  COALESCE(SUM(CASE WHEN NOT c.is_cost THEN c.amount ELSE 0 END), 0) - 
  COALESCE(SUM(CASE WHEN c.is_cost THEN c.amount ELSE 0 END), 0) as net_profit
FROM public.bookings b
LEFT JOIN public.charges c ON b.id = c.booking_id
GROUP BY b.id, b.booking_no;

-- User Activity View
CREATE OR REPLACE VIEW public.v_user_activity_summary AS
SELECT 
  u.id,
  u.email,
  u.full_name,
  ur.role_name,
  COUNT(DISTINCT ba.id) as approvals_pending,
  MAX(al.created_at) as last_activity_date,
  u.last_login
FROM public.system_users u
LEFT JOIN public.user_roles ur ON u.role_id = ur.id
LEFT JOIN public.booking_approvals ba ON u.id = ba.approver_id AND ba.status = 'PENDING'
LEFT JOIN public.audit_log al ON u.id = al.user_id
WHERE u.is_active = TRUE
GROUP BY u.id, ur.role_name;
