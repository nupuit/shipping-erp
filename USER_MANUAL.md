# NVOCC ERP System - User Manual & Implementation Guide

**Version:** 1.0 | **Date:** May 2026 | **Status:** Production Ready

---

## Table of Contents
1. [System Overview](#system-overview)
2. [User Roles & Permissions](#user-roles--permissions)
3. [Booking Workflow & Approval System](#booking-workflow--approval-system)
4. [Role-Specific User Guides](#role-specific-user-guides)
5. [Standard Features & Workflows](#standard-features--workflows)
6. [Admin Configuration](#admin-configuration)
7. [Troubleshooting & Support](#troubleshooting--support)

---

## System Overview

### What is NVOCC ERP?
A comprehensive Non-Vessel-Operating Common Carrier (NVOCC) management platform handling:
- **Booking Management** - Create, approve, and track shipments
- **Bill of Lading** (B/L) Generation & Management
- **Approval Workflows** - Multi-level review process
- **Container Tracking** - Real-time equipment status
- **Billing & Charges** - Detention, port, and service charges
- **Document Management** - POD, D/O, CRO, GI generation
- **Statement of Account** (SOA) - Automated cost settlement

### Key Features
- ✅ Auto-locking after approval (prevents accidental changes)
- ✅ 24-hour unlock window for corrections (with admin permission)
- ✅ Complete audit trail (who changed what and when)
- ✅ Role-based dashboards (see only your data)
- ✅ Multi-level approval (Compliance → Financial → Admin)
- ✅ Automated charge calculations

---

## User Roles & Permissions

### 1. **Shipper**
**Who:** Freight shippers and export/import customers
**Can Do:**
- Create draft bookings with party details
- View their own bookings
- View approval status
- Download documents (D/O, POD)
- View charges related to their shipments

**Cannot Do:**
- Approve bookings
- Edit locked bookings
- See other shippers' data
- Access financial reports

**Dashboard:**
- Pending bookings (waiting approval)
- Approved shipments (tracking status)
- Upcoming sailing dates

---

### 2. **Agent (Local/Port Agent)**
**Who:** Freight forwarding agents, customs brokers
**Can Do:**
- Create bookings (full details)
- Edit draft bookings
- Submit bookings for approval
- Add containers and cargo details
- Generate D/O & CRO documents
- Track container movements
- Submit container activity updates
- View charges & prepare invoices

**Cannot Do:**
- Approve bookings
- Unlock locked B/Ls (except own within restrictions)
- Access admin settings

**Dashboard:**
- Active bookings by status
- Documents ready to issue
- Containers needing updates
- Pending documentation

---

### 3. **Approver (Department Head)**
**Who:** Operations manager, booking supervisor
**Can Do:**
- View all pending approvals
- Approve/reject bookings (Level 1 - Compliance)
- Add approval comments
- Request amendments from agents
- Unlock B/L for corrections (within 24h)
- Export approval reports

**Cannot Do:**
- Override other approvers
- Access financial data
- Admin system changes

**Dashboard:**
- Pending approvals queue (sorted by date)
- Rejection history (last 30 days)
- Approval SLA tracking

---

### 4. **Senior Manager (Financial Approver)**
**Who:** Finance manager, director
**Can Do:**
- View all pending approvals
- Approve bookings (Level 2 - Financial Terms)
- Review cost/revenue terms
- View profitability analysis
- Access financial reports (SOA, charges)
- Set detention rate parameters

**Cannot Do:**
- Approve compliance level
- Modify booking details

**Dashboard:**
- Approvals awaiting financial review
- Profit margin analysis per booking
- Cost vs. revenue breakdown
- Financial metrics (KPIs)

---

### 5. **Admin (System Administrator)**
**Who:** IT manager, senior operations manager
**Can Do:**
- Override all approvals
- Unlock any B/L (triggers manual unlock log)
- System configuration (lock duration, approval levels)
- User management & role assignment
- View complete audit trail
- Generate system reports
- Configure detention rates & charges
- Access all dashboards

**Cannot Do:**
- Create bookings (system operator role only)
- Delete bookings (only archive)

**Dashboard:**
- System health & KPIs
- User activity monitoring
- Audit trail (searchable)
- Configuration settings
- Unlock history (recent manual unlocks)

---

### 6. **Viewer (Read-Only Access)**
**Who:** Consultants, reporting team, compliance
**Can Do:**
- View all bookings (read-only)
- View dashboards
- Generate reports
- Export data (Excel)

**Cannot Do:**
- Make any changes
- Create bookings
- Approve

---

## Booking Workflow & Approval System

### Standard Booking Lifecycle

```
┌─────────┐      ┌──────────────────┐      ┌──────────┐      ┌────────┐
│ DRAFT   │─────→│ PENDING_APPROVAL │─────→│ APPROVED │─────→│ LOCKED │
└─────────┘      └──────────────────┘      └──────────┘      └────────┘
     ↑                    ↓                                        ↓
     │                REJECTED ────────────────────→ ↓            │
     │                    (requires amendment)      │             ↓
     └────────────────────────────────────────→ DRAFT            │
                    (agent resubmits)                             │
                                                                  ↓
                                                             ┌──────────┐
                                                             │ UNLOCKED │
                                                             │(24h timer)
                                                             └──────────┘
                                                                  ↓
                                                          (If edited)
                                                                  ↓
                                                        PENDING_APPROVAL
                                                      (OR auto-relock if
                                                          no changes)
```

### Approval Process (Multi-Level)

#### Level 1: Compliance Approval
**Approver:** Department Head / Operations Manager
**Checks:**
- Booking details complete & accurate
- Port & vessel combinations valid
- Container types & commodities match
- Special requirements documented
- Dangerous cargo properly flagged
- Vessel & schedule alignment

**Decision:** Approve → Moves to Level 2 | Reject → Back to Agent

**Timeline:** 4-24 hours typical

---

#### Level 2: Financial Approval
**Approver:** Senior Manager / Finance
**Checks:**
- Cost rates competitive & aligned
- Revenue rates profitable
- Credit limit adequate
- Payment terms acceptable
- Detention rates configured
- Currency & billing correct

**Decision:** Approve → BOOKING LOCKED | Reject → Rejection reason given

**Timeline:** 4-24 hours typical

---

#### Level 3: Admin Override (if needed)
**Approver:** System Admin
**When Used:**
- Time-critical bookings
- Exception handling
- Emergency situations
- Approval deadlock

**Action:** Manual unlock after hours, expedited processing

---

### The Lock Mechanism

#### Why Lock?
- **Prevents accidental changes** after approval
- **Maintains data integrity** for billing/charges
- **Protects against unauthorized modifications**
- **Ensures audit trail completeness**

#### How It Works

1. **Booking Approved** → Auto-locked immediately
2. **Locked Status:**
   - Primary users cannot edit
   - Charges calculated on locked data
   - B/L issued based on locked state
   - Container tracking frozen
   
3. **Need to Change After Approval?**
   - Admin unlocks → Gives 24-hour window
   - User makes corrections
   - System logs all changes
   - Changes trigger re-approval OR auto-relock after 24h

4. **24-Hour Auto-Relock:**
   - If no changes made → Auto-locks
   - If changes made → Requires re-approval (Level 1 minimum)
   - Unlock reason & changes documented in audit trail

#### Manual Unlock Example Timeline

```
12:00 - B/L Locked (Booking approved)
14:30 - Admin receives unlock request (e.g., "POD date wrong")
15:00 - Admin manually unlocks B/L
        ↓
        Unlock expires at 15:00 TOMORROW
        ↓
15:30 - Agent updates POD date
16:00 - Changes submitted for re-approval
18:00 - Department head re-approves (Level 1)
19:00 - B/L locked again
```

---

## Role-Specific User Guides

### SHIPPER - Step-by-Step

#### Creating a Booking
1. **Log in** → Dashboard → "New Booking"
2. **Fill Booking Header:**
   - Shipping party (auto-fill from common party list)
   - Sailing date & vessel
   - POL & POD (Port of Loading/Discharge)
   - Reference no. (your internal reference)

3. **Commodity Details:**
   - Select commodity from master list
   - Quantity & units
   - Dangerous cargo flag (if applicable)
   - Special handling (temperature, vent, etc.)

4. **Service Selection:**
   - CY (Container Yard) or Door delivery
   - Additional services (transshipment, break-bulk)

5. **Contacts:**
   - Consignee details
   - Notify party
   - Special instructions (CRO, NOC)

6. **Review & Submit** → "Submit for Approval"

#### Tracking Your Booking

**Status Indicators:**
- 🟡 Yellow = Pending Approval (waiting)
- 🟢 Green = Approved & Locked (processing)
- 📄 Documents = Ready for download
- ✅ Complete = Vessel sailed

**Document Checklist:**
- ✅ D/O (Delivery Order) ready
- ✅ POD (Proof of Delivery) available
- ✅ GI (Gate In) confirmed
- ✅ CRO (Container Release Order) issued

---

### AGENT - Step-by-Step

#### Creating Full Booking
1. **New Booking** → Select customer/shipper
2. **Party Details:**
   - Shipper (freight supplier)
   - Consignee (receiver)
   - Notify party (notification recipient)
   - Agent POL & Agent POFD (your port agents)

3. **Vessel & Schedule:**
   - Vessel/Voyage from available list
   - Sailing date & voyage
   - ETD/ETA auto-populate

4. **Commercial Terms:**
   - Freight rate (cost to shipper)
   - Revenue rate (charge to customer)
   - Currency
   - Detention-free days (POL & POD)

5. **Container & Cargo:**
   - Container type & quantity
   - Gross/net weight
   - CBM (cubic meters)
   - Commodity code & HS code
   - Handling (FCL, LCL, CY, Door)

6. **Special Requirements:**
   - Temperature (reefer containers)
   - Ventilation needs
   - IMO class
   - SOX/CRO instructions
   - Bill of Lading remarks

7. **Submit for Approval** → Track status in dashboard

#### After Approval - Generate Documents

**D/O (Delivery Order):**
1. Booking → "Generate D/O"
2. Verify consignee details
3. Download & email to consignee

**CRO (Container Release Order):**
1. Booking → "Generate CRO"
2. Attach container seal numbers
3. Send to port/terminal

**GI (Gate In):**
1. Gate in terminal confirms receipt
2. System auto-updates container status
3. View in Container Tracking

#### Troubleshooting: Booking Rejected

**If booking rejected:**
1. Read rejection reason in comments
2. Make requested corrections
3. Status returns to Draft
4. Re-submit for approval

**Common Rejection Reasons:**
- ❌ Invalid port combination (e.g., port not in route)
- ❌ Missing critical fields (commodity, weight)
- ❌ Dangerous cargo not properly flagged
- ❌ Rate terms not competitive
- ❌ Credit limit exceeded

---

### APPROVER (Department Head) - Step-by-Step

#### Reviewing Pending Approvals

1. **Dashboard** → "Pending Approvals" queue
2. **Booking Details Display:**
   - Booking number & date
   - Shipper & consignee
   - Vessel & sailing date
   - Container summary
   - Special requirements

3. **Compliance Checklist:**
   - ✅ All required fields completed?
   - ✅ Ports valid & in sequence?
   - ✅ Container types available?
   - ✅ Dangerous cargo properly flagged?
   - ✅ Vessel capacity adequate?
   - ✅ Schedule realistic?

4. **Approve:**
   - Click "Approve" → Moves to Level 2 (Financial)
   - Add comments (optional)
   - System logs approval

5. **Reject (if needed):**
   - Click "Request Amendment"
   - Specify issues in comments
   - Booking returns to Agent
   - Agent re-submits

**Rejection Reasons Template:**
```
Format: [FIELD] - [ISSUE] - [ACTION]

Example:
[POL] - Port code invalid - Use standard UNCTAD code
[Containers] - Qty exceeds vessel capacity - Reduce to max available
[Commodity] - Dangerous cargo not flagged - Add IMO class
```

#### Unlocking for Corrections

**When to Unlock:**
- Agent calls: "Wrong POD entered, need to change"
- Data entry error discovered
- Customer requested amendment post-approval

**How to Unlock:**
1. **Booking** → "Admin Tools" → "Unlock B/L"
2. **Reason:** Document the why
3. **Duration:** Default 24 hours
4. **Notify Agent:** System sends auto-email
5. **Track Changes:** Agent's edits logged

**Reapproval After Unlock:**
- If changes made → Returns to Level 1
- If no changes → Auto-locks after 24h
- You'll receive re-submission for approval

---

### SENIOR MANAGER - Financial Approval

#### Reviewing Financial Terms

1. **Dashboard** → "Pending Financial Approvals"
2. **Key Metrics Display:**
   - Freight cost
   - Revenue (customer charge)
   - Gross margin
   - Net profit
   - Margin %

3. **Financial Checks:**
   - ✅ Cost rates market-competitive?
   - ✅ Revenue margins acceptable (target 15-25%)?
   - ✅ Customer credit limit adequate?
   - ✅ Payment terms aligned with policy?
   - ✅ Currency risks managed?
   - ✅ Detention rates reasonable?

4. **Approve:**
   - Click "Approve" → Booking LOCKED
   - Charges calculated on locked amounts
   - B/L issued

5. **Reject:**
   - Specify rate adjustments needed
   - Returns to Compliance Level for re-work

#### Profitability Dashboard

**View:**
- Bookings by margin (high, medium, low)
- Top performing lanes (highest profit)
- Customer profitability
- Monthly revenue trends
- Cost breakdown (detention, port, handling)

**Export Reports:**
- Daily profitability summary
- Customer settlement statements
- Margin analysis by lane/vessel
- Cost vs. actual reconciliation

---

### ADMIN - System Management

#### Dashboard Overview
**KPIs Displayed:**
- Total active bookings
- Bookings pending approval (by level)
- Locked B/Ls (ready for B/L issue)
- Recent manual unlocks
- User activity (last 24h)
- System health metrics

#### Configuration Tasks

**1. Detention Rate Setup**
```
Navigate: Admin → Settings → Detention Rates

Configure per:
- Container type (20ft, 40ft, HC, Reefer)
- Port pair (POL-POD)
- Free days (7, 10, 14 days typical)
- Daily rate after free period
- Currency

Example:
20ft | POL: Shanghai | POD: LA | Free: 7 days | Rate: $50/day/cntr
40ft | POL: Shanghai | POD: LA | Free: 7 days | Rate: $75/day/cntr
```

**2. Lock Duration Setting**
```
Admin → Settings → Lock Configuration

Default: 24 hours
Can adjust: 12h, 24h, 48h, 72h (per policy)
Affects all future unlocks
```

**3. Approval Level Naming**
```
Admin → Settings → Approval Levels

Level 1: Department Head (Compliance)
Level 2: Senior Manager (Financial)
Level 3: Director (Strategic) [optional]

Can customize per organization
```

**4. User & Role Management**

```
Admin → Users → Add New User

Fields:
- Email (unique, company domain)
- Full name
- Department
- Role (Shipper, Agent, Approver, Senior Manager, Admin, Viewer)
- Active status

Access Control:
- Assign role-specific permissions
- Data visibility scope (all bookings vs. own only)
- Export capabilities
```

#### Manual Unlock Process

**Step-by-Step:**
1. **Search:** Booking → Find locked booking
2. **Reason:** Log unlock reason (e.g., "Date correction - POD changed")
3. **Duration:** Confirm 24-hour window
4. **Notify:** Auto-email sent to original agent
5. **Track:** All changes logged to audit trail
6. **Confirmation:** Agent confirms changes made
7. **Re-approve or Auto-lock:** After 24h or changes submitted

#### Audit Trail Review

**Access:** Admin → Audit Trail

**Search by:**
- Date range
- User
- Booking ID
- Table (bookings, charges, documents)
- Operation (INSERT, UPDATE, DELETE)

**Example Audit Entry:**
```
Timestamp: 2026-05-18 14:35:22 UTC
User: agent@company.com (John Doe - Agent)
Operation: UPDATE
Table: bookings
Booking: BK-20260518-ABCD
Changes:
  - pod_id: "1" → "2" (LA → Singapore)
  - pod_date: "2026-06-15" → "2026-06-20"
IP Address: 192.168.1.100
Audit Note: Manually unlocked by admin for POD correction
```

---

## Standard Features & Workflows

### 1. Document Management

#### Generating Bill of Lading (B/L)

**When:** After booking approved & locked
**Who:** Agent or shipper
**Steps:**
1. Booking → "Generate B/L"
2. Select B/L format (Full, Straight, Order)
3. Verify shipper/consignee (auto-populated)
4. Add B/L remarks if needed
5. Download PDF
6. Email to customer & notify party

**B/L Contains:**
- Booking reference
- Shipper & consignee details
- Container info & seal numbers
- Weight & measurements
- Commodity & HS codes
- Freight rate & terms
- Special instructions
- Carrier & vessel info

---

#### Delivery Order (D/O) & Container Release Order (CRO)

**D/O (Delivery Order):**
- Issued to consignee to collect containers
- Shows container numbers, seals, contents
- Gate document for POD terminal

**CRO (Container Release Order):**
- Authorization to release empty containers
- Shows container type, serial, owner
- Terminal compliance document

**Workflow:**
1. Container arrives POD
2. Generate D/O → Email to consignee
3. Consignee presents D/O at gate
4. Gate confirms receipt → POD updates
5. Empty container released via CRO
6. Agent receives empty return date

---

### 2. Container Tracking

#### Real-Time Status Updates

**Container Lifecycle:**

```
POL Terminal (Gate In)
    ↓
On Vessel (Loading)
    ↓
In Transit
    ↓
POD Terminal (Arrival)
    ↓
Discharge
    ↓
Ready for Pickup (D/O issued)
    ↓
Delivery to Consignee
    ↓
Empty Container Return
    ↓
Returned to Owner
```

**Activity Log:**
- Gate In date/time
- Cargo receipt confirmation
- Stuffing completion
- Customs clearance (if applicable)
- Vessel loading
- Discharge at POD
- D/O issuance
- Gate Out (empty return)

**Who Updates:**
- Terminal operators
- Customs brokers
- Transport providers
- Agents (manual entry if auto feed unavailable)

**Tracking URL:**
- Shippers get public tracking link
- Can track container without login
- Shows current status, location, ETA

---

### 3. Detention & Demurrage Charges

#### Automatic Charge Calculation

**How It Works:**

1. **Free Period:**
   - Typically 7 days POL, 7 days POD
   - Configurable per port/customer

2. **After Free Period:**
   - Daily rate applied (e.g., $50/day per 20ft)
   - Accumulates until container returned

3. **Automated Calculation:**
   - System reads gate dates
   - Counts free days automatically
   - Calculates overage charges
   - Issues detention invoice

**Example:**
```
20ft Container | POD: Los Angeles
Gate In: June 1 | Free Days: 7
Gate Out: June 15 (14 days)
Detention Days: 14 - 7 = 7 days
Daily Rate: $50/day
Detention Charge: 7 days × $50 = $350
```

#### Special Cases

**Shippers on Credit:**
- Invoice after gate out
- Due date: 14-30 days (configurable)
- Late payment: Interest added

**Cash on Delivery:**
- Invoice before gate out
- Must pay before release

**Corporate Accounts:**
- Monthly SOA with all charges
- Consolidated billing

---

### 4. Cost Settlement & Statement of Account (SOA)

#### SOA Generation (Monthly/Periodic)

**Automated Process:**
1. System collects all charges per party
2. Groups by period (month, quarter)
3. Generates SOA document
4. Email to party with payment terms
5. Payment tracking

**SOA Contains:**
- Party name & contact
- Period covered (e.g., "May 1-31, 2026")
- Booking-by-booking breakdown:
  - Booking number
  - Vessel & sailing date
  - Containers & cargo
  - Revenue charges
  - Detention/other charges
  - Taxes (if applicable)
- **Total Amount Due**
- **Due Date**
- **Bank Account** for payment
- Payment terms & penalties

**Example SOA Line:**
```
BK-20260515-XYZ1 | MV Maersk SK28 | 2×40HC | Shanghai-LA
Container: MRSKU1234567 | Seal: 12345-67890
Basic Freight: $2,500.00
Detention (5 days): $250.00
Port Charges: $150.00
Documentation: $50.00
Subtotal: $2,950.00
Tax (5%): $147.50
Total: $3,097.50
```

#### Payment Tracking

**Methods:**
- Bank transfer (primary)
- Credit card (with fee)
- Check (for large amounts)
- Partial payments allowed

**System Records:**
- Date received
- Amount
- Method
- Reference/check number
- Outstanding balance

**Auto-Aging Report:**
- 0-30 days: Current
- 30-60 days: Overdue
- 60+ days: Past due (collection notice)

---

### 5. Dangerous Cargo & Compliance

#### Dangerous Cargo Flagging

**Required for:**
- IMO Class chemicals
- Hazmat materials
- Flammable goods
- Radioactive materials
- Corrosive substances

**Booking Fields:**
1. **Is Dangerous:** Yes/No checkbox
2. **IMO Class:** Select from dropdown
3. **UN Number:** e.g., UN1950
4. **Proper Shipping Name:** Auto-populated
5. **Packing Group:** I, II, or III
6. **Special Requirements:**
   - Ventilation needed?
   - Temperature control?
   - Segregation rules?

**Compliance Checks:**
- Vessel certified for IMO class?
- Port restrictions?
- Packaging requirements met?
- Documentation complete (MSDS, IMDG cert)?

**Approval Notes:**
- Compliance approver verifies all IMDG reqs
- Financial approver confirms insurance adequacy
- System flags for customs pre-clearance

---

### 6. Multi-Port Transshipment

#### Transshipment Setup

**Fields:**
1. **POL (Port of Loading):** Primary loading port
2. **Port T1 (Transshipment 1):** First transshipment port
3. **Port T2 (Transshipment 2):** Optional second transshipment
4. **POD (Port of Discharge):** Final discharge port

**Example:**
```
Shanghai (POL) → Busan (T1) → LA (T2) → NY (POD)
```

**Equipment Tracking:**
- Original equipment tracked through T1
- Possible equipment change at T1
- New B/L issued at T1
- Tracking continues to final POD

**Charges:**
- T1 charges (transshipment, storage)
- T2 charges (if applicable)
- Variable detention rates per port

---

## Admin Configuration

### System Settings Checklist

| Setting | Default | Customizable | Impact |
|---------|---------|--------------|--------|
| Lock Duration | 24h | Yes | Affects unlock window |
| Approval Levels | 2 (Compliance, Financial) | Yes | Workflow depth |
| Max Free Days | 7 | Yes | Detention calculation |
| Session Timeout | 30 min | Yes | User inactivity |
| Max Failed Logins | 5 | Yes | Account lockout |
| Audit Retention | 7 years | Yes | Data storage |
| SOA Period | Monthly | Yes | Billing cycle |

### User Role Matrix

**Create Employees:**

```
Admin Dashboard → Users → Add User

Example 1: Agent
├─ Email: jane.doe@forwarder.com
├─ Role: Agent
├─ Department: Operations
├─ Permissions:
│  ├─ Create booking ✓
│  ├─ Edit draft ✓
│  ├─ Submit approval ✓
│  ├─ View charges ✓
│  ├─ Generate documents ✓
│  ├─ Approve booking ✗
│  └─ Admin tools ✗

Example 2: Approver
├─ Email: john.smith@shipping.com
├─ Role: Department Head
├─ Department: Operations
├─ Permissions:
│  ├─ View all bookings ✓
│  ├─ Approve L1 ✓
│  ├─ Unlock B/L ✓
│  ├─ Reject ✓
│  ├─ Request amendment ✓
│  ├─ Approve L2 ✗
│  └─ Admin tools ✗

Example 3: Admin
├─ Email: admin@shipping.com
├─ Role: System Admin
├─ Department: IT/Operations
├─ Permissions: ALL ✓
```

---

## Troubleshooting & Support

### Common Issues & Solutions

#### Issue: Booking Rejected but No Clear Reason

**Solution:**
1. Check rejection comments (email or dashboard)
2. Common reasons:
   - ❌ Missing mandatory field (use required field indicator 🔴)
   - ❌ Invalid port combination
   - ❌ Rate below minimum threshold
   - ❌ Shipper credit limit exceeded
3. Contact approver if unclear
4. Make corrections & resubmit

---

#### Issue: Can't Edit Booking (Shows "Locked")

**Expected Behavior:**
- Bookings lock after approval (intentional security feature)
- Cannot edit while locked

**Solutions:**
1. **For minor corrections:** Contact your Admin → Request unlock (24h window)
2. **Contact details:** Admin@company.com or ext. 5555
3. **Timeline:** Admin unlock requests typically processed within 30 min
4. **After unlock:** You have 24 hours to make corrections
5. **Re-approval:** Changes will need re-approval (30 min typical)

---

#### Issue: Detention Charge Seems Incorrect

**Verify:**
1. Gate In date (check terminal receipt)
2. Gate Out date (check return documentation)
3. Free days setting (7, 10, or 14 days?)
4. Daily rate applied (correct per size?)

**Calculation Check:**
```
Total Days = Gate Out - Gate In
Detention Days = Total Days - Free Days
Charge = Detention Days × Daily Rate

Example:
In: June 1 | Out: June 15 | Free: 7 | Rate: $50
= (15-1) - 7 = 7 days
= 7 × $50 = $350
```

**If Still Wrong:**
- Email charges@company.com with booking no.
- Provide gate docs
- Request review (typically 24h)

---

#### Issue: Approval Stuck at "Pending" for 2+ Days

**Escalation Path:**
1. **First:** Check if your approver is on leave (view admin contact list)
2. **If approved but status not updating:** Refresh browser
3. **Contact:** manager@company.com
4. **Provide:** Booking number & submission date
5. **Follow-up:** If no response in 4h, contact Director

---

#### Issue: Can't Generate D/O (Button Grayed Out)

**Reasons & Fixes:**
1. **Booking not approved yet** → Wait for approval
2. **Container info incomplete** → Add all containers first
3. **System error** → Refresh & try again
4. **Technical issue** → Contact IT support

---

### Reporting Issues

**Email:** support@nvocc-erp.com
**Ticket System:** system.ticket.com (optional)
**Include:**
- Your name & role
- Booking number (if applicable)
- What you tried to do
- What happened instead
- Screenshots (if helpful)
- Time issue occurred

**Response Times:**
- Critical (system down): 15 min
- High (booking locked, can't work): 1 hour
- Medium (feature not working): 4 hours
- Low (enhancement request): 1-2 days

---

### Best Practices

#### For Shippers
✅ Submit bookings 7-10 days before sailing
✅ Provide accurate commodity descriptions
✅ Notify us of special requirements early
✅ Download D/O documents promptly
✅ Keep contact info updated

#### For Agents
✅ Complete all mandatory fields (marked 🔴)
✅ Use standard port codes (UNCTAD list)
✅ Flag dangerous cargo early
✅ Upload supporting docs (MSDS if hazmat)
✅ Proactively update container status

#### For Approvers
✅ Review pending approvals daily (set reminder)
✅ Add clear rejection reasons
✅ Respond to re-submissions within 4 hours
✅ Log all unlock reasons in audit trail
✅ Flag suspicious patterns (unusual rates, etc.)

#### For Admins
✅ Monthly role & permission audit
✅ Review audit trail weekly (trends/issues)
✅ Update detention rates quarterly
✅ Monitor unlock frequency (>5/day = investigate)
✅ Archive inactive users monthly
✅ Test backup & recovery annually

---

## Support & Contact Information

**Support Portal:** https://support.nvocc-erp.com
**Email:** support@nvocc-erp.com
**Phone:** +1-800-NVOCC-ERP (ext. 1 = Sales, ext. 2 = Support)
**Hours:** 24/5 (Monday-Friday 8am-8pm UTC + 24h emergency)

**Documentation:** https://docs.nvocc-erp.com
**Video Tutorials:** https://learn.nvocc-erp.com
**Community Forum:** https://community.nvocc-erp.com

---

**Document Version:** 1.0 | **Last Updated:** May 18, 2026 | **Next Review:** August 18, 2026
