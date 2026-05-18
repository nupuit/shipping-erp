# NVOCC ERP - Industry Standards & Best Practices

**Version:** 1.0 | **Scope:** NVOCC Logistics Operations | **Date:** May 2026

---

## Table of Contents
1. [NVOCC Industry Overview](#nvocc-industry-overview)
2. [Regulatory Compliance Requirements](#regulatory-compliance-requirements)
3. [Standard Business Processes](#standard-business-processes)
4. [Financial Management & Cost Settlement](#financial-management--cost-settlement)
5. [Documentation Requirements](#documentation-requirements)
6. [Technology Standards](#technology-standards)
7. [Benchmarking Metrics](#benchmarking-metrics)
8. [Risk Management](#risk-management)

---

## NVOCC Industry Overview

### What is NVOCC (Non-Vessel-Operating Common Carrier)?

A Non-Vessel-Operating Common Carrier (NVOCC) is a carrier licensed to provide ocean freight services without operating its own vessels. Instead, NVOCCs:
- Contract with vessel operators for cargo space
- Offer freight forwarding services under their own brand
- Consolidate cargo from multiple shippers (LCL - Less than Container Load)
- Issue their own Bills of Lading
- Assume responsibility as the carrier of record
- Act as intermediary between shippers and ocean carriers

### Key Characteristics

| Aspect | Detail |
|--------|--------|
| **Regulatory Body** | Federal Maritime Commission (FMC) - USA |
| **License Requirement** | NVOCC Common Carrier License (required to operate) |
| **Service Types** | FCL (Full), LCL (Consolidation), Door-to-Door, Intermodal |
| **Market Position** | Typically smaller than 3PL / larger than freight forwarders |
| **Revenue Model** | Mark-up on carrier rates + service fees |
| **Primary Routes** | US ↔ Asia, US ↔ Europe, Intra-Asia, Intra-European |
| **Typical Margins** | 12-18% on freight + fees (highly competitive) |
| **Operating Costs** | Port fees, detention, documentation, labor, compliance |

### Competitive Landscape

- **Global Market Size:** $40+ billion annually
- **Top Players:** Flexport, Flexport Logistics, Cosco, OOCL, CMA CGM (subsidiary NVOCCs)
- **Consolidation Trend:** Large players acquiring smaller NVOCCs (2015-2025)
- **Technology Disruption:** AI-powered logistics platforms (Flexport, Project44, Digital Container Shipping)
- **Rate Volatility:** Freight rates fluctuate 30-40% annually (2020-2023 saw extreme volatility post-COVID)

---

## Regulatory Compliance Requirements

### 1. FMC (Federal Maritime Commission) - USA

#### Licensing
- **NVOCC Common Carrier License:** Required before operating
- **Process:** Apply through FMC, demonstrate financial stability (typically $200k+ insurance required)
- **Valid for:** 3 years, renewable
- **Cost:** ~$100-200 application fee

#### Tariff & Rate Filing
- **Requirement:** File rates & service terms with FMC
- **Frequency:** Every 6 months (or when rates change significantly)
- **Penalty for Non-Compliance:** Up to $25,000 fine + license suspension
- **Implementation in ERP:** System must track all rate changes with date/version

```
Tariff Management View:
├─ Service lane (e.g., Shanghai → LA)
├─ Freight rate ($/unit)
├─ Effective date
├─ Expiration date
├─ Status (Active, Pending, Archived)
├─ FMC filing reference
└─ Version control (v1.0, v1.1, v2.0)
```

#### Liability & Insurance
- **Ocean Liability Insurance:** Minimum $100,000 (FMC requirement)
- **Cargo Insurance:** Recommended for high-value shipments
- **Workers Comp:** Required for employees
- **Professional Liability:** ~$1M coverage typical

**ERP Integration:**
- Insurance policy tracker (expiration alerts)
- Cargo value limits per shipment
- Liability coverage verification per shipment

---

### 2. US Customs & Border Protection (CBP)

#### Importer of Record (IOR) Requirements
- **Bond Filing:** $50k-$500k customs bond required (depends on import volume)
- **Entry Filing:** All imports must have formal entry within 15 days of arrival
- **Documentation:** Commercial Invoice, Packing List, Bill of Lading required
- **Tariff Classification:** HS codes must be accurate (penalties for misclassification)
- **Value Declaration:** Must declare landed cost accurately
- **Duty Payment:** Collected by CBP or by NVOCC on behalf of shipper

**ERP Tracking:**
- Bond expiration tracking (renewal alerts)
- Entry filing status per shipment
- Tariff classification verification (HS code audit)
- Customs clearance timestamp (for SLA tracking)
- Duty & tax collection reconciliation

#### AUTOMATED Commercial Environment (ACE)
- Electronic filing required for all US imports/exports
- System integrates with CBP's ACE platform
- Real-time filing capability recommended
- Error rate must be <5% (or face penalties)

---

### 3. IMO (International Maritime Organization)

#### SOLAS (Safety of Life at Sea) Compliance
- **Container Integrity:** Containers must be certified seaworthy
- **Dangerous Cargo:** IMDG compliance mandatory
- **Crew Certification:** Not applicable to NVOCCs (vessel operator responsibility)
- **Security:** ISPS Code compliance (screening passengers/cargo)

**ERP Implementation:**
- Flag dangerous cargo automatically
- Validate IMDG classes (UN numbers, packing groups)
- Verify port acceptance (some ports restrict certain hazmat)
- Alert approvers for IMDG shipments (requires extra scrutiny)

#### Ballast Water Management Convention
- Ballast water testing/certification required
- Affects vessel selection (older vessels may be restricted)
- No direct NVOCC responsibility, but carrier selection impact

---

### 4. Port Authority Requirements (Per Port)

#### Port-Specific Regulations

**Los Angeles/Long Beach (LAX/LGB):**
- Clean Trucks Program (2020+ model vehicles required)
- Extra charges if truck doesn't meet emission standard
- Gate hours: 6 AM - 8 PM (restricted access)
- Dwell charges (high fees for containers >2 days)

**Port of Singapore:**
- Transhipment restrictions (some cargo banned)
- Environmental fees (bunker surcharge)
- Special permits for dangerous cargo
- Free trade zone requirements

**Port of Shanghai:**
- Port authority pre-clearance for hazmat
- Quarantine hold possible (especially perishables)
- Electronic seal tracking required
- Extra documentation for controlled commodities

**ERP Handling:**
- Port-specific requirement checklist
- Mandatory permit tracking
- Port-specific charges pre-calculation
- Regulatory alert flags per port combo

---

### 5. Insurance & Liability Standards

#### Liability Regime

| Risk | Coverage | Limit | Premium Est. |
|------|----------|-------|--------------|
| General cargo | Marine cargo | $5M | $50-150/shipment |
| High-value goods | All-risk | $10M+ | $200+/shipment |
| Hazmat | Liability | $1M+ | $300+/shipment |
| Reefer (perishable) | Temperature failure | $500k | $100+/shipment |

#### Carrier's Liability (Hague-Visby Rules - Default)
- **Liability cap:** ~$500/package or ~$1,500 per container (unless shipper declares higher value)
- **Exceptions:** Shipper liable for under-declaration, NVOCC not liable for loss due to shipper's fault
- **Claim window:** 1 year from delivery/expected delivery

**ERP Integration:**
- Cargo value declaration (auto-calculate liability cap)
- Value surcharge if shipper declares high value
- Claim filing workflow
- Insurance expiration & renewal alerts

---

## Standard Business Processes

### Process 1: Booking Lifecycle (Detailed)

```
STEP 1: INQUIRY & QUOTATION (Hours 0-4)
├─ Shipper → Asks for quote (Shanghai to LA, 2×40HC)
├─ NVOCC → Provides:
│  ├─ Freight rate ($2,500/container)
│  ├─ Surcharges (fuel, security, handling)
│  ├─ Total landed cost
│  ├─ Sailing date options (3-5 options)
│  └─ Transit time ETD→ETA
├─ Shipper → Accepts quote or negotiates
└─ Quote valid for 3-5 days (typical)

STEP 2: BOOKING CREATION (Hour 4-8)
├─ Shipper/Agent → Creates booking with:
│  ├─ Shipper details (exporter)
│  ├─ Consignee details (importer)
│  ├─ Container details (qty, type)
│  ├─ Cargo description (HS code, weight)
│  ├─ Special requirements (if any)
│  ├─ Requested sailing date
│  └─ Reference numbers (PO, Invoice)
├─ Agent → Verifies vessel availability & space
│  └─ Confirms or proposes alternative date
└─ Booking created in "DRAFT" state

STEP 3: SUBMISSION FOR APPROVAL (Hour 8-12)
├─ Agent → Reviews booking for completeness
├─ NVOCC Compliance → Checks:
│  ├─ All mandatory fields filled
│  ├─ No dangerous cargo without IMDG docs
│  ├─ Shipper/consignee verified (if new)
│  ├─ Port pair valid & compatible with vessel
│  └─ Commodity legal for transport
├─ NVOCC Finance → Verifies:
│  ├─ Rate margin acceptable
│  ├─ Shipper credit limit OK
│  ├─ Currency risk acceptable
│  └─ Payment terms aligned
└─ Booking → "LOCKED" (cannot change without unlock)

STEP 4: CONFIRMATION (Hour 12-24)
├─ Agent → Issues booking confirmation to shipper
├─ Confirmation includes:
│  ├─ Booking reference number
│  ├─ Vessel name, voyage, sailing date
│  ├─ Estimated arrival date
│  ├─ Bill of Lading number (pre-assigned)
│  ├─ Freight terms (CIF/FOB)
│  ├─ Documentation requirements
│  └─ Port contacts (POL & POD agents)
├─ Shipper → Prepares cargo & documentation
└─ Agent → Instructs POL agent to "hold" vessel space

STEP 5: PRE-SHIPMENT (Days 1-3 before sailing)
├─ Shipper/Freight Forwarder → Delivers cargo to port
├─ Terminal → Gates in cargo & confirms receipt
├─ Document Check:
│  ├─ Commercial Invoice
│  ├─ Packing List
│  ├─ Bill of Lading (original)
│  ├─ Insurance certificate
│  └─ Special permits (if hazmat)
├─ Container Seal → Applied by terminal
├─ NVOCC → Issues "GI" (Gate In) confirmation
└─ Booking → Status changes to "IN_TRANSIT_PREPARATION"

STEP 6: LOADING & DEPARTURE (Sailing day)
├─ Terminal → Loads container on vessel
├─ Shipping Line → Issues sailing notice
├─ NVOCC → Updates:
│  ├─ Actual sailing date
│  ├─ Container position on vessel
│  └─ Booking status → "IN_TRANSIT"
└─ Shipper → Gets "ETD" (Estimated Time of Departure) alert

STEP 7: IN-TRANSIT (Transit days)
├─ Vessel → En route (7-21 days depending on route)
├─ Updates:
│  ├─ Daily position (if available)
│  ├─ Weather delays (if any)
│  ├─ Port delays (if any)
│  └─ ETA adjustments
└─ NVOCC → Monitors & provides updates to shipper

STEP 8: DISCHARGE & ARRIVAL (Arrival day)
├─ Vessel → Arrives at POD
├─ Terminal → Starts discharge
├─ NVOCC → Updates:
│  ├─ Actual arrival date
│  ├─ Discharge start
│  └─ Status → "DISCHARGED"
├─ Customs → May conduct inspection (if flagged)
├─ NVOCC → Issues "GO" (Gate Out approval) to consignee
└─ D/O (Delivery Order) ready for download

STEP 9: DELIVERY (Days 1-7 after discharge)
├─ Consignee → Presents D/O at terminal
├─ Terminal → Releases container to consignee
├─ Container → Transported to final destination
├─ NVOCC → Records delivery confirmation
├─ Status → "DELIVERED"
└─ Booking → Complete (ready for archival)

STEP 10: BILLING & CLOSURE (Days 1-30 after delivery)
├─ NVOCC → Calculates final charges:
│  ├─ Base freight rate
│  ├─ Surcharges (fuel, security, handling)
│  ├─ Detention (if any)
│  ├─ Port charges
│  ├─ Documentation fees
│  └─ Total = Invoice
├─ Invoice → Sent to shipper/agent
├─ Payment → Received & recorded
├─ NVOCC → Issues POD (Proof of Delivery)
├─ Shipper → Archives for compliance (7 years)
└─ Booking → "CLOSED" in system (archived)

TOTAL TIME: 30-60 days (depending on route)
```

---

### Process 2: Container Tracking & Activity Updates

**Who Updates:** POL/POD agents, customs brokers, shippers (in some cases)

**System Integration:**
- Terminal APIs push updates automatically (ideal)
- Manual entry if no API (agent logs in & updates)
- EDI messages from ocean carrier (vessel position, events)

**Key Milestones to Track:**
1. **Gate In** - Cargo arrives at POL terminal
2. **Documented** - All docs verified & accepted
3. **Stuffed** - Cargo loaded into container
4. **Seal Applied** - Security seal placed
5. **Ready to Load** - Awaiting vessel loading
6. **Loaded** - Container loaded on vessel
7. **Vessel Sailed** - Ship departed port
8. **In Transit** - Vessel at sea (periodic position updates)
9. **Arrived at POD** - Vessel reached destination
10. **Discharge Started** - Terminal begins unloading
11. **Discharged** - Container unloaded from vessel
12. **D/O Issued** - Delivery Order ready for consignee
13. **Released** - Container released to consignee
14. **Gate Out** - Empty container returned to terminal
15. **Returned to Owner** - Empty container returned to owner

---

### Process 3: Detention & Demurrage Charges

**Detention:** Cost charged by ocean liner for keeping container (empty or loaded) beyond free days

**Demurrage:** Similar to detention, sometimes used interchangeably in NVOCC context

#### Typical Free Days
- **At POL (Loading Port):** 7 days (SOLAS standard)
- **At POD (Discharge Port):** 7 days (industry standard, some 10-14)
- **Varies by:** Port congestion, shipping season, carrier policy

#### Charge Calculation

**Example:**
```
Container: 40ft High Cube
POL: Shanghai, POD: Los Angeles

Free days: 7 days (POD)
Gate In Date: June 1
Gate Out Date: June 15

Detention Days = 15 - 1 - 7 = 7 days
Daily Rate = $75 per day (configurable per port/container type)
Total Detention = 7 × $75 = $525

Early Gate Out = 3 days before deadline
└─ 10% credit applied (incentive) = -$52.50
└─ Final charge = $525 - $52.50 = $472.50
```

#### NVOCC's Approach to Detention
1. **Negotiate Rate:** NVOCC agrees to rate with ocean carrier (e.g., $75/day)
2. **Mark-up (Optional):** NVOCC can add 10-20% margin and charge shipper $85-90
3. **Pass-through:** Or pass-through at cost (many do for LCL / consolidation traffic)
4. **Auto-Calculation:** System detects gate dates → auto-calculates → auto-invoices

#### System Implementation
```sql
INSERT INTO charges (booking_id, charge_type, amount, is_cost, ...)
VALUES (
  12345, 
  'DETENTION',
  472.50,
  FALSE -- Revenue charge (shipper pays NVOCC)
);
```

---

### Process 4: Bill of Lading (B/L) Generation & Management

#### Types of B/L

| Type | Use Case | Feature |
|------|----------|---------|
| **Full B/L** | FCL shipment | Issued per container (usual) |
| **House B/L** | LCL consolidation | NVOCC issues to multiple shippers; 1 Master B/L to ocean carrier |
| **Straight B/L** | Non-negotiable | Consignee pre-identified; cannot trade cargo |
| **Order B/L** | Negotiable | Consignee "To Order"; can endorse to 3rd party |

#### B/L Contents (Mandatory Fields)
```
Bill of Lading

FROM: NVOCC Name & Address
SHIPPER: [Exporter name, address, country]
CONSIGNEE: [Importer name, address, country]
NOTIFY: [Same as consignee typically]

BOOKING NO: BK-20260518-ABCD
B/L NO: MBL-20260518-1 (Master), HBL-20260518-1 (House)

VESSEL: MV MAERSK SK28
VOYAGE: 028W
SAILING DATE: 2026-06-01
POL: Shanghai (CNSHA) | POD: Los Angeles (USLA)
TRANSSHIPMENT: Via Busan (optional)

CONTAINER DETAILS:
- Container No: MRSKU1234567
- Seal No: 12345, 67890
- Type: 40ft HC
- CBM: 67 m³
- Weight: 23.5 MT

COMMODITY:
- Description: Electronic Components
- HS Code: 8471.30
- QTY: 1x20ft container
- Weight: 23,500 kg
- Marks: ABC Corp / Case 1-50

TERMS:
- Freight: CIF $2,500 (prepaid)
- Currency: USD
- Incoterms: CIF (NVOCC responsible for insurance)

REMARKS:
- Original B/L to follow by courier
- CRO issued to ABC Corp
- NOR (Notice of Readiness) issued
- Shipper responsible for all customs duties & taxes at destination

ISSUING PARTY: NVOCC Name, Authorized by: [Stamp/Signature]
DATE: 2026-05-18
```

#### B/L Issuance Rules
1. **Original B/L:** Issued after cargo loaded (not before, per SOLAS)
2. **Copies:** Typically 3 originals issued (consignee, bank, shipper)
3. **Negotiable B/L:** Must be an "Original"
4. **Non-negotiable:** May be email/PDF (for SOP bookings)
5. **Amendments:** If shipper provides wrong data, B/L can be amended pre-loading only

#### System Implementation
```typescript
// Generate B/L - B/L can only be issued after:
// 1. Booking approved & locked
// 2. Cargo loaded on vessel (GI confirmed)
// 3. Customs clearance complete

async function generateBL(bookingId) {
  const booking = await getBooking(bookingId);
  
  if (booking.status !== 'LOADED') {
    throw new Error('Cannot issue B/L until cargo is loaded');
  }
  
  const bl = {
    blNo: generateBLNumber(), // MBL-YYYYMMDD-XXX
    bookingNo: booking.booking_no,
    shipper: booking.shipper,
    consignee: booking.consignee,
    vessel: booking.vessel_name,
    sailing_date: booking.sailing_date,
    // ... other fields
    issuedDate: new Date(),
    issuedBy: currentUser.id
  };
  
  // Save to database
  await saveBL(bl);
  
  // Send to shipper via email
  await emailService.send({
    to: shipper.email,
    subject: `B/L ${bl.blNo} for ${booking.booking_no}`,
    attachments: [generatePDF(bl)]
  });
  
  // Log in audit trail
  auditLog('bl_documents', bl.id, 'INSERT', currentUser.id, bl);
}
```

---

## Financial Management & Cost Settlement

### Cost Components

#### Direct Costs (What NVOCC Pays)

| Cost | Amount | Notes |
|------|--------|-------|
| **Freight Cost** | $2,000-3,000/container | Negotiated with ocean carrier |
| **Port Charges (POL)** | $300-500 | Terminal handling, documentation |
| **Port Charges (POD)** | $300-500 | Terminal handling |
| **Detention (if over free)** | $50-100/day | Per container, per day |
| **Customs Clearance** | $100-200 | Broker fees |
| **Documentation** | $50-150 | B/L, CRO, D/O generation |
| **Insurance** | $100-300 | Marine cargo insurance |
| **Agency Fees** | $200-300 | POL & POD agent fees |
| **IT/System** | $10-20 | Booking, tracking, documents |

**Total Cost per Container:** ~$3,110-$5,070 (FEU / FCL)

#### Revenue (What NVOCC Charges Shipper)

| Item | Amount | Notes |
|------|--------|-------|
| **Freight Rate** | $2,500 | Mark-up: 25% on cost = profit |
| **Surcharges** | $400-800 | Fuel, security, handling, environmental |
| **Detention (passed through)** | $75-150/day | If applicable |
| **Port Charges (passed through)** | $300-500 | Passed through or absorbed |
| **Documentation** | $50-100 | Fee for B/L, CRO |

**Total Revenue per Container:** ~$3,250-$4,000

**Profit per Container:** ~$180-$930 (4-18% margin - highly competitive)

### Statement of Account (SOA) Generation

**Automated Process:**
1. System collects all charges by shipper
2. Groups by month
3. Generates SOA with:
   - Invoice date
   - Due date (Net 30 typically)
   - Booking breakdown
   - Detention charges (itemized by day)
   - Port charges
   - Service fees
   - Total amount due
   - Payment terms

**Example SOA:**
```
===== STATEMENT OF ACCOUNT =====
For: ABC Export Company
Period: May 1-31, 2026
Due Date: June 30, 2026
Currency: USD

Booking: BK-20260515-001 | MV Maersk SK28
├─ Freight: $2,500.00
├─ Fuel Surcharge: $250.00
├─ Port Charges: $400.00
├─ Documentation: $50.00
└─ Subtotal: $3,200.00

Booking: BK-20260520-002 | MV ONE
├─ Freight: $2,300.00
├─ Port Charges: $375.00
├─ Detention (3 days @ $75): $225.00
└─ Subtotal: $2,900.00

=========================================
TOTAL AMOUNT DUE: $6,100.00
Payment Terms: Net 30
Late Payment Penalty: 2% per month
=========================================

Bank Transfer:
Account: 123456789
Bank: JP Morgan Chase
Swift: CHASUS33
Reference: ABC-SOA-20260531
```

### Credit Management

**Credit Limit Setting:**
```
New Shipper: $5,000 (verify)
Active Shipper (< 1 year): $25,000 (after clean payment history)
Established Shipper (1+ years, perfect payment): $100,000+
Large Enterprise: Unlimited (or negotiated limit)
```

**System Check on Booking Submission:**
```sql
-- Verify credit limit not exceeded
SELECT 
  COALESCE(c.credit_limit, 5000) - COALESCE(SUM(ch.amount), 0) as available_credit
FROM common_parties c
LEFT JOIN bookings b ON c.id = b.shipper_party_id
LEFT JOIN charges ch ON b.id = ch.booking_id AND ch.payment_status = 'PENDING'
WHERE c.id = :shipper_id
GROUP BY c.id;

-- If available_credit < booking_freight_cost → Block booking
```

---

## Documentation Requirements

### Mandatory Documents Per Shipment

#### 1. Commercial Documents

| Document | Issued By | Purpose | Deadline |
|----------|-----------|---------|----------|
| **Commercial Invoice** | Exporter | Customs declaration of value | Before loading |
| **Packing List** | Exporter/Freight Forwarder | Details of items & packaging | Before loading |
| **Bill of Lading** | NVOCC | Proof of shipment & contract | After loading |
| **Booking Confirmation** | NVOCC | Booking reference & terms | Immediately |

#### 2. Regulatory Documents

| Document | For | Required By | Notes |
|----------|-----|-------------|-------|
| **IMDG Certificate** | Hazmat cargo | IMO/Shipper | UN class, packing group |
| **Reefer Certificate** | Temperature-controlled | Terminal | Temperature settings |
| **Phytosanitary Cert** | Agricultural products | USDA/Exporting country | Pest/disease clearance |
| **Origin Certificate** | Tariff qualification | CBP (US) | Proves country of origin |
| **Insurance Certificate** | CIF shipments | Shipper | Marine cargo insurance proof |

#### 3. Customs Documents

| Document | For | Issued By | Deadline |
|----------|-----|-----------|----------|
| **Entry Summary (US)** | US imports | Customs broker or NVOCC | Within 15 days of arrival |
| **Commercial Invoice (US)** | US imports | Exporter | With shipment |
| **AES Filing (US)** | All US exports | Exporter | Before departure |
| **ISF (Importer Security Filing)** | US imports | Importer or NVOCC | 24h before loading |

#### 4. Post-Delivery Documents

| Document | Purpose | Timeline |
|----------|---------|----------|
| **Proof of Delivery (POD)** | Confirm consignee received cargo | Within 10 days of delivery |
| **Gate Out Receipt** | Confirm container returned | Within 30 days |
| **Delivery Drayage Invoice** | Final-mile delivery charges | Within 14 days |

### Document Checklist by Commodity Type

#### Electronics
- ✅ Commercial Invoice (value >$2500)
- ✅ Packing List (detailed item list)
- ✅ Insurance Certificate (if CIF)
- ✅ Country of Origin (preferential rates)
- ✅ Certificate of Compliance (if applicable)

#### Hazmat/Chemicals
- ✅ IMDG Certificate (UN class, packing group)
- ✅ MSDS (Material Safety Data Sheet)
- ✅ Shipper's Declaration
- ✅ Laboratory Certificate (if required)
- ✅ Port Authority Pre-approval (some ports)

#### Perishables
- ✅ Phytosanitary Certificate (for plants/food)
- ✅ Temperature/Ventilation Certificate
- ✅ Health Certificate (animal products)
- ✅ Reefer Container Certification

#### Textiles
- ✅ Commercial Invoice
- ✅ Packing List (detailed by item)
- ✅ Certificate of Origin (US-bound: CAFTA/USMCA)
- ✅ Import License (some countries require)

### System Implementation: Document Management

```typescript
// Document Upload & Validation

const documentRequirements = {
  'ELECTRONICS': ['commercial_invoice', 'packing_list', 'cert_of_origin'],
  'HAZMAT': ['imdg_certificate', 'msds', 'shippers_declaration'],
  'PERISHABLE': ['phytosanitary_cert', 'reefer_certificate', 'health_cert'],
  'TEXTILES': ['commercial_invoice', 'cert_of_origin']
};

async function validateDocuments(booking) {
  const commodity = booking.commodity;
  const required = documentRequirements[commodity.type];
  const uploaded = await getUploadedDocuments(booking.id);
  
  const missing = required.filter(doc => !uploaded.includes(doc));
  
  if (missing.length > 0) {
    // Alert: Missing critical documents
    await alert({
      user: booking.agent,
      message: `Missing documents for ${booking.booking_no}: ${missing.join(', ')}`,
      severity: 'HIGH'
    });
  }
  
  return { complete: missing.length === 0, missing };
}

// Document storage: AWS S3 / Google Cloud Storage
// Retention: 7 years per regulatory requirement
```

---

## Technology Standards

### Integration Standards

#### EDI (Electronic Data Interchange)
- **Format:** EDIFACT (UN standard) or X.12 (USA)
- **Usage:** Exchange booking data, tracking updates, invoicing with carriers & customs
- **Example:**
  ```
  UNH+1+ORDERS:D:96A:UN'...
  BGM+220+ORDER123'
  DTM+137:20260518:102'
  ```

#### APIs for Carrier Integration
- **Port Authority APIs:** Real-time container tracking
- **Ocean Carrier APIs:** Vessel schedules, rates, space availability
- **Customs APIs:** e-entry filing (US), e-customs clearance (other countries)
- **Checkout Integration:** Payment gateway integration (Stripe, Wise, SWIFT)

#### SSL/TLS Encryption
- **Minimum:** TLS 1.2 (preferably 1.3)
- **Certificates:** Valid SSL cert from trusted CA
- **Headers:** HSTS, X-Frame-Options, Content-Security-Policy

### Data Standards

#### HS Code Standards
- **Authority:** World Customs Organization (WCO)
- **Format:** 6-10 digits (varies by country)
- **Example:** 8471.30 = Automatic data processing machines
- **System:** Auto-lookup via API (tariff database)

#### Port Codes
- **Standard:** UNCTAD (United Nations Conference on Trade & Development)
- **Format:** 5 characters (e.g., CNSHA, USLA, JPTYO)
- **System:** Validate against UNCTAD list during port selection

#### Currency Codes
- **Standard:** ISO 4217
- **Example:** USD, EUR, CNY, SGD
- **System:** Maintain current exchange rates (daily updates)

#### Container Codes
- **Standard:** ISO 6346
- **Format:** 4 letters + 7 digits + 1 check digit
- **Example:** MRSKU1234567-8
- **System:** Validate check digit on entry

---

## Benchmarking Metrics

### Performance KPIs

#### Operational Metrics

| Metric | Target | Calculation |
|--------|--------|-------------|
| **On-Time Delivery** | 98%+ | (Early/On-time deliveries) / Total deliveries |
| **Space Utilization** | 85%+ | Actual weight/volume / Container capacity |
| **Detention Rate** | <5% | Containers incurring detention / Total containers |
| **Documentation Accuracy** | >99% | Correct docs on first submission / Total submissions |
| **Booking-to-Sailing Time** | <48h | Time from booking to cargo gate-in |
| **Approval Turnaround** | <4h | Time from submission to approval |

#### Financial Metrics

| Metric | Target | Calculation |
|--------|--------|-------------|
| **Gross Margin** | 15-18% | (Revenue - COGS) / Revenue |
| **Collection Rate** | 98%+ | Invoices paid / Total invoices |
| **Days Sales Outstanding (DSO)** | <45 days | (Receivables) / (Daily revenue) |
| **Cost per Container** | <$4,500 | Total costs / Number of containers |
| **Revenue per FEU** | $3,500-4,500 | Total revenue / Number of containers |

#### Customer Satisfaction

| Metric | Target | Method |
|--------|--------|--------|
| **Net Promoter Score (NPS)** | 50+ | Survey: "Would recommend?" |
| **Customer Retention** | 85%+ | Active customers / Previous year total |
| **Complaint Resolution** | <24h | Time to resolve complaint |
| **Shipper Satisfaction** | 4.5+/5 | Post-delivery survey |

### Benchmarking Against Industry

**Top-Tier NVOCC Performance:**
- On-time delivery: 98-99%
- Gross margin: 18-22%
- DSO: 30-40 days
- NPS: 60-75
- Employee productivity: $500k+ revenue per employee

**Mid-Tier NVOCC Performance:**
- On-time delivery: 96-98%
- Gross margin: 12-16%
- DSO: 40-60 days
- NPS: 40-50
- Employee productivity: $300-500k per employee

**How to Use:** Quarterly review these metrics and benchmark against industry reports (check Logistics Manager Index, Container xChange, Alphaliner reports)

---

## Risk Management

### Operational Risks

#### Risk 1: Port Congestion & Delays
**Impact:** Increased detention charges, late delivery penalties
**Mitigation:**
- Monitor port queue lengths (real-time data feeds)
- Align sailing dates with low-congestion periods
- Pre-alert shippers of potential delays
- Negotiate detention credits with carriers

#### Risk 2: Vessel Breakdown/Cancellation
**Impact:** Booking cancellation, cargo rescheduling, reputation damage
**Mitigation:**
- Use multiple carriers (don't rely on 1 carrier)
- Have backup vessel agreements
- Insurance for cargo loss
- Rapid rebooking protocol (< 4 hours)

#### Risk 3: Incorrect Documentation
**Impact:** Customs rejection, shipment hold, penalties
**Mitigation:**
- Document checklist system (per commodity type)
- Automated validation rules
- Pre-shipment document review by experienced staff
- Customs broker verification

### Financial Risks

#### Risk 1: Shipper Non-Payment
**Impact:** Cash flow impact, revenue loss
**Mitigation:**
- Credit limit checks before booking
- Credit insurance for large shippers
- Payment terms: CIF prepaid or Letter of Credit for new shippers
- Collection procedures (invoice, reminder, escalation)

#### Risk 2: Freight Rate Volatility
**Impact:** Margin compression (rates drop, shipper charged less)
**Mitigation:**
- Weekly rate reviews (align with market)
- Hedging strategies (forward contracts with carriers)
- Dynamic pricing (adjust rates to market weekly)
- Volume discounts (incentivize year-long contracts)

#### Risk 3: Fuel Price Fluctuations
**Impact:** Surcharge adjustments, margin pressure
**Mitigation:**
- Fuel surcharge clauses (monthly adjustments)
- Lock fuel costs with carriers (quarterly hedges)
- Pass-through fuel charges transparently to shippers

### Compliance Risks

#### Risk 1: NVOCC License Revocation
**Impact:** Cannot legally operate, reputation destruction
**Mitigation:**
- Maintain FMC compliance (tariff filings, insurance)
- Regular compliance audits (quarterly)
- Maintain insurance (never let policy lapse)
- Proper rate filing (all rates documented)

#### Risk 2: Customs Penalties
**Impact:** Fines ($10k-$100k+), cargo holds, shipper disputes
**Mitigation:**
- Hire licensed customs broker
- Document verification process
- E-entry filing (US) for speed
- Training for all customer-facing staff

#### Risk 3: Data Breach / Cybersecurity
**Impact:** Customer data exposure, regulatory fines (GDPR, CCPA)
**Mitigation:**
- Encrypt all customer data (TLS 1.3+)
- Regular penetration testing
- Backup systems (redundancy)
- Incident response plan
- Cyber insurance

### Security Measures for ERP

| Measure | Implementation | Frequency |
|---------|-----------------|-----------|
| **Data Encryption** | TLS 1.3 for transit, AES-256 at rest | Always |
| **Access Logging** | All logins, data accesses logged | Real-time |
| **Backups** | Daily automated, tested monthly | Daily |
| **Firewall** | IP whitelisting for API access | Always |
| **MFA** | 2FA for admin & approvers | Always |
| **Penetration Test** | Third-party security audit | Annual |
| **Incident Response** | 24/7 monitoring, response team | 24/7 |
| **DLP (Data Loss Prevention)** | Prevent email forwarding of sensitive data | Always |

---

**Document Version:** 1.0 | **Last Updated:** May 2026 | **Next Review:** November 2026
