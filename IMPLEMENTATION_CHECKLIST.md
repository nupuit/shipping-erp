# NVOCC ERP - Implementation Checklist & Quick Start

**Version:** 1.0 | **Status:** Ready for Development | **Date:** May 2026

---

## 📋 Pre-Implementation Checklist

### Before Starting Development

- [ ] **Team Alignment** (1 day)
  - [ ] Schedule kickoff meeting with dev + product team
  - [ ] Review all 4 documentation files (USER_MANUAL, TECHNICAL_IMPLEMENTATION, INDUSTRY_STANDARDS, this checklist)
  - [ ] Clarify approval hierarchy (who approves at Level 1, 2, 3?)
  - [ ] Confirm unlock authorization (which roles can unlock? duration?)
  - [ ] Define SLAs (approval time limits, unlock processing time)

- [ ] **Database Preparation** (1 day)
  - [ ] Backup existing Supabase database
  - [ ] Create separate DEV/STAGING/PROD instances
  - [ ] Run `01_enhanced_schema_addon.sql` on DEV first
  - [ ] Verify all tables/views/functions created successfully
  - [ ] Test schema against sample data (100 bookings)

- [ ] **Infrastructure Setup** (1-2 days)
  - [ ] Configure email service (SMTP for notifications)
  - [ ] Set up scheduled job runner (cron for auto-relock)
  - [ ] Configure backup storage (7-year retention for audit logs)
  - [ ] Set up logging infrastructure (ELK stack or similar)
  - [ ] Configure secrets management (API keys, DB credentials)

- [ ] **Security Hardening** (1-2 days)
  - [ ] Enable RLS policies (run `enable_rls_policies.sql`)
  - [ ] Configure SSL/TLS certificates
  - [ ] Set up IP whitelisting (for admin access)
  - [ ] Implement rate limiting (100 req/min per user)
  - [ ] Configure MFA for admin & approver accounts

---

## 🔧 Development Phase (Phases 1-5)

### Phase 1: Database & Backend (Week 1-2)

**Priority:** HIGH (Blocking everything else)

**Tasks:**
- [ ] Execute `01_enhanced_schema_addon.sql` on DEV/STAGING
- [ ] Implement approval workflow functions:
  - [ ] `create_booking_with_approval()` ✓ (already in TECHNICAL_IMPLEMENTATION.md)
  - [ ] `submit_booking_for_approval()` ✓
  - [ ] `approve_booking()` ✓ (with auto-lock logic)
  - [ ] `reject_booking()` (similar to approve but sets status=REJECTED)
- [ ] Implement lock/unlock functions:
  - [ ] `unlock_booking_manual()` ✓
  - [ ] `auto_relock_expired_unlocks()` ✓ (trigger for scheduled job)
  - [ ] `get_lock_expiry()` (calculates time until relock)
- [ ] Implement audit logging:
  - [ ] Create trigger: `audit_trigger_on_bookings_update()`
  - [ ] Create trigger: `audit_trigger_on_booking_approvals_update()`
  - [ ] Create trigger: `audit_trigger_on_charges_update()`
- [ ] Create RLS policies:
  - [ ] Shipper can see own bookings
  - [ ] Approver can see assigned approvals
  - [ ] Admin can see all
  - [ ] Enable RLS on all tables

**Testing:**
- [ ] Unit tests for each function (5 test cases per function)
- [ ] Integration tests (booking → approval → lock workflow)
- [ ] Security tests (RLS policies enforce restrictions)

**Acceptance Criteria:**
- ✅ All functions execute without errors
- ✅ RLS policies tested & enforced
- ✅ Audit trail captured for all changes
- ✅ Lock/unlock mechanism works with 24h timer

---

### Phase 2: Backend API Routes (Week 2)

**Priority:** HIGH

**Tasks (Supabase Functions / Edge Functions):**
- [ ] POST `/api/bookings` - Create draft booking
- [ ] PUT `/api/bookings/{id}` - Update booking
- [ ] POST `/api/bookings/{id}/submit-approval` - Submit for approval
- [ ] POST `/api/approvals/{id}/approve` - Approve booking
- [ ] POST `/api/approvals/{id}/reject` - Reject booking
- [ ] POST `/api/bookings/{id}/unlock` - Admin unlock
- [ ] POST `/api/bookings/{id}/lock-status` - Get lock status
- [ ] GET `/api/audit-trail/{table}/{recordId}` - Get audit history
- [ ] GET `/api/dashboard/pending-approvals` - Dashboard query

**Middleware:**
- [ ] Authentication check (verify JWT token)
- [ ] Authorization check (RBAC - verify user role)
- [ ] Audit logging (log all API calls)
- [ ] Error handling & logging

**Testing:**
- [ ] Postman collection with all endpoints
- [ ] Load test: 100 concurrent requests
- [ ] Error handling tests (invalid data, unauthorized access)

**Acceptance Criteria:**
- ✅ All endpoints return 200/201 on success
- ✅ Authorization enforced (401/403 on invalid access)
- ✅ Audit logs recorded for all changes

---

### Phase 3: Frontend Components (Week 3-4)

**Priority:** HIGH

**Components to Build:**

1. **BookingForm (Enhanced)**
   - [ ] All fields from current implementation
   - [ ] Status display (Draft, Pending, Approved, Locked)
   - [ ] Lock indicator (shows if locked, unlock window if unlocked)
   - [ ] Disable edit button if locked (except for unlocked state)
   - [ ] Show approval status (Level 1: ⏳, Level 2: ⏳)

2. **ApprovalDashboard (New)**
   - [ ] Pending approvals queue (sorted by date)
   - [ ] Booking details preview
   - [ ] Approve/Reject buttons
   - [ ] Comment box for approval notes
   - [ ] Rejection reason template (dropdown)

3. **LockManagement (New - Admin Only)**
   - [ ] List of locked bookings
   - [ ] Manual unlock button + reason textbox
   - [ ] Unlock expiry countdown (24h timer)
   - [ ] Recent unlock history

4. **AuditTrail (New)**
   - [ ] Timeline view of all changes to a booking
   - [ ] User who made change, when, what changed
   - [ ] Filter by date range, user, operation type

5. **DashboardKPIs (New)**
   - [ ] Total bookings (by status)
   - [ ] Pending approvals count
   - [ ] Locked bookings count
   - [ ] Recent unlock activity
   - [ ] User activity (last 7 days)

**React Hooks:**
- [ ] `useBookingApprovalWorkflow()` ✓ (already in TECHNICAL_IMPLEMENTATION.md)
- [ ] `useLockStatus()` ✓
- [ ] `useAuditTrail()` (fetch audit log)
- [ ] `usePendingApprovals()` (fetch approvals for dashboard)

**Services:**
- [ ] `bookingService` (existing, enhance with approval methods)
- [ ] `approvalService` (submit, approve, reject)
- [ ] `lockService` (lock, unlock operations)
- [ ] `auditService` ✓ (already in TECHNICAL_IMPLEMENTATION.md)

**Testing:**
- [ ] Component tests (React Testing Library)
- [ ] Integration tests (Cypress - full workflows)
- [ ] Responsive design tests (mobile, tablet, desktop)

**Acceptance Criteria:**
- ✅ All components render correctly
- ✅ Forms submit valid data to API
- ✅ Dashboard displays correct data
- ✅ Responsive on mobile (tested on iPhone 12, iPad)

---

### Phase 4: Background Jobs & Notifications (Week 4-5)

**Priority:** MEDIUM-HIGH

**Scheduled Jobs:**

1. **Auto-Relock Timer** (runs every 1 hour)
   - [ ] Call `auto_relock_expired_unlocks()` function
   - [ ] Log count of relocked bookings
   - [ ] Alert admin if count > 5 (unusual)

2. **Approval Reminder** (runs every 4 hours)
   - [ ] Query pending approvals older than 4 hours
   - [ ] Send email reminder to assigned approvers
   - [ ] Log reminders sent

3. **SOA Generation** (runs daily at 2 AM UTC)
   - [ ] Group charges by shipper (by month)
   - [ ] Generate PDF/Excel SOA
   - [ ] Email to shipper
   - [ ] Archive in system

4. **Stale Booking Cleanup** (runs weekly)
   - [ ] Find draft bookings > 90 days old
   - [ ] Archive them (mark as archived, don't delete)
   - [ ] Notify agent that booking was archived

**Email Notifications:**

| Trigger | Recipient | Content | Timing |
|---------|-----------|---------|--------|
| Booking submitted for approval | Approver (L1) | "New booking submitted for your approval" | Immediate |
| Approval level complete | Approver (L2) | "Booking ready for financial approval" | Immediate |
| Booking approved | Agent/Shipper | "Booking approved - now locked" | Immediate |
| Booking rejected | Agent | "Booking rejected - reason: ..." | Immediate |
| B/L unlocked | Agent | "B/L unlocked, 24h to make changes" | Immediate |
| Auto-relock | Agent | "B/L auto-locked after 24h unlock" | At relock time |
| Approval reminder | Approver | "3 pending approvals waiting" | Every 4h if > 0 |
| SOA generated | Shipper | "Your statement of account for May" | Daily @ 2 AM |

**Email Template Example:**
```
From: noreply@nvocc-erp.com
To: approver@shipping.com
Subject: New Booking Requires Approval: BK-20260518-ABCD

Hi John,

A new booking has been submitted for your approval:

Booking No: BK-20260518-ABCD
Shipper: ABC Export Co.
Consignee: XYZ Import Co.
Vessel: MV Maersk SK28
Sailing: 2026-06-01
POL: Shanghai → POD: Los Angeles
Containers: 2×40HC

Status: ⏳ Pending Compliance Approval

To review and approve, click here: [Link to dashboard]
Deadline: 2026-05-18 20:00 UTC (4 hours)

---
System: NVOCC ERP
Do not reply to this email
```

**Implementation:**
- [ ] Use Supabase Functions (Edge Functions) or AWS Lambda
- [ ] Set up cron job trigger (Cloud Scheduler, GitHub Actions, or similar)
- [ ] Configure email service (SendGrid, AWS SES, etc.)
- [ ] Create email templates

**Testing:**
- [ ] Manual trigger of each job (verify emails sent)
- [ ] Scheduled job execution test (run at specific time)
- [ ] Email content verification (correct data in email)

**Acceptance Criteria:**
- ✅ All jobs execute on schedule without errors
- ✅ Emails sent correctly to correct recipients
- ✅ Log entries created for audit trail

---

### Phase 5: Testing & Deployment (Week 5-6)

**Priority:** CRITICAL

**Testing Checklist:**

1. **Functional Testing**
   - [ ] Happy path: Draft → Submitted → Approved (L1) → Approved (L2) → Locked ✓
   - [ ] Rejection path: Draft → Submitted → Rejected → Draft
   - [ ] Unlock path: Locked → Unlocked (24h window) → Auto-relock OR Re-approved
   - [ ] Permission testing: Shipper can't approve, approver can't unlock

2. **Load Testing**
   - [ ] 100 concurrent bookings creation
   - [ ] 50 concurrent approval submissions
   - [ ] Dashboard query with 10k+ bookings (verify response time < 2s)
   - [ ] Bulk unlock (10+ manual unlocks simultaneously)

3. **Security Testing**
   - [ ] SQL injection attempts (parameterized queries)
   - [ ] RLS enforcement (shipper can't see other shippers' bookings)
   - [ ] RBAC enforcement (agent can't access admin functions)
   - [ ] Session hijacking attempts

4. **User Acceptance Testing (UAT)**
   - [ ] Shipper creates booking → receives confirmation
   - [ ] Approver reviews & approves → booking locks
   - [ ] Admin unlocks → 24h timer starts
   - [ ] Auto-relock after 24h (no changes) OR re-approval (if changes)

5. **Documentation Verification**
   - [ ] User manual matches UI (step-by-step walkthrough)
   - [ ] Admin guide covers all admin functions
   - [ ] Technical docs match implementation

**Deployment Plan:**

**Step 1: Staging Deployment** (Friday EOD)
- [ ] Deploy all backend functions to STAGING
- [ ] Deploy frontend to STAGING
- [ ] Run full test suite (automated)
- [ ] UAT team tests (2-4 hours)
- [ ] Sign-off from product owner

**Step 2: Production Deployment** (Saturday 00:00 UTC)
- [ ] Database backup (full snapshot)
- [ ] Schema migration (`01_enhanced_schema_addon.sql` on production)
- [ ] Deploy backend functions
- [ ] Deploy frontend
- [ ] Verify all systems operational (smoke tests)
- [ ] Rollback plan ready (if needed)

**Step 3: Post-Deployment** (Saturday 06:00 UTC)
- [ ] Monitor error logs (first 6 hours)
- [ ] Verify scheduled jobs running
- [ ] Verify emails sending
- [ ] User training calls (10 AM UTC)

**Acceptance Criteria:**
- ✅ All test cases pass
- ✅ No critical/high severity bugs
- ✅ Performance metrics met (API response time < 1s, DB query < 200ms)
- ✅ Security audit passed
- ✅ All 4 user roles can access their dashboards

---

## 📊 Rollout Plan (Post-Launch)

### Week 1 (Soft Launch - Limited Users)

- [ ] 10 power users invited
- [ ] Daily check-in calls
- [ ] Bug fixes (priority: HIGH/CRITICAL only)
- [ ] Monitor system performance

### Week 2-3 (Extended Rollout)

- [ ] 50% of user base invited
- [ ] Weekly town hall (address Q&A)
- [ ] Feature enhancements (non-blocking)
- [ ] Performance optimization (if needed)

### Week 4 (Full Production)

- [ ] All users migrated
- [ ] Legacy system decommissioned
- [ ] Final documentation updates
- [ ] Post-launch retrospective

---

## 🚀 Quick Start for Developers

### Local Development Setup

```bash
# 1. Clone repo
git clone <repo-url>
cd shipping-erp

# 2. Install dependencies
npm install

# 3. Set up environment
cp .env.example .env.local
# Edit .env.local with Supabase credentials

# 4. Create Supabase database
npm run db:setup  # Runs create_bookings_table.sql + 01_enhanced_schema_addon.sql

# 5. Start dev server
npm run dev  # Runs on localhost:3000

# 6. Run tests
npm run test  # Jest + React Testing Library

# 7. Seed sample data (optional)
npm run db:seed
```

### Key Files Modified/Created

| File | Purpose | Status |
|------|---------|--------|
| `supabase/01_enhanced_schema_addon.sql` | Enhanced schema with workflows | ✅ Created |
| `USER_MANUAL.md` | User guide for all roles | ✅ Created |
| `TECHNICAL_IMPLEMENTATION.md` | Dev guide + code examples | ✅ Created |
| `INDUSTRY_STANDARDS.md` | NVOCC best practices | ✅ Created |
| `IMPLEMENTATION_CHECKLIST.md` | This file | ✅ Created |
| `src/app/page.tsx` | Main component (needs enhancement) | 🔄 To do: Add approval UI |
| `src/services/approvalService.ts` | Approval workflows | ⏳ To create |
| `src/services/lockService.ts` | Lock/unlock operations | ⏳ To create |
| `src/services/auditService.ts` | Audit trail | ⏳ To create |
| `src/hooks/useBookingApprovalWorkflow.ts` | Approval workflow hook | ⏳ To create |
| `src/hooks/useLockStatus.ts` | Lock status hook | ⏳ To create |

---

## ✅ Success Criteria

**Project is complete when:**

1. **All 4 documentation files available** ✓
   - ✅ USER_MANUAL.md (comprehensive user guide + troubleshooting)
   - ✅ TECHNICAL_IMPLEMENTATION.md (developer guide + code examples)
   - ✅ INDUSTRY_STANDARDS.md (NVOCC best practices + compliance)
   - ✅ IMPLEMENTATION_CHECKLIST.md (this file)

2. **Database schema enhanced**
   - ✅ `01_enhanced_schema_addon.sql` created with:
     - Users & roles management
     - Approval workflow tables
     - Lock history tracking
     - Audit logging
     - Document management
     - Financial tracking (charges, SOA)

3. **Approval workflow implemented**
   - ✅ Multi-level approval (compliance → financial → admin)
   - ✅ State machine (Draft → Pending → Approved → Locked)
   - ✅ Rejection & re-submission workflow
   - ✅ Approval dashboard

4. **Lock mechanism implemented**
   - ✅ Auto-lock after approval
   - ✅ Manual unlock by admin (24h window)
   - ✅ Auto-relock after 24h (if no changes)
   - ✅ Re-approval workflow (if changes made during unlock)

5. **RBAC enforced**
   - ✅ RLS policies for all critical tables
   - ✅ Role-based dashboards (different view per role)
   - ✅ Permission checks on all API endpoints

6. **Audit trail captured**
   - ✅ All data changes logged (who, what, when)
   - ✅ Audit queries available for compliance
   - ✅ 7-year retention policy

7. **Notifications working**
   - ✅ Email notifications on key events
   - ✅ Approval reminders (4h intervals)
   - ✅ Auto-relock notifications

---

## 📞 Support & Escalation

**During Implementation:**
- **Dev Questions:** Slack #shipping-erp-dev
- **Product Questions:** Weekly sync (Wed 10 AM UTC)
- **Blockers:** Escalate to project lead immediately

**Post-Launch Support:**
- **Bug Reports:** support@nvocc-erp.com (response < 4h)
- **Features:** Feature request form on GitHub
- **Training:** Training videos @ learn.nvocc-erp.com

---

**Version:** 1.0 | **Created:** May 2026 | **Status:** Ready for Implementation
