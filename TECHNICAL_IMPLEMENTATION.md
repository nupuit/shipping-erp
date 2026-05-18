# NVOCC ERP - Technical Implementation Guide

**Version:** 1.0 | **For:** Development Team | **Date:** May 2026

---

## Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [Database Layer](#database-layer)
3. [Backend API Implementation](#backend-api-implementation)
4. [Frontend Integration](#frontend-integration)
5. [Approval Workflow Engine](#approval-workflow-engine)
6. [Locking & Auto-Unlock Mechanism](#locking--auto-unlock-mechanism)
7. [Audit Logging System](#audit-logging-system)
8. [Role-Based Access Control](#role-based-access-control)
9. [Security Considerations](#security-considerations)

---

## Architecture Overview

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                     NVOCC ERP System                        │
├─────────────────────────────────────────────────────────────┤
│ Frontend (Next.js 16)                                       │
│ ├─ Components                                               │
│ │  ├─ BookingForm (create/edit)                            │
│ │  ├─ ApprovalDashboard (pending approvals)                │
│ │  ├─ LockManagement (admin unlock UI)                     │
│ │  ├─ AuditTrail (view changes)                            │
│ │  └─ DocumentGeneration (D/O, CRO, B/L)                   │
│ └─ Services                                                 │
│    ├─ bookingService (create, update, fetch)               │
│    ├─ approvalService (submit, approve, reject)            │
│    ├─ lockService (lock/unlock operations)                 │
│    └─ auditService (logging, retrieval)                    │
├─────────────────────────────────────────────────────────────┤
│ API Layer (Supabase Functions / API Routes)                │
│ ├─ Authentication                                           │
│ ├─ Authorization (RBAC middleware)                          │
│ ├─ Booking endpoints (CRUD)                                │
│ ├─ Approval endpoints (submit, approve, reject)            │
│ ├─ Lock endpoints (lock, unlock, auto-relock)              │
│ └─ Audit endpoints (query, export)                         │
├─────────────────────────────────────────────────────────────┤
│ Database Layer (PostgreSQL via Supabase)                    │
│ ├─ Tables (23 total)                                        │
│ ├─ Views (pending approvals, lock status, etc.)             │
│ ├─ Functions (triggers, stored procedures)                  │
│ ├─ RLS Policies (row-level security)                        │
│ └─ Audit Tables (audit_log, approval history)              │
├─────────────────────────────────────────────────────────────┤
│ Background Services (Scheduled Jobs)                        │
│ ├─ Auto-relock timer (every 1 hour)                        │
│ ├─ Approval reminder (every 4 hours)                        │
│ ├─ SOA generation (daily at 2 AM)                          │
│ ├─ Email notifications (real-time)                          │
│ └─ Cleanup jobs (archive old records)                       │
└─────────────────────────────────────────────────────────────┘
```

---

## Database Layer

### Key Tables for New Features

#### users Table
```sql
-- Relationship: One user has many bookings (created_by), many approvals
-- Indexes: (email), (role_id), (is_active)

Field                | Type            | Purpose
─────────────────────┼─────────────────┼─────────────────────────
id                   | BIGINT PK       | Unique identifier
email                | TEXT UNIQUE     | Login identifier
full_name            | TEXT            | Display name
role_id              | FK(user_roles)  | RBAC link
is_active            | BOOLEAN         | Soft delete / suspension
last_login           | TIMESTAMPTZ     | Activity tracking
failed_login_attempts| INT             | Security lockout counter
```

#### booking_approvals Table
```sql
-- Relationship: One booking has many approval levels
-- Indexes: (booking_id), (approver_id), (status)

Field                | Type            | Purpose
─────────────────────┼─────────────────┼──────────────────────
id                   | BIGINT PK       | Unique identifier
booking_id           | FK(bookings)    | Which booking
approval_level       | INT             | 1=Compliance, 2=Financial, 3=Admin
approval_type        | TEXT            | Classification
status               | TEXT            | PENDING, APPROVED, REJECTED
approver_id          | FK(users)       | Who approved
approval_date        | TIMESTAMPTZ     | When approved
comments             | TEXT            | Approval notes
rejection_reason     | TEXT            | Why rejected (if applicable)
created_at           | TIMESTAMPTZ     | Created timestamp
updated_at           | TIMESTAMPTZ     | Last modified
```

#### bl_lock_history Table
```sql
-- Relationship: Tracks all lock/unlock events per booking
-- Indexes: (booking_id), (lock_status), (unlock_expires_at)

Field                | Type            | Purpose
─────────────────────┼─────────────────┼──────────────────────
id                   | BIGINT PK       | Unique identifier
booking_id           | FK(bookings)    | Which B/L locked
locked_by_id         | FK(users)       | Who locked (system or manual)
locked_at            | TIMESTAMPTZ     | When locked
unlock_expires_at    | TIMESTAMPTZ     | 24h deadline for relock
unlocked_by_id       | FK(users)       | Who manually unlocked
unlock_reason        | TEXT            | Why unlocked
unlock_date          | TIMESTAMPTZ     | When unlocked
relock_date          | TIMESTAMPTZ     | When auto-relocked
lock_status          | TEXT            | LOCKED, UNLOCKED, EXPIRED_RELOCK
```

#### audit_log Table
```sql
-- Relationship: One record per data change (ONE-WAY tracking)
-- Indexes: (table_name, record_id), (user_id), (created_at)

Field                | Type            | Purpose
─────────────────────┼─────────────────┼──────────────────────
id                   | BIGINT PK       | Unique identifier
table_name           | TEXT            | Which table modified
record_id            | BIGINT          | Which record
operation            | TEXT            | INSERT, UPDATE, DELETE
user_id              | FK(users)       | Who made change
old_values           | JSONB           | Before values
new_values           | JSONB           | After values
changed_fields       | TEXT[]          | List of field names changed
ip_address           | INET            | Source IP
created_at           | TIMESTAMPTZ     | When logged
```

### Views for Dashboard Queries

#### v_pending_approvals (Used by Dashboard)
```sql
SELECT 
  ba.id as approval_id,
  b.id as booking_id,
  b.booking_no,
  ba.approval_level,
  ba.approval_type,
  u.email as approver_email,
  u.full_name as approver_name,
  ba.created_at as submitted_date,
  EXTRACT(HOUR FROM (NOW() - ba.created_at)) as pending_hours
FROM booking_approvals ba
JOIN bookings b ON ba.booking_id = b.id
LEFT JOIN system_users u ON ba.approver_id = u.id
WHERE ba.status = 'PENDING'
ORDER BY ba.created_at ASC;
```

#### v_bl_lock_status (Real-time Lock Tracking)
```sql
SELECT 
  blh.id,
  blh.booking_id,
  b.booking_no,
  blh.lock_status,
  blh.locked_at,
  blh.unlock_expires_at,
  CASE 
    WHEN blh.lock_status = 'UNLOCKED' AND NOW() > blh.unlock_expires_at 
    THEN 'RELOCK_OVERDUE'
    ELSE blh.lock_status
  END as effective_status,
  EXTRACT(HOUR FROM (blh.unlock_expires_at - NOW())) as hours_until_relock
FROM bl_lock_history blh
JOIN bookings b ON blh.booking_id = b.id
WHERE blh.lock_status IN ('LOCKED', 'UNLOCKED')
ORDER BY blh.unlock_expires_at ASC;
```

---

## Backend API Implementation

### Supabase Functions (PostgreSQL)

#### Function 1: Create Booking with Approval Queue

```sql
CREATE OR REPLACE FUNCTION public.create_booking_with_approval(
  p_booking_data JSONB,
  p_user_id BIGINT
)
RETURNS TABLE(booking_id BIGINT, approval_ids BIGINT[], message TEXT) AS $$
DECLARE
  v_booking_id BIGINT;
  v_approval_ids BIGINT[];
  v_approval_id BIGINT;
BEGIN
  -- 1. Insert booking
  INSERT INTO public.bookings (
    booking_no, shipper_party_id, consignee_party_id, vessel_id, 
    sailing_date, pol_id, pod_id, freight_type_id, 
    container_owner_id, created_by, status_id
  )
  SELECT 
    p_booking_data->>'booking_no', 
    (p_booking_data->>'shipper_party_id')::BIGINT,
    (p_booking_data->>'consignee_party_id')::BIGINT,
    (p_booking_data->>'vessel_id')::BIGINT,
    (p_booking_data->>'sailing_date')::TIMESTAMPTZ,
    (p_booking_data->>'pol_id')::BIGINT,
    (p_booking_data->>'pod_id')::BIGINT,
    (p_booking_data->>'freight_type_id')::BIGINT,
    (p_booking_data->>'container_owner_id')::BIGINT,
    p_user_id,
    (SELECT id FROM public.booking_statuses WHERE status_code = 'DRAFT')
  RETURNING id INTO v_booking_id;

  -- 2. Create approval queues (Level 1 & 2 automatically)
  INSERT INTO public.booking_approvals (booking_id, approval_level, approval_type, status)
  VALUES 
    (v_booking_id, 1, 'COMPLIANCE', 'PENDING'),
    (v_booking_id, 2, 'FINANCIAL', 'PENDING')
  RETURNING id INTO v_approval_id;
  
  v_approval_ids := array_append(v_approval_ids, v_approval_id);

  -- 3. Log audit entry
  INSERT INTO public.audit_log (table_name, record_id, operation, user_id, new_values)
  VALUES ('bookings', v_booking_id, 'INSERT', p_user_id, p_booking_data);

  RETURN QUERY SELECT v_booking_id, v_approval_ids, 'Booking created with approval queue'::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

**Usage:**
```typescript
const { data, error } = await supabase
  .rpc('create_booking_with_approval', {
    p_booking_data: bookingData,
    p_user_id: userId
  });
```

---

#### Function 2: Submit for Approval

```sql
CREATE OR REPLACE FUNCTION public.submit_booking_for_approval(
  p_booking_id BIGINT,
  p_user_id BIGINT
)
RETURNS TABLE(success BOOLEAN, message TEXT) AS $$
DECLARE
  v_booking_status_id BIGINT;
BEGIN
  -- 1. Verify booking is in DRAFT status
  SELECT status_id INTO v_booking_status_id FROM public.bookings WHERE id = p_booking_id;
  
  IF (SELECT status_code FROM public.booking_statuses WHERE id = v_booking_status_id) != 'DRAFT' THEN
    RETURN QUERY SELECT FALSE, 'Booking is not in DRAFT status'::TEXT;
    RETURN;
  END IF;

  -- 2. Update booking status to PENDING_APPROVAL
  UPDATE public.bookings 
  SET status_id = (SELECT id FROM public.booking_statuses WHERE status_code = 'PENDING_APPROVAL')
  WHERE id = p_booking_id;

  -- 3. Reset approval queue (clear old rejections)
  UPDATE public.booking_approvals 
  SET status = 'PENDING', approver_id = NULL, approval_date = NULL
  WHERE booking_id = p_booking_id AND status = 'REJECTED';

  -- 4. Audit log
  INSERT INTO public.audit_log (table_name, record_id, operation, user_id, new_values)
  VALUES ('bookings', p_booking_id, 'UPDATE', p_user_id, 
    jsonb_build_object('status', 'PENDING_APPROVAL', 'submitted_by', p_user_id));

  -- 5. Trigger notification (email to approvers)
  PERFORM pg_notify('approval_queue_update', jsonb_build_object(
    'booking_id', p_booking_id, 'action', 'submitted'
  )::TEXT);

  RETURN QUERY SELECT TRUE, 'Booking submitted for approval'::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

#### Function 3: Approve Booking (with Auto-Lock)

```sql
CREATE OR REPLACE FUNCTION public.approve_booking(
  p_booking_id BIGINT,
  p_approval_id BIGINT,
  p_user_id BIGINT,
  p_comments TEXT DEFAULT NULL
)
RETURNS TABLE(success BOOLEAN, message TEXT) AS $$
DECLARE
  v_next_level INT;
  v_total_levels INT;
BEGIN
  -- 1. Update approval record
  UPDATE public.booking_approvals 
  SET 
    status = 'APPROVED',
    approver_id = p_user_id,
    approval_date = NOW(),
    comments = p_comments
  WHERE id = p_approval_id;

  -- 2. Check if all approvals complete
  SELECT COUNT(*) INTO v_total_levels FROM public.booking_approvals WHERE booking_id = p_booking_id;
  SELECT COUNT(*) INTO v_next_level FROM public.booking_approvals 
    WHERE booking_id = p_booking_id AND status = 'APPROVED';

  IF v_next_level = v_total_levels THEN
    -- All levels approved → LOCK booking
    UPDATE public.bookings 
    SET status_id = (SELECT id FROM public.booking_statuses WHERE status_code = 'LOCKED')
    WHERE id = p_booking_id;

    -- Create lock history record
    INSERT INTO public.bl_lock_history (booking_id, locked_by_id, locked_at, lock_status)
    VALUES (p_booking_id, p_user_id, NOW(), 'LOCKED');

    -- Audit log
    INSERT INTO public.audit_log (table_name, record_id, operation, user_id, new_values)
    VALUES ('bookings', p_booking_id, 'UPDATE', p_user_id, 
      jsonb_build_object('status', 'LOCKED', 'locked_by', p_user_id));

    RETURN QUERY SELECT TRUE, 'All approvals complete. Booking LOCKED.'::TEXT;
  ELSE
    -- More approvals pending → status stays PENDING_APPROVAL
    INSERT INTO public.audit_log (table_name, record_id, operation, user_id, new_values)
    VALUES ('bookings', p_booking_id, 'UPDATE', p_user_id, 
      jsonb_build_object('approval_level', v_next_level, 'approved_by', p_user_id));

    RETURN QUERY SELECT TRUE, 'Level ' || v_next_level || ' approved. Awaiting Level ' || (v_next_level + 1) || '.'::TEXT;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

#### Function 4: Manual Unlock (24h Window)

```sql
CREATE OR REPLACE FUNCTION public.unlock_booking_manual(
  p_booking_id BIGINT,
  p_user_id BIGINT,
  p_unlock_reason TEXT
)
RETURNS TABLE(success BOOLEAN, expires_at TIMESTAMPTZ) AS $$
DECLARE
  v_unlock_expires TIMESTAMPTZ;
BEGIN
  -- 1. Only admins can unlock
  IF (SELECT role_code FROM public.user_roles ur 
      JOIN public.system_users su ON ur.id = su.role_id 
      WHERE su.id = p_user_id) != 'ADMIN' THEN
    RETURN QUERY SELECT FALSE, NULL;
    RETURN;
  END IF;

  -- 2. Calculate 24h expiry
  v_unlock_expires := NOW() + INTERVAL '24 hours';

  -- 3. Update booking status
  UPDATE public.bookings 
  SET status_id = (SELECT id FROM public.booking_statuses WHERE status_code = 'UNLOCKED')
  WHERE id = p_booking_id;

  -- 4. Create lock history record
  INSERT INTO public.bl_lock_history 
    (booking_id, unlocked_by_id, unlock_reason, unlock_date, unlock_expires_at, lock_status)
  VALUES (p_booking_id, p_user_id, p_unlock_reason, NOW(), v_unlock_expires, 'UNLOCKED');

  -- 5. Audit log
  INSERT INTO public.audit_log (table_name, record_id, operation, user_id, new_values)
  VALUES ('bookings', p_booking_id, 'UPDATE', p_user_id, 
    jsonb_build_object('status', 'UNLOCKED', 'unlock_reason', p_unlock_reason, 'expires', v_unlock_expires));

  -- 6. Notify agent via email (trigger via notification)
  PERFORM pg_notify('bl_unlock_notification', jsonb_build_object(
    'booking_id', p_booking_id, 'unlock_reason', p_unlock_reason, 'expires_at', v_unlock_expires
  )::TEXT);

  RETURN QUERY SELECT TRUE, v_unlock_expires;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

#### Function 5: Auto-Relock Scheduler (Trigger)

```sql
CREATE OR REPLACE FUNCTION public.auto_relock_expired_unlocks()
RETURNS TABLE(relocked_count INT) AS $$
DECLARE
  v_count INT := 0;
BEGIN
  -- Find all UNLOCKED bookings where 24h has expired
  WITH expired_unlocks AS (
    SELECT blh.id, blh.booking_id
    FROM public.bl_lock_history blh
    WHERE blh.lock_status = 'UNLOCKED'
      AND NOW() > blh.unlock_expires_at
      AND blh.relock_date IS NULL
  )
  UPDATE public.bl_lock_history blh
  SET 
    lock_status = 'LOCKED',
    relock_date = NOW()
  FROM expired_unlocks eu
  WHERE blh.id = eu.id;

  -- Count relocked records
  SELECT COUNT(*) INTO v_count FROM public.bl_lock_history 
  WHERE lock_status = 'LOCKED' AND relock_date = CURRENT_DATE;

  RETURN QUERY SELECT v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Schedule trigger (run hourly via Supabase cron)
-- This would be set up as a scheduled job
```

---

## Frontend Integration

### React Hooks & Services

#### Hook: useBookingApprovalWorkflow

```typescript
// hooks/useBookingApprovalWorkflow.ts

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface BookingApprovalState {
  booking: any;
  approvals: any[];
  currentLevel: number;
  canApprove: boolean;
  loading: boolean;
  error: string | null;
}

export const useBookingApprovalWorkflow = (bookingId: string, userId: string) => {
  const [state, setState] = useState<BookingApprovalState>({
    booking: null,
    approvals: [],
    currentLevel: 0,
    canApprove: false,
    loading: true,
    error: null
  });

  useEffect(() => {
    const fetchWorkflow = async () => {
      try {
        // Fetch booking + approval chain
        const { data: booking, error: bookingErr } = await supabase
          .from('bookings')
          .select('*')
          .eq('id', bookingId)
          .single();

        if (bookingErr) throw bookingErr;

        const { data: approvals, error: appErr } = await supabase
          .from('booking_approvals')
          .select('*')
          .eq('booking_id', bookingId)
          .order('approval_level', { ascending: true });

        if (appErr) throw appErr;

        // Check if current user can approve
        const userRole = await getCurrentUserRole(userId);
        const canApprove = userRole && 
          approvals.some(a => a.approver_id === null && a.status === 'PENDING');

        setState({
          booking,
          approvals,
          currentLevel: approvals.length,
          canApprove,
          loading: false,
          error: null
        });
      } catch (err) {
        setState(prev => ({ ...prev, loading: false, error: err?.message }));
      }
    };

    fetchWorkflow();
  }, [bookingId, userId]);

  const submitForApproval = async () => {
    try {
      const { data, error } = await supabase.rpc('submit_booking_for_approval', {
        p_booking_id: bookingId,
        p_user_id: userId
      });
      if (error) throw error;
      // Refetch workflow
    } catch (err) {
      setState(prev => ({ ...prev, error: err?.message }));
    }
  };

  const approveBooking = async (approvalId: string, comments: string) => {
    try {
      const { data, error } = await supabase.rpc('approve_booking', {
        p_booking_id: bookingId,
        p_approval_id: approvalId,
        p_user_id: userId,
        p_comments: comments
      });
      if (error) throw error;
      // Refetch workflow
    } catch (err) {
      setState(prev => ({ ...prev, error: err?.message }));
    }
  };

  return { ...state, submitForApproval, approveBooking };
};
```

---

#### Hook: useLockStatus

```typescript
// hooks/useLockStatus.ts

export const useLockStatus = (bookingId: string) => {
  const [lockStatus, setLockStatus] = useState<any>(null);

  useEffect(() => {
    const fetchLockStatus = async () => {
      const { data } = await supabase
        .from('v_bl_lock_status')
        .select('*')
        .eq('booking_id', bookingId)
        .single();
      
      setLockStatus(data);
    };

    fetchLockStatus();
    
    // Poll every 5 minutes for lock expiry
    const interval = setInterval(fetchLockStatus, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [bookingId]);

  const canEdit = lockStatus?.lock_status === 'DRAFT' || 
                  lockStatus?.lock_status === 'UNLOCKED';
  
  const hoursUntilRelock = lockStatus?.hours_until_relock || 0;

  return { lockStatus, canEdit, hoursUntilRelock };
};
```

---

#### Service: AuditService

```typescript
// services/auditService.ts

import { supabase } from '@/lib/supabase';

export const auditService = {
  async logChange(
    tableName: string,
    recordId: bigint,
    operation: 'INSERT' | 'UPDATE' | 'DELETE',
    userId: bigint,
    oldValues: any = null,
    newValues: any = null,
    changedFields: string[] = []
  ) {
    return await supabase
      .from('audit_log')
      .insert({
        table_name: tableName,
        record_id: recordId,
        operation,
        user_id: userId,
        old_values: oldValues,
        new_values: newValues,
        changed_fields: changedFields,
        ip_address: await getClientIP(),
        user_agent: navigator.userAgent
      });
  },

  async queryAuditTrail(
    tableName: string,
    recordId: bigint,
    limit = 50
  ) {
    return await supabase
      .from('audit_log')
      .select('*')
      .eq('table_name', tableName)
      .eq('record_id', recordId)
      .order('created_at', { ascending: false })
      .limit(limit);
  },

  async getUserActivity(userId: bigint, days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    return await supabase
      .from('audit_log')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: false });
  }
};

async function getClientIP() {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip;
  } catch {
    return '0.0.0.0';
  }
}
```

---

## Approval Workflow Engine

### State Machine Diagram

```
┌─────────────────────────────────────────────────────────────┐
│              BOOKING APPROVAL STATE MACHINE                 │
├─────────────────────────────────────────────────────────────┤

  DRAFT
    ↓ [Agent submits]
  PENDING_APPROVAL (Level 1: Compliance)
    ├─ [Approved] → PENDING_APPROVAL (Level 2: Financial)
    │                ├─ [Approved] → LOCKED ✓
    │                └─ [Rejected] → DRAFT
    │                   [Agent amends]
    └─ [Rejected] → DRAFT
       [Agent amends]

  LOCKED
    ├─ [Normal state after full approval]
    ├─ [24h countdown starts if manual unlock]
    └─ [Auto-relock after 24h, if no changes]

  UNLOCKED (Manual unlock by admin)
    ├─ [24h timer active]
    ├─ [Changes made?]
    │   ├─ Yes → PENDING_APPROVAL (re-approval needed)
    │   └─ No → LOCKED (auto-relock at 24h)
    └─ [Timer expires] → LOCKED

  REJECTED
    └─ [Back to DRAFT for amendment]
```

---

### Approval Matrix

| Level | Role | Type | Can Reject | Re-submission Required |
|-------|------|------|-----------|----------------------|
| 1 | Dept Head | Compliance | Yes | If rejected |
| 2 | Senior Mgr | Financial | Yes | If rejected |
| 3 | Admin | Strategic | Yes (override) | No (emergency only) |

---

## Locking & Auto-Unlock Mechanism

### Lock Lifecycle

```sql
-- Automatic transitions via triggers

1. BOOKING APPROVED (both L1 & L2) 
   ↓
2. INSERT bl_lock_history (lock_status='LOCKED', locked_at=NOW())
   ↓
3. Booking remains LOCKED unless manually unlocked
   ↓
4. Admin executes unlock_booking_manual() 
   ↓
5. UPDATE bl_lock_history (lock_status='UNLOCKED', unlock_expires_at=NOW()+'24h')
   ↓
6. Scheduled job auto_relock_expired_unlocks() runs hourly
   ↓
7. If NOW() > unlock_expires_at AND no changes made:
   ├─ UPDATE bl_lock_history (lock_status='LOCKED', relock_date=NOW())
   └─ Booking auto-locked
   
8. If changes were made during unlock window:
   ├─ Booking returns to PENDING_APPROVAL
   ├─ Requires re-approval (Level 1 minimum)
   └─ Lock resumes after re-approval
```

---

### Change Detection Logic

```typescript
// Detect if changes made during unlock window

const detectChanges = (originalData: any, currentData: any): string[] => {
  const changedFields = [];
  
  const criticalFields = [
    'shipper_party_id', 'consignee_party_id', 'vessel_id',
    'sailing_date', 'pol_id', 'pod_id', 'container_owner_id',
    'freight_type_id', 'detention_currency_id'
  ];

  for (const field of criticalFields) {
    if (JSON.stringify(originalData[field]) !== 
        JSON.stringify(currentData[field])) {
      changedFields.push(field);
    }
  }

  return changedFields;
};

// If changedFields.length > 0, trigger re-approval workflow
```

---

## Audit Logging System

### When to Audit

| Operation | Logged | Details |
|-----------|--------|---------|
| Booking create | ✅ | Full booking data |
| Booking update | ✅ | Changed fields, old→new values |
| Booking delete | ✅ | Full record before deletion |
| Approval | ✅ | Level, decision, comments |
| Rejection | ✅ | Reason, approver |
| Lock/Unlock | ✅ | Who, when, reason |
| Document issue | ✅ | Doc type, recipient, date |
| User login | ✅ | IP, timestamp |
| User logout | ✅ | Session duration |
| RBAC changes | ✅ | Role changes, approvals |

### Audit Query Examples

```sql
-- Find all changes to booking BK-123 in last 30 days
SELECT * FROM public.audit_log
WHERE table_name = 'bookings'
  AND record_id = 123
  AND created_at > NOW() - INTERVAL '30 days'
ORDER BY created_at DESC;

-- Find who unlocked which bookings (last 7 days)
SELECT 
  al.user_id, su.full_name, al.new_values->>'unlock_reason' as reason,
  COUNT(*) as unlock_count
FROM public.audit_log al
JOIN public.system_users su ON al.user_id = su.id
WHERE al.table_name = 'bookings'
  AND al.operation = 'UPDATE'
  AND al.new_values->>'status' = 'UNLOCKED'
  AND al.created_at > NOW() - INTERVAL '7 days'
GROUP BY al.user_id, su.full_name
ORDER BY unlock_count DESC;

-- Generate audit trail for compliance
SELECT * FROM public.audit_log
WHERE created_at BETWEEN '2026-01-01' AND '2026-12-31'
ORDER BY created_at ASC
LIMIT 10000;
```

---

## Role-Based Access Control

### RLS Policies (Row-Level Security)

```sql
-- Enable RLS on critical tables
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booking_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bl_lock_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- Policy: Shipper can view own bookings only
CREATE POLICY "Shipper can view own bookings"
ON public.bookings
FOR SELECT
USING (
  created_by = auth.uid() 
  OR shipper_party_id IN (
    SELECT party_id FROM public.system_users WHERE id = auth.uid()
  )
);

-- Policy: Approver can view assigned approvals
CREATE POLICY "Approver can view assigned approvals"
ON public.booking_approvals
FOR SELECT
USING (
  approver_id = (SELECT id FROM public.system_users WHERE id = auth.uid())
  OR auth.uid() IN (SELECT id FROM public.system_users WHERE role_id = 5) -- Admin role ID
);

-- Policy: Audit log visible to admins only
CREATE POLICY "Audit log admin access"
ON public.audit_log
FOR SELECT
USING (
  auth.uid() IN (SELECT id FROM public.system_users WHERE role_id = 5) -- Admin
);

-- Policy: Lock history visible to booking owner & admins
CREATE POLICY "Lock history visibility"
ON public.bl_lock_history
FOR SELECT
USING (
  booking_id IN (
    SELECT id FROM public.bookings 
    WHERE created_by = auth.uid()
  )
  OR auth.uid() IN (SELECT id FROM public.system_users WHERE role_id = 5) -- Admin
);
```

---

## Security Considerations

### 1. Password Policy
```
- Minimum 12 characters
- Must include: uppercase, lowercase, number, special character
- Cannot reuse last 5 passwords
- Expire every 90 days (admin reminder at 70 days)
```

### 2. Multi-Factor Authentication (MFA)
```
- Strongly recommended for Approvers & Admins
- Email-based OTP backup method
- TOTP (authenticator app) primary method
```

### 3. Session Management
```
- Default timeout: 30 minutes of inactivity
- Max session duration: 8 hours
- Concurrent session limit: 3 per user (configurable)
- Automatic logout on browser close
```

### 4. IP Whitelisting (Optional for Admins)
```
- Configure trusted IP ranges
- VPN required for remote access
- Geofence restrictions (optional)
```

### 5. Approval Authority Limits
```
Admin can set:
- Max booking value per approver (e.g., Dept Head: $50k, Senior Mgr: unlimited)
- Escalation rules (high-value → automatic senior mgr notification)
- Dual approval required for > specific amount
```

### 6. Sensitive Data Masking
```
- Card numbers: Show last 4 only
- Passwords: Never logged (even audit trail)
- SSN/Tax ID: Masked in audit trail
- Email addresses: Partially masked in views (first char + *** + domain)
```

### 7. Rate Limiting (DDoS Protection)
```
- Max 100 API calls per minute per user
- Max 1000 API calls per minute per IP
- Automatic 15-minute ban on threshold violation
```

---

## Deployment Checklist

- [ ] Run `01_enhanced_schema_addon.sql` in Supabase SQL editor
- [ ] Verify all tables created without errors
- [ ] Test approval workflow (manual test: create → submit → approve)
- [ ] Test 24h auto-relock scheduler (mock timestamp + run function)
- [ ] Enable RLS policies (test access controls per role)
- [ ] Configure email notifications (SMTP settings)
- [ ] Set up audit log retention (7 years default)
- [ ] Test backup/restore of audit log
- [ ] Load test: 1000 concurrent bookings + approvals
- [ ] Security audit: Penetration test + OWASP top 10
- [ ] User training (3 roles minimum: Shipper, Approver, Admin)
- [ ] Go-live window: Plan for 2h maintenance window

---

**Document Version:** 1.0 | **Date:** May 2026 | **Status:** Ready for Implementation
