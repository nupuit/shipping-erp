"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

const generateBookingNo = (): string => {
  const now = new Date();
  const yyyymmdd = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `BK-${yyyymmdd}-${random}`;
};

type BookingForm = {
  booking_no: string;
  approval_no: string;
  reference_no: string;
  carrier_id: string;
  commodity_id: string;
  freight_type_id: string;
  container_owner_id: string;
  booking_date: string;
  sailing_date: string;
  pol_id: string;
  pod_id: string;
  pot1: string;
  pot2: string;
  shipper_id: string;
  consignee_id: string;
  cost_rate: number;
  revenue_rate: number;
  agent_pol_id: string;
  agent_pofd_id: string;
  agent1_id: string;
  agent2_id: string;
  act_shipper: boolean;
  approval_status_id: string;
  special_requirements: string;
  free_days_pol: number;
  detention_free_days_pofd: number;
  detention_currency_id: string;
  slot_operator_t1_id: string;
  slot_operator_t2_id: string;
  cc_agent_id: string;
  egm: string;
  berth: string;
  wharf: string;
  via_port: string;
  temperature: string;
  vent: string;
  noc: string;
  note: string;
  cro_instruction: string;
  container_info: string;
  srr: string;
  service1_id: string;
  service2_id: string;
  remarks: string;
};

type Currency = { id: string; currency_code: string; currency_name: string; symbol: string };
type ContainerType = { id: string; container_code: string; description: string; size_category: string; teu: number };
type Service = { id: string; service_code: string; description: string };
type ApprovalStatus = { id: string; status_code: string; description: string };
type FreightType = { id: string; freight_code: string; description: string };
type ContainerOwner = { id: string; owner_code: string; description: string };
type ActivityType = { id: string; activity_code: string; description: string };
type DocumentType = { id: string; document_code: string; description: string };
type ContainerStatus = { id: string; status_code: string; description: string };
type VesselType = { id: string; vessel_code: string; description: string };
type PartyType = { id: string; party_code: string; description: string };
type Port = { id: string; port_code: string; port_name: string; country: string; city: string; timezone: string; unlocode: string; port_type: string; facilities: string };
type Party = { id: string; party_name: string; party_type_id: string; contact_person: string; email: string; phone: string; address: string; city: string; country: string; postal_code: string; tax_id: string; bank_name: string; bank_account: string; swift_code: string; is_active: boolean; credit_limit: number; payment_terms: string; remarks: string; created_at: string; updated_at: string };
type Vessel = { id: string; vessel_name: string; imo_no: string; voyage: string; vessel_type_id: string; capacity_teu: number; capacity_cbm: number; flag: string; call_sign: string; built_year: number; grt: number; nrt: number; owner_id: string; operator_id: string; eta: string; etd: string; port_of_registry: string; is_active: boolean; remarks: string; created_at: string; updated_at: string };
type Commodity = { id: string; commodity_code: string; hs_code: string; description: string; commodity_group: string; is_dangerous: boolean; is_perishable: boolean; storage_requirement: string; handling_notes: string; is_active: boolean; created_at: string; updated_at: string };
type Booking = { id: string; booking_no: string; approval_no: string; reference_no: string; booking_date: string; sailing_date: string; carrier_id: string; commodity_id: string; freight_type_id: string; container_owner_id: string; pol_id: string; pod_id: string; pot1: string; pot2: string; shipper_id: string; consignee_id: string; agent_pol_id: string; agent_pofd_id: string; agent1_id: string; agent2_id: string; act_shipper: boolean; approval_status_id: string; special_requirements: string; free_days_pol: number; detention_free_days_pofd: number; detention_currency_id: string; slot_operator_t1_id: string; slot_operator_t2_id: string; cc_agent_id: string; egm: string; berth: string; wharf: string; via_port: string; temperature: string; vent: string; noc: string; note: string; cro_instruction: string; container_info: string; srr: string; service1_id: string; service2_id: string; cargo_details: any[]; remarks: string; total_cost: number; total_revenue: number; net_amount: number; created_at: string; updated_at: string };
type BookingItemForm = {
  container_type_id: string;
  quantity: number;
  gross_weight: string;
  packages: string;
  unit: string;
  cargo_volume: string;
  comments: string;
};

type BookingItem = { id: string; booking_id: string; sno: number; container_type_id: string; quantity: number; gross_weight: string; packages: string; unit: string; cargo_volume: string; comments: string; created_at: string; updated_at: string };

type NavigationSection = { id: string; label: string; icon: string; children: { id: string; label: string }[] };

const navSections: NavigationSection[] = [
  {
    id: "setup",
    label: "Setup",
    icon: "⚙️",
    children: [
      { id: "common-parties", label: "Common Parties" },
      { id: "vessel", label: "Vessel" },
      { id: "commodity", label: "Commodity" },
      { id: "ports", label: "Ports" },
    ],
  },
  {
    id: "transactions",
    label: "Transactions",
    icon: "📦",
    children: [
      { id: "booking", label: "Booking" },
      { id: "bl", label: "B/L" },
      { id: "switch-bl", label: "Switch B/L" },
      { id: "split-bl", label: "Split BL" },
      { id: "vessel-lock", label: "Vessel Lock" },
    ],
  },
  {
    id: "utilities",
    label: "Utilities",
    icon: "🛠️",
    children: [{ id: "report", label: "Report" }],
  },
  {
    id: "depot",
    label: "Depot Tasks",
    icon: "🏭",
    children: [],
  },
];

const emptyItem = (): BookingItemForm => ({
  container_type_id: "",
  quantity: 1,
  gross_weight: "",
  packages: "",
  unit: "",
  cargo_volume: "",
  comments: "",
});

const initialBooking: BookingForm = {
  booking_no: "",
  approval_no: "",
  reference_no: "",
  carrier_id: "",
  commodity_id: "",
  freight_type_id: "",
  container_owner_id: "",
  booking_date: new Date().toISOString().slice(0, 10),
  sailing_date: new Date().toISOString().slice(0, 10),
  pol_id: "",
  pod_id: "",
  pot1: "",
  pot2: "",
  shipper_id: "",
  consignee_id: "",
  agent_pol_id: "",
  agent_pofd_id: "",
  agent1_id: "",
  agent2_id: "",
  act_shipper: false,
  approval_status_id: "",
  special_requirements: "",
  free_days_pol: 0,
  detention_free_days_pofd: 0,
  detention_currency_id: "",
  slot_operator_t1_id: "",
  slot_operator_t2_id: "",
  cc_agent_id: "",
  cost_rate: 0,
  revenue_rate: 0,
  egm: "",
  berth: "",
  wharf: "",
  via_port: "",
  temperature: "",
  vent: "",
  noc: "",
  note: "",
  cro_instruction: "",
  container_info: "",
  srr: "",
  service1_id: "",
  service2_id: "",
  remarks: "",
};

export default function Home() {
  const [activeView, setActiveView] = useState("booking");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [session, setSession] = useState<any>(null);
  const [authView, setAuthView] = useState<"login" | "signup">("login");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");

  // Common Parties
  const [parties, setParties] = useState<Party[]>([]);
  const [newParty, setNewParty] = useState({ party_name: "", party_type_id: "", contact_person: "", email: "", address: "" });
  const [showPartyForm, setShowPartyForm] = useState(false);

  // Vessels
  const [vessels, setVessels] = useState<Vessel[]>([]);
  const [newVessel, setNewVessel] = useState({ vessel_name: "", imo_no: "", voyage: "", capacity_teu: 0, flag: "" });
  const [showVesselForm, setShowVesselForm] = useState(false);

  // Commodities
  const [commodities, setCommodities] = useState<Commodity[]>([]);
  const [newCommodity, setNewCommodity] = useState({ commodity_code: "", description: "", hs_code: "" });
  const [showCommodityForm, setShowCommodityForm] = useState(false);

  // Ports
  const [ports, setPorts] = useState<Port[]>([]);

  // Master Data
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [containerTypes, setContainerTypes] = useState<ContainerType[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [approvalStatuses, setApprovalStatuses] = useState<ApprovalStatus[]>([]);
  const [freightTypes, setFreightTypes] = useState<FreightType[]>([]);
  const [containerOwners, setContainerOwners] = useState<ContainerOwner[]>([]);
  const [activityTypes, setActivityTypes] = useState<ActivityType[]>([]);
  const [documentTypes, setDocumentTypes] = useState<DocumentType[]>([]);
  const [containerStatuses, setContainerStatuses] = useState<ContainerStatus[]>([]);
  const [vesselTypes, setVesselTypes] = useState<VesselType[]>([]);
  const [partyTypes, setPartyTypes] = useState<PartyType[]>([]);
  const [newPort, setNewPort] = useState({ port_code: "", port_name: "", country: "", city: "", timezone: "" });
  const [showPortForm, setShowPortForm] = useState(false);

  // Bookings
  const [booking, setBooking] = useState<BookingForm>(initialBooking);
  const [items, setItems] = useState<BookingItemForm[]>([{ container_type_id: "", quantity: 1, gross_weight: "", packages: "", unit: "", cargo_volume: "", comments: "" }]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [activeBookingTab, setActiveBookingTab] = useState<"basic" | "other" | "messages">("basic");
  const [expandedSections, setExpandedSections] = useState({ setup: true, transactions: true, utilities: false, depot: false });
  const [totals, setTotals] = useState({ totalCost: 0, totalRevenue: 0, netAmount: 0 });

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => {
      mounted = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (session) {
      fetchAllData();
    }
  }, [session]);

  async function fetchAllData() {
    await Promise.all([fetchParties(), fetchVessels(), fetchCommodities(), fetchPorts(), fetchCurrencies(), fetchContainerTypes(), fetchServices(), fetchApprovalStatuses(), fetchFreightTypes(), fetchContainerOwners(), fetchActivityTypes(), fetchDocumentTypes(), fetchContainerStatuses(), fetchVesselTypes(), fetchPartyTypes(), fetchBookings()]);
  }

  async function fetchParties() {
    const { data } = await supabase.from("common_parties").select("*");
    setParties(data || []);
  }

  async function fetchVessels() {
    const { data } = await supabase.from("vessels").select("*");
    setVessels(data || []);
  }

  async function fetchCommodities() {
    const { data } = await supabase.from("commodities").select("*");
    setCommodities(data || []);
  }

  async function fetchPorts() {
    const { data } = await supabase.from("ports").select("*");
    setPorts(data || []);
  }

  async function fetchCurrencies() {
    const { data } = await supabase.from("currencies").select("*");
    setCurrencies(data || []);
  }

  async function fetchContainerTypes() {
    const { data } = await supabase.from("container_types").select("*");
    setContainerTypes(data || []);
  }

  async function fetchServices() {
    const { data } = await supabase.from("services").select("*");
    setServices(data || []);
  }

  async function fetchApprovalStatuses() {
    const { data } = await supabase.from("approval_statuses").select("*");
    setApprovalStatuses(data || []);
  }

  async function fetchFreightTypes() {
    const { data } = await supabase.from("freight_types").select("*");
    setFreightTypes(data || []);
  }

  async function fetchContainerOwners() {
    const { data } = await supabase.from("container_owners").select("*");
    setContainerOwners(data || []);
  }

  async function fetchActivityTypes() {
    const { data } = await supabase.from("activity_types").select("*");
    setActivityTypes(data || []);
  }

  async function fetchDocumentTypes() {
    const { data } = await supabase.from("document_types").select("*");
    setDocumentTypes(data || []);
  }

  async function fetchContainerStatuses() {
    const { data } = await supabase.from("container_statuses").select("*");
    setContainerStatuses(data || []);
  }

  async function fetchVesselTypes() {
    const { data } = await supabase.from("vessel_types").select("*");
    setVesselTypes(data || []);
  }

  async function fetchPartyTypes() {
    const { data } = await supabase.from("party_types").select("*");
    setPartyTypes(data || []);
  }

  const computeTotals = () => {
    const totalQuantity = items.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
    const totalCost = totalQuantity * Number(booking.cost_rate || 0);
    const totalRevenue = totalQuantity * Number(booking.revenue_rate || 0);
    return {
      totalCost,
      totalRevenue,
      netAmount: totalRevenue - totalCost,
    };
  };

  const getPartyName = (partyId: string | number | null | undefined) => {
    if (!partyId) return "-";
    return parties.find((p) => String(p.id) === String(partyId))?.party_name || "-";
  };

  useEffect(() => {
    setTotals(computeTotals());
  }, [items, booking.cost_rate, booking.revenue_rate]);

  const validateBooking = () => {
    if (!booking.shipper_id) return "Shipper is required.";
    if (!booking.consignee_id) return "Consignee is required.";
    if (!booking.commodity_id) return "Commodity is required.";
    if (!booking.pol_id) return "POL is required.";
    if (!booking.pod_id) return "POD is required.";
    if (!booking.booking_date) return "Booking date is required.";
    if (!booking.sailing_date) return "Sailing date is required.";
    if (new Date(booking.booking_date) > new Date(booking.sailing_date)) return "Sailing date cannot be before booking date.";
    if (!items.length) return "At least one cargo row is required.";
    for (const [index, item] of items.entries()) {
      if (!item.container_type_id || !item.gross_weight || !item.packages || !item.unit) {
        return `Cargo row ${index + 1} is incomplete.`;
      }
      if (item.quantity <= 0) return `Cargo row ${index + 1} must have quantity greater than zero.`;
    }
    return null;
  };

  async function fetchBookings() {
    const { data } = await supabase.from("bookings").select("*").order("created_at", { ascending: false });
    setBookings(data || []);
  }

  // Party operations
  async function addParty() {
    if (!newParty.party_name || !newParty.contact_person) {
      setMessage("Error ❌ Name and contact are required.");
      return;
    }
    setLoading(true);
    const { error } = await supabase.from("common_parties").insert([newParty]);
    if (error) {
      setMessage(`Error ❌ ${error.message}`);
    } else {
      setMessage("✅ Party added successfully.");
      setNewParty({ party_name: "", party_type_id: "", contact_person: "", email: "", address: "" });
      setShowPartyForm(false);
      fetchParties();
    }
    setLoading(false);
  }

  async function deleteParty(id: string) {
    setLoading(true);
    const { error } = await supabase.from("common_parties").delete().eq("id", id);
    if (error) {
      setMessage(`Error ❌ ${error.message}`);
    } else {
      setMessage("✅ Party deleted.");
      fetchParties();
    }
    setLoading(false);
  }

  // Vessel operations
  async function addVessel() {
    if (!newVessel.vessel_name || !newVessel.imo_no) {
      setMessage("Error ❌ Name and IMO number are required.");
      return;
    }
    setLoading(true);
    const { error } = await supabase.from("vessels").insert([newVessel]);
    if (error) {
      setMessage(`Error ❌ ${error.message}`);
    } else {
      setMessage("✅ Vessel added successfully.");
      setNewVessel({ vessel_name: "", imo_no: "", voyage: "", capacity_teu: 0, flag: "" });
      setShowVesselForm(false);
      fetchVessels();
    }
    setLoading(false);
  }

  async function deleteVessel(id: string) {
    setLoading(true);
    const { error } = await supabase.from("vessels").delete().eq("id", id);
    if (error) {
      setMessage(`Error ❌ ${error.message}`);
    } else {
      setMessage("✅ Vessel deleted.");
      fetchVessels();
    }
    setLoading(false);
  }

  // Commodity operations
  async function addCommodity() {
    if (!newCommodity.commodity_code || !newCommodity.hs_code) {
      setMessage("Error ❌ Code and HS code are required.");
      return;
    }
    setLoading(true);
    const { error } = await supabase.from("commodities").insert([newCommodity]);
    if (error) {
      setMessage(`Error ❌ ${error.message}`);
    } else {
      setMessage("✅ Commodity added successfully.");
      setNewCommodity({ commodity_code: "", description: "", hs_code: "" });
      setShowCommodityForm(false);
      fetchCommodities();
    }
    setLoading(false);
  }

  async function deleteCommodity(id: string) {
    setLoading(true);
    const { error } = await supabase.from("commodities").delete().eq("id", id);
    if (error) {
      setMessage(`Error ❌ ${error.message}`);
    } else {
      setMessage("✅ Commodity deleted.");
      fetchCommodities();
    }
    setLoading(false);
  }

  // Port operations
  async function addPort() {
    if (!newPort.port_code || !newPort.port_name) {
      setMessage("Error ❌ Port code and name are required.");
      return;
    }
    setLoading(true);
    const { error } = await supabase.from("ports").insert([newPort]);
    if (error) {
      setMessage(`Error ❌ ${error.message}`);
    } else {
      setMessage("✅ Port added successfully.");
      setNewPort({ port_code: "", port_name: "", country: "", city: "", timezone: "" });
      setShowPortForm(false);
      fetchPorts();
    }
    setLoading(false);
  }

  async function deletePort(id: string) {
    setLoading(true);
    const { error } = await supabase.from("ports").delete().eq("id", id);
    if (error) {
      setMessage(`Error ❌ ${error.message}`);
    } else {
      setMessage("✅ Port deleted.");
      fetchPorts();
    }
    setLoading(false);
  }

  async function signIn() {
    setMessage(null);
    if (!authEmail || !authPassword) {
      setMessage("Error ❌ Email and password are required.");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email: authEmail, password: authPassword });
    if (error) {
      setMessage(`Error ❌ ${error.message}`);
    } else {
      setMessage("✅ Signed in successfully.");
      setAuthEmail("");
      setAuthPassword("");
    }
    setLoading(false);
  }

  async function signUp() {
    setMessage(null);
    if (!authEmail || !authPassword) {
      setMessage("Error ❌ Email and password are required.");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signUp({ email: authEmail, password: authPassword });
    if (error) {
      setMessage(`Error ❌ ${error.message}`);
    } else {
      setMessage("✅ Signup request sent. Check your email to confirm.");
      setAuthEmail("");
      setAuthPassword("");
      setAuthView("login");
    }
    setLoading(false);
  }

  async function signOut() {
    setLoading(true);
    const { error } = await supabase.auth.signOut();
    if (error) {
      setMessage(`Error ❌ ${error.message}`);
    } else {
      setMessage("✅ Signed out.");
    }
    setLoading(false);
  }

  const updateField = <K extends keyof BookingForm>(field: K, value: BookingForm[K]) => {
    setBooking((prev) => ({ ...prev, [field]: value }));
  };

  const updateItem = (index: number, field: string, value: string | number) => {
    setItems((prev) =>
      prev.map((item, idx) =>
        idx === index ? { ...item, [field]: field === "quantity" ? Number(value) : String(value) } : item
      )
    );
  };

  const addItem = () => setItems((prev) => [...prev, { container_type_id: "", quantity: 1, gross_weight: "", packages: "", unit: "", cargo_volume: "", comments: "" }]);
  const removeItem = (index: number) => setItems((prev) => prev.filter((_, idx) => idx !== index));

  // Booking operations
  async function saveBooking() {
    setMessage(null);
    const validationError = validateBooking();
    if (validationError) {
      setMessage(`Error ❌ ${validationError}`);
      return;
    }

    setLoading(true);
    const bookingNo = booking.booking_no || generateBookingNo();
    const { error } = await supabase.from("bookings").insert([
      {
        booking_no: bookingNo,
        approval_no: booking.approval_no,
        reference_no: booking.reference_no,
        carrier_id: booking.carrier_id || null,
        commodity_id: booking.commodity_id || null,
        freight_type_id: booking.freight_type_id,
        container_owner_id: booking.container_owner_id,
        booking_date: booking.booking_date,
        sailing_date: booking.sailing_date,
        pol_id: booking.pol_id,
        pod_id: booking.pod_id,
        pot1: booking.pot1,
        pot2: booking.pot2,
        shipper_id: booking.shipper_id,
        consignee_id: booking.consignee_id,
        agent_pol_id: booking.agent_pol_id,
        agent_pofd_id: booking.agent_pofd_id,
        agent1_id: booking.agent1_id,
        agent2_id: booking.agent2_id,
        act_shipper: booking.act_shipper,
        approval_status_id: booking.approval_status_id,
        special_requirements: booking.special_requirements,
        free_days_pol: booking.free_days_pol,
        detention_free_days_pofd: booking.detention_free_days_pofd,
        detention_currency_id: booking.detention_currency_id,
        slot_operator_t1_id: booking.slot_operator_t1_id || null,
        slot_operator_t2_id: booking.slot_operator_t2_id || null,
        cc_agent_id: booking.cc_agent_id || null,
        egm: booking.egm,
        berth: booking.berth,
        wharf: booking.wharf,
        via_port: booking.via_port,
        temperature: booking.temperature,
        vent: booking.vent,
        noc: booking.noc,
        note: booking.note,
        cro_instruction: booking.cro_instruction,
        container_info: booking.container_info,
        srr: booking.srr,
        service1_id: booking.service1_id,
        service2_id: booking.service2_id,
        cargo_details: items,
        remarks: booking.remarks,
        total_cost: totals.totalCost,
        total_revenue: totals.totalRevenue,
        net_amount: totals.netAmount,
      },
    ]);

    if (error) {
      setMessage(`Error ❌ ${error.message}`);
    } else {
      setMessage(`✅ Booking saved successfully. Booking #: ${bookingNo}`);
      setBooking({ ...initialBooking, booking_no: "" });
      setItems([{ container_type_id: "", quantity: 1, gross_weight: "", packages: "", unit: "", cargo_volume: "", comments: "" }]);
      setTotals({ totalCost: 0, totalRevenue: 0, netAmount: 0 });
      fetchBookings();
    }
    setLoading(false);
  }

  return (
    <div style={{ fontFamily: "Arial, sans-serif", minHeight: "100vh", background: "#eef3fb" }}>
<header style={{ background: "#0f4a86", padding: "18px 24px", color: "white", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <strong style={{ fontSize: "1.3rem" }}>WFF SHIPPING ERP</strong>
            <div style={{ fontSize: "0.9rem", opacity: 0.88, marginTop: "6px" }}>Complete booking, party, vessel, commodity and port management</div>
          </div>
          {session ? (
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "0.9rem", opacity: 0.88 }}>Signed in as {session.user.email}</div>
              <button onClick={signOut} disabled={loading} style={{ marginTop: "8px", padding: "8px 14px", borderRadius: "12px", background: "#fee2e2", color: "#991b1b", border: "none", cursor: "pointer" }}>
                Sign out
              </button>
            </div>
          ) : null}
      </header>

      <div style={{ display: "flex", gap: "18px", padding: "24px" }}>
        <aside style={{ width: "280px", background: "white", borderRadius: "18px", boxShadow: "0 20px 40px rgba(15, 75, 129, 0.08)", padding: "22px", height: "fit-content" }}>
          <h3 style={{ margin: "0 0 18px", color: "#0f4a86" }}>Navigation</h3>

          {navSections.map((section) => (
            <div key={section.id} style={{ marginBottom: "16px" }}>
              <button
                type="button"
                onClick={() => {
                  const key = section.id as keyof typeof expandedSections;
                  setExpandedSections((prev) => ({ ...prev, [key]: !prev[key] }));
                }}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "12px 14px",
                  background: "#f5f8fd",
                  border: "1px solid #dbe5ef",
                  borderRadius: "14px",
                  cursor: "pointer",
                  fontWeight: 600,
                  color: "#23527c",
                }}
              >
                <span>{section.icon} {section.label}</span>
                <span>{expandedSections[section.id as keyof typeof expandedSections] ? "−" : "+"}</span>
              </button>
              {expandedSections[section.id as keyof typeof expandedSections] && (
                <div style={{ marginTop: "10px", display: "grid", gap: "8px" }}>
                  {section.children.map((child) => (
                    <button
                      key={child.id}
                      type="button"
                      onClick={() => {
                        setActiveView(child.id);
                        setMessage(null);
                      }}
                      style={{
                        width: "100%",
                        textAlign: "left",
                        padding: "10px 12px",
                        borderRadius: "12px",
                        border: activeView === child.id ? "1px solid #0f4a86" : "1px solid #e5ebf0",
                        background: activeView === child.id ? "#eef4ff" : "white",
                        color: "#1c3f64",
                        cursor: "pointer",
                      }}
                    >
                      {child.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </aside>

        <main style={{ flex: 1 }}>
          {!session ? (
            <section style={{ background: "white", borderRadius: "18px", boxShadow: "0 20px 40px rgba(15, 75, 129, 0.08)", padding: "28px", minHeight: "520px", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ width: "100%", maxWidth: "520px" }}>
                <h2 style={{ margin: 0, fontSize: "1.9rem", color: "#0f4a86" }}>Shipping ERP Login</h2>
                <p style={{ margin: "10px 0 24px", color: "#576475" }}>Use your Supabase account to access the ERP system.</p>
                <div style={{ display: "grid", gap: "16px" }}>
                  <input type="email" value={authEmail} onChange={(e) => setAuthEmail(e.target.value)} placeholder="Email" style={{ width: "100%", padding: "14px", borderRadius: "14px", border: "1px solid #cbd5e1" }} />
                  <input type="password" value={authPassword} onChange={(e) => setAuthPassword(e.target.value)} placeholder="Password" style={{ width: "100%", padding: "14px", borderRadius: "14px", border: "1px solid #cbd5e1" }} />
                  <button type="button" onClick={authView === "login" ? signIn : signUp} disabled={loading} style={{ width: "100%", padding: "14px", borderRadius: "14px", background: "#0f4a86", color: "white", border: "none", cursor: "pointer" }}>
                    {authView === "login" ? "Sign in" : "Sign up"}
                  </button>
                  <button type="button" onClick={() => setAuthView(authView === "login" ? "signup" : "login")} style={{ width: "100%", padding: "14px", borderRadius: "14px", background: "#f5f8fd", color: "#0f4a86", border: "1px solid #dbe5ef", cursor: "pointer" }}>
                    {authView === "login" ? "Create a new account" : "Already have an account? Sign in"}
                  </button>
                </div>
                {message && <div style={{ marginTop: "18px", color: message.startsWith("Error") ? "#a00" : "#0a6b29", fontWeight: 600 }}>{message}</div>}
              </div>
            </section>
          ) : (
            <>
              {activeView === "booking" && (
                <section style={{ background: "white", borderRadius: "18px", boxShadow: "0 20px 40px rgba(15, 75, 129, 0.08)", padding: "24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: "1.7rem", color: "#0f4a86" }}>Booking</h2>
                  <p style={{ margin: "8px 0 0", color: "#576475" }}>Create and manage shipment bookings with a unified booking form.</p>
                </div>
                <button
                  type="button"
                  onClick={saveBooking}
                  disabled={loading}
                  style={{ padding: "12px 22px", borderRadius: "14px", background: "#0f4a86", color: "white", border: "none", cursor: "pointer" }}
                >
                  Save Booking
                </button>
              </div>

              <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
                <div style={{ flex: 2, minWidth: "560px" }}>
                  <div style={{ display: "flex", gap: "12px", marginBottom: "18px" }}>
                    {[
                      { id: "basic", label: "Basic Info" },
                      { id: "other", label: "Other Info" },
                      { id: "messages", label: "Messages" },
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setActiveBookingTab(tab.id as "basic" | "other" | "messages")}
                        style={{
                          padding: "10px 18px",
                          borderRadius: "12px",
                          border: activeBookingTab === tab.id ? "1px solid #0f4a86" : "1px solid #d8e3ee",
                          background: activeBookingTab === tab.id ? "#eef4ff" : "white",
                          color: "#1c3f64",
                          cursor: "pointer",
                          fontWeight: 600,
                        }}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  {activeBookingTab === "basic" && (
                    <div style={{ display: "grid", gridTemplateColumns: "140px 1fr 140px 1fr", gap: "12px", alignItems: "center" }}>
                      <label style={{ display: "contents" }}>
                        <div style={{ color: "#4a5b72", fontWeight: 600, marginBottom: "6px" }}>Booking #</div>
                        <input value={booking.booking_no} placeholder="Auto-generated after save" readOnly style={{ width: "100%", padding: "10px 12px", borderRadius: "12px", border: "1px solid #cbd5e1", background: "#f5f7fb" }} />
                      </label>
                      <label style={{ display: "contents" }}>
                        <div style={{ color: "#4a5b72", fontWeight: 600, marginBottom: "6px" }}>Approval #</div>
                        <input value={booking.approval_no} onChange={(e) => updateField("approval_no", e.target.value)} style={{ width: "100%", padding: "10px 12px", borderRadius: "12px", border: "1px solid #cbd5e1" }} />
                      </label>
                      <label style={{ display: "contents" }}>
                        <div style={{ color: "#4a5b72", fontWeight: 600, marginBottom: "6px" }}>Reference #</div>
                        <input value={booking.reference_no} onChange={(e) => updateField("reference_no", e.target.value)} style={{ width: "100%", padding: "10px 12px", borderRadius: "12px", border: "1px solid #cbd5e1" }} />
                      </label>
                      <label style={{ display: "contents" }}>
                        <div style={{ color: "#4a5b72", fontWeight: 600, marginBottom: "6px" }}>Booking Date</div>
                        <input type="date" value={booking.booking_date} onChange={(e) => updateField("booking_date", e.target.value)} style={{ width: "100%", padding: "10px 12px", borderRadius: "12px", border: "1px solid #cbd5e1" }} />
                      </label>

                      <label style={{ display: "contents" }}>
                        <div style={{ color: "#4a5b72", fontWeight: 600, marginBottom: "6px" }}>Carrier</div>
                        <select value={booking.carrier_id} onChange={(e) => updateField("carrier_id", e.target.value)} style={{ width: "100%", padding: "10px 12px", borderRadius: "12px", border: "1px solid #cbd5e1" }}>
                          <option value="">Select carrier</option>
                          {parties.filter((p) => partyTypes.find(pt => pt.id === p.party_type_id)?.party_code === "CARRIER").map((party) => (
                            <option key={party.id} value={party.id}>{party.party_name}</option>
                          ))}
                        </select>
                      </label>
                      <label style={{ display: "contents" }}>
                        <div style={{ color: "#4a5b72", fontWeight: 600, marginBottom: "6px" }}>Container Owner</div>
                        <select value={booking.container_owner_id} onChange={(e) => updateField("container_owner_id", e.target.value)} style={{ width: "100%", padding: "10px 12px", borderRadius: "12px", border: "1px solid #cbd5e1" }}>
                          <option value="">Select container owner</option>
                          {containerOwners.map((owner) => (
                            <option key={owner.id} value={owner.id}>{owner.owner_code} - {owner.description}</option>
                          ))}
                        </select>
                      </label>
                      <label style={{ display: "contents" }}>
                        <div style={{ color: "#4a5b72", fontWeight: 600, marginBottom: "6px" }}>Commodity</div>
                        <select value={booking.commodity_id} onChange={(e) => updateField("commodity_id", e.target.value)} style={{ width: "100%", padding: "10px 12px", borderRadius: "12px", border: "1px solid #cbd5e1" }}>
                          <option value="">Select commodity</option>
                          {commodities.map((commodity) => (
                            <option key={commodity.id} value={commodity.id}>{commodity.commodity_code} - {commodity.description}</option>
                          ))}
                        </select>
                      </label>
                      <label style={{ display: "contents" }}>
                        <div style={{ color: "#4a5b72", fontWeight: 600, marginBottom: "6px" }}>Freight Type</div>
                        <select value={booking.freight_type_id} onChange={(e) => updateField("freight_type_id", e.target.value)} style={{ width: "100%", padding: "10px 12px", borderRadius: "12px", border: "1px solid #cbd5e1" }}>
                          <option value="">Select freight type</option>
                          {freightTypes.map((type) => (
                            <option key={type.id} value={type.id}>{type.freight_code} - {type.description}</option>
                          ))}
                        </select>
                      </label>
                      <div style={{ display: "flex", alignItems: "flex-end", gap: "10px" }}>
                        <div style={{ width: "100%" }}>
                          <div style={{ color: "#4a5b72", fontWeight: 600, marginBottom: "6px" }}>DG Status</div>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 12px", borderRadius: "12px", border: "1px solid #cbd5e1", background: "#f8faff" }}>
                            <span>NON-DG</span>
                          </div>
                        </div>
                      </div>

                      <label style={{ display: "contents" }}>
                        <div style={{ color: "#4a5b72", fontWeight: 600, marginBottom: "6px" }}>POL</div>
                        <select value={booking.pol_id} onChange={(e) => updateField("pol_id", e.target.value)} style={{ width: "100%", padding: "10px 12px", borderRadius: "12px", border: "1px solid #cbd5e1" }}>
                          <option value="">Select POL</option>
                          {ports.map((port) => (
                            <option key={port.id} value={port.id}>{port.port_code} - {port.port_name}</option>
                          ))}
                        </select>
                      </label>
                      <label style={{ display: "contents" }}>
                        <div style={{ color: "#4a5b72", fontWeight: 600, marginBottom: "6px" }}>POD</div>
                        <select value={booking.pod_id} onChange={(e) => updateField("pod_id", e.target.value)} style={{ width: "100%", padding: "10px 12px", borderRadius: "12px", border: "1px solid #cbd5e1" }}>
                          <option value="">Select POD</option>
                          {ports.map((port) => (
                            <option key={port.id} value={port.id}>{port.port_code} - {port.port_name}</option>
                          ))}
                        </select>
                      </label>
                      <label style={{ display: "contents" }}>
                        <div style={{ color: "#4a5b72", fontWeight: 600, marginBottom: "6px" }}>POT (1)</div>
                        <input value={booking.pot1} onChange={(e) => updateField("pot1", e.target.value)} style={{ width: "100%", padding: "10px 12px", borderRadius: "12px", border: "1px solid #cbd5e1" }} />
                      </label>
                      <label style={{ display: "contents" }}>
                        <div style={{ color: "#4a5b72", fontWeight: 600, marginBottom: "6px" }}>POT (2)</div>
                        <input value={booking.pot2} onChange={(e) => updateField("pot2", e.target.value)} style={{ width: "100%", padding: "10px 12px", borderRadius: "12px", border: "1px solid #cbd5e1" }} />
                      </label>

                      <label style={{ display: "contents" }}>
                        <div style={{ color: "#4a5b72", fontWeight: 600, marginBottom: "6px" }}>Shipper / BP</div>
                        <select value={booking.shipper_id} onChange={(e) => updateField("shipper_id", e.target.value)} style={{ width: "100%", padding: "10px 12px", borderRadius: "12px", border: "1px solid #cbd5e1" }}>
                          <option value="">Select shipper</option>
                          {parties.filter((p) => partyTypes.find(pt => pt.id === p.party_type_id)?.party_code === "SHIPPER").map((party) => (
                            <option key={party.id} value={party.id}>{party.party_name}</option>
                          ))}
                        </select>
                      </label>
                      <fieldset style={{ border: "1px solid #cbd5e1", borderRadius: "12px", padding: "12px", gridColumn: "span 2" }}>
                        <legend style={{ padding: "0 8px", color: "#4a5b72", fontWeight: 600 }}>Act Shipper</legend>
                        <label style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <input type="checkbox" checked={booking.act_shipper} onChange={(e) => updateField("act_shipper", e.target.checked)} />
                          <span style={{ color: "#44516a" }}>Actual shipper</span>
                        </label>
                      </fieldset>

                      <label style={{ display: "contents" }}>
                        <div style={{ color: "#4a5b72", fontWeight: 600, marginBottom: "6px" }}>Consignee</div>
                        <select value={booking.consignee_id} onChange={(e) => updateField("consignee_id", e.target.value)} style={{ width: "100%", padding: "10px 12px", borderRadius: "12px", border: "1px solid #cbd5e1" }}>
                          <option value="">Select consignee</option>
                          {parties.filter((p) => partyTypes.find(pt => pt.id === p.party_type_id)?.party_code === "CONSIGNEE").map((party) => (
                            <option key={party.id} value={party.id}>{party.party_name}</option>
                          ))}
                        </select>
                      </label>
                      <label style={{ display: "contents" }}>
                        <div style={{ color: "#4a5b72", fontWeight: 600, marginBottom: "6px" }}>SRR</div>
                        <input value={booking.srr} onChange={(e) => updateField("srr", e.target.value)} style={{ width: "100%", padding: "10px 12px", borderRadius: "12px", border: "1px solid #cbd5e1" }} />
                      </label>
                      <label style={{ display: "contents" }}>
                        <div style={{ color: "#4a5b72", fontWeight: 600, marginBottom: "6px" }}>Services</div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                          <select value={booking.service1_id} onChange={(e) => updateField("service1_id", e.target.value)} style={{ width: "100%", padding: "10px 12px", borderRadius: "12px", border: "1px solid #cbd5e1" }}>
                            <option value="">Select service</option>
                            {services.map((service) => (
                              <option key={service.id} value={service.id}>{service.service_code} - {service.description}</option>
                            ))}
                          </select>
                          <select value={booking.service2_id} onChange={(e) => updateField("service2_id", e.target.value)} style={{ width: "100%", padding: "10px 12px", borderRadius: "12px", border: "1px solid #cbd5e1" }}>
                            <option value="">Select service</option>
                            {services.map((service) => (
                              <option key={service.id} value={service.id}>{service.service_code} - {service.description}</option>
                            ))}
                          </select>
                        </div>
                      </label>
                    </div>
                  )}

                  {activeBookingTab === "other" && (
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px" }}>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                        <label style={{ display: "contents" }}>
                          <div style={{ color: "#4a5b72", fontWeight: 600, marginBottom: "6px" }}>Special Req</div>
                          <input value={booking.special_requirements} onChange={(e) => updateField("special_requirements", e.target.value)} style={{ width: "100%", padding: "10px 12px", borderRadius: "12px", border: "1px solid #cbd5e1" }} />
                        </label>
                        <label style={{ display: "contents" }}>
                          <div style={{ color: "#4a5b72", fontWeight: 600, marginBottom: "6px" }}>Free Days POL</div>
                          <input type="number" value={booking.free_days_pol} onChange={(e) => updateField("free_days_pol", Number(e.target.value))} style={{ width: "100%", padding: "10px 12px", borderRadius: "12px", border: "1px solid #cbd5e1" }} />
                        </label>
                        <label style={{ display: "contents" }}>
                          <div style={{ color: "#4a5b72", fontWeight: 600, marginBottom: "6px" }}>Detention Free Days POFD</div>
                          <input type="number" value={booking.detention_free_days_pofd} onChange={(e) => updateField("detention_free_days_pofd", Number(e.target.value))} style={{ width: "100%", padding: "10px 12px", borderRadius: "12px", border: "1px solid #cbd5e1" }} />
                        </label>
                        <label style={{ display: "contents" }}>
                          <div style={{ color: "#4a5b72", fontWeight: 600, marginBottom: "6px" }}>Detention Currency</div>
                          <select value={booking.detention_currency_id} onChange={(e) => updateField("detention_currency_id", e.target.value)} style={{ width: "100%", padding: "10px 12px", borderRadius: "12px", border: "1px solid #cbd5e1" }}>
                            <option value="">Select currency</option>
                            {currencies.map((currency) => (
                              <option key={currency.id} value={currency.id}>{currency.currency_code} - {currency.currency_name}</option>
                            ))}
                          </select>
                        </label>
                        <label style={{ display: "contents" }}>
                          <div style={{ color: "#4a5b72", fontWeight: 600, marginBottom: "6px" }}>Cost Rate / Unit</div>
                          <input type="number" min="0" step="0.01" value={booking.cost_rate} onChange={(e) => updateField("cost_rate", Number(e.target.value))} style={{ width: "100%", padding: "10px 12px", borderRadius: "12px", border: "1px solid #cbd5e1" }} />
                        </label>
                        <label style={{ display: "contents" }}>
                          <div style={{ color: "#4a5b72", fontWeight: 600, marginBottom: "6px" }}>Revenue Rate / Unit</div>
                          <input type="number" min="0" step="0.01" value={booking.revenue_rate} onChange={(e) => updateField("revenue_rate", Number(e.target.value))} style={{ width: "100%", padding: "10px 12px", borderRadius: "12px", border: "1px solid #cbd5e1" }} />
                        </label>
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                        <label style={{ display: "contents" }}>
                          <div style={{ color: "#4a5b72", fontWeight: 600, marginBottom: "6px" }}>Slot Operator (T1)</div>
                          <select value={booking.slot_operator_t1_id} onChange={(e) => updateField("slot_operator_t1_id", e.target.value)} style={{ width: "100%", padding: "10px 12px", borderRadius: "12px", border: "1px solid #cbd5e1" }}>
                            <option value="">Select party</option>
                            {parties.map((party) => (<option key={party.id} value={party.id}>{party.party_name}</option>))}
                          </select>
                        </label>
                        <label style={{ display: "contents" }}>
                          <div style={{ color: "#4a5b72", fontWeight: 600, marginBottom: "6px" }}>Slot Operator (T2)</div>
                          <select value={booking.slot_operator_t2_id} onChange={(e) => updateField("slot_operator_t2_id", e.target.value)} style={{ width: "100%", padding: "10px 12px", borderRadius: "12px", border: "1px solid #cbd5e1" }}>
                            <option value="">Select party</option>
                            {parties.map((party) => (<option key={party.id} value={party.id}>{party.party_name}</option>))}
                          </select>
                        </label>
                        <label style={{ display: "contents" }}>
                          <div style={{ color: "#4a5b72", fontWeight: 600, marginBottom: "6px" }}>C/C Agent</div>
                          <select value={booking.cc_agent_id} onChange={(e) => updateField("cc_agent_id", e.target.value)} style={{ width: "100%", padding: "10px 12px", borderRadius: "12px", border: "1px solid #cbd5e1" }}>
                            <option value="">Select agent</option>
                            {parties.filter((p) => partyTypes.find(pt => pt.id === p.party_type_id)?.party_code === "AGENT").map((party) => (<option key={party.id} value={party.id}>{party.party_name}</option>))}
                          </select>
                        </label>
                        <label style={{ display: "contents" }}>
                          <div style={{ color: "#4a5b72", fontWeight: 600, marginBottom: "6px" }}>Approval Status</div>
                          <select value={booking.approval_status_id} onChange={(e) => updateField("approval_status_id", e.target.value)} style={{ width: "100%", padding: "10px 12px", borderRadius: "12px", border: "1px solid #cbd5e1" }}>
                            <option value="">Select status</option>
                            {approvalStatuses.map((status) => (
                              <option key={status.id} value={status.id}>{status.status_code} - {status.description}</option>
                            ))}
                          </select>
                        </label>
                      </div>
                    </div>
                  )}

                  {activeBookingTab === "messages" && (
                    <div style={{ display: "grid", gap: "16px" }}>
                      <label style={{ display: "contents" }}>
                        <div style={{ color: "#4a5b72", fontWeight: 600, marginBottom: "6px" }}>NOC Note</div>
                        <textarea value={booking.noc} onChange={(e) => updateField("noc", e.target.value)} rows={3} style={{ width: "100%", padding: "12px", borderRadius: "12px", border: "1px solid #cbd5e1" }} />
                      </label>
                      <label style={{ display: "contents" }}>
                        <div style={{ color: "#4a5b72", fontWeight: 600, marginBottom: "6px" }}>CRO Instruction</div>
                        <textarea value={booking.cro_instruction} onChange={(e) => updateField("cro_instruction", e.target.value)} rows={3} style={{ width: "100%", padding: "12px", borderRadius: "12px", border: "1px solid #cbd5e1" }} />
                      </label>
                      <label style={{ display: "contents" }}>
                        <div style={{ color: "#4a5b72", fontWeight: 600, marginBottom: "6px" }}>Container Info</div>
                        <textarea value={booking.container_info} onChange={(e) => updateField("container_info", e.target.value)} rows={3} style={{ width: "100%", padding: "12px", borderRadius: "12px", border: "1px solid #cbd5e1" }} />
                      </label>
                    </div>
                  )}
                </div>

                <div style={{ flex: 1, minWidth: "320px", background: "#f8faff", borderRadius: "18px", padding: "20px", border: "1px solid #dbe5ef" }}>
                  <div style={{ display: "grid", gap: "14px" }}>
                    <div style={{ display: "grid", gap: "10px" }}>
                      <div style={{ color: "#455a78", fontWeight: 700 }}>Vessel / Voyage</div>
                      <select value={booking.agent_pol_id} onChange={(e) => updateField("agent_pol_id", e.target.value)} style={{ width: "100%", padding: "10px 12px", borderRadius: "12px", border: "1px solid #cbd5e1" }}>
                        <option value="">Select vessel</option>
                        {vessels.map((v) => (<option key={v.id} value={v.id}>{v.vessel_name} / {v.voyage}</option>))}
                      </select>
                    </div>
                    <div style={{ display: "grid", gap: "10px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", color: "#4a5b72", fontWeight: 600 }}>
                        <span>EGM #</span>
                        <span style={{ color: "#7a8a9e" }}> </span>
                      </div>
                      <input value={booking.egm} onChange={(e) => updateField("egm", e.target.value)} style={{ width: "100%", padding: "10px 12px", borderRadius: "12px", border: "1px solid #cbd5e1" }} />
                    </div>
                    <div style={{ display: "grid", gap: "10px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", color: "#4a5b72", fontWeight: 600 }}>
                        <span>Berth #</span>
                        <span style={{ color: "#7a8a9e" }}> </span>
                      </div>
                      <input value={booking.berth} onChange={(e) => updateField("berth", e.target.value)} style={{ width: "100%", padding: "10px 12px", borderRadius: "12px", border: "1px solid #cbd5e1" }} />
                    </div>
                    <div style={{ display: "grid", gap: "10px" }}>
                      <label style={{ display: "contents" }}>
                        <div style={{ color: "#4a5b72", fontWeight: 600, marginBottom: "6px" }}>WHARF</div>
                        <input value={booking.wharf} onChange={(e) => updateField("wharf", e.target.value)} style={{ width: "100%", padding: "10px 12px", borderRadius: "12px", border: "1px solid #cbd5e1" }} />
                      </label>
                    </div>
                    <div style={{ display: "grid", gap: "10px" }}>
                      <label style={{ display: "contents" }}>
                        <div style={{ color: "#4a5b72", fontWeight: 600, marginBottom: "6px" }}>VIA Port</div>
                        <input value={booking.via_port} onChange={(e) => updateField("via_port", e.target.value)} style={{ width: "100%", padding: "10px 12px", borderRadius: "12px", border: "1px solid #cbd5e1" }} />
                      </label>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                      <label style={{ display: "contents" }}>
                        <div style={{ color: "#4a5b72", fontWeight: 600, marginBottom: "6px" }}>Temperature</div>
                        <input value={booking.temperature} onChange={(e) => updateField("temperature", e.target.value)} style={{ width: "100%", padding: "10px 12px", borderRadius: "12px", border: "1px solid #cbd5e1" }} />
                      </label>
                      <label style={{ display: "contents" }}>
                        <div style={{ color: "#4a5b72", fontWeight: 600, marginBottom: "6px" }}>Vent</div>
                        <input value={booking.vent} onChange={(e) => updateField("vent", e.target.value)} style={{ width: "100%", padding: "10px 12px", borderRadius: "12px", border: "1px solid #cbd5e1" }} />
                      </label>
                    </div>
                    <div style={{ display: "grid", gap: "10px" }}>
                      <label style={{ display: "contents" }}>
                        <div style={{ color: "#4a5b72", fontWeight: 600, marginBottom: "6px" }}>NOC Note</div>
                        <textarea value={booking.noc} onChange={(e) => updateField("noc", e.target.value)} rows={3} style={{ width: "100%", padding: "10px 12px", borderRadius: "12px", border: "1px solid #cbd5e1" }} />
                      </label>
                    </div>
                    <div style={{ display: "grid", gap: "10px" }}>
                      <label style={{ display: "contents" }}>
                        <div style={{ color: "#4a5b72", fontWeight: 600, marginBottom: "6px" }}>CRO Instruction</div>
                        <textarea value={booking.cro_instruction} onChange={(e) => updateField("cro_instruction", e.target.value)} rows={3} style={{ width: "100%", padding: "10px 12px", borderRadius: "12px", border: "1px solid #cbd5e1" }} />
                      </label>
                    </div>
                    <div style={{ display: "grid", gap: "10px" }}>
                      <label style={{ display: "contents" }}>
                        <div style={{ color: "#4a5b72", fontWeight: 600, marginBottom: "6px" }}>Container Info</div>
                        <textarea value={booking.container_info} onChange={(e) => updateField("container_info", e.target.value)} rows={3} style={{ width: "100%", padding: "10px 12px", borderRadius: "12px", border: "1px solid #cbd5e1" }} />
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: "24px", background: "#f8faff", padding: "20px", borderRadius: "18px", border: "1px solid #dbe5ef" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
                  <h3 style={{ margin: 0, color: "#0f4a86" }}>Equipment</h3>
                  <button type="button" onClick={addItem} style={{ padding: "10px 16px", borderRadius: "12px", background: "#0f4a86", color: "white", border: "none", cursor: "pointer" }}>
                    + Add Row
                  </button>
                </div>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ background: "#eef4ff" }}>
                        {["Container Type", "Quantity", "Gross Weight", "Packages", "Unit", "Cargo Volume", "Comments", "Actions"].map((header) => (
                          <th key={header} style={{ padding: "12px 10px", textAlign: "left", borderBottom: "1px solid #d8e3ee", color: "#364b66" }}>{header}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((item, index) => (
                        <tr key={index} style={{ borderBottom: "1px solid #e7edf5" }}>
                          <td style={{ padding: "10px" }}>
                            <select value={item.container_type_id} onChange={(e) => updateItem(index, "container_type_id", e.target.value)} style={{ width: "100%", padding: "8px 10px", borderRadius: "10px", border: "1px solid #cbd5e1" }}>
                              <option value="">Select type</option>
                              {containerTypes.map((type) => (
                                <option key={type.id} value={type.id}>{type.container_code} - {type.description}</option>
                              ))}
                            </select>
                          </td>
                          <td style={{ padding: "10px", width: "100px" }}><input type="number" value={item.quantity} onChange={(e) => updateItem(index, "quantity", Number(e.target.value))} style={{ width: "100%", padding: "8px 10px", borderRadius: "10px", border: "1px solid #cbd5e1" }} /></td>
                          <td style={{ padding: "10px" }}><input value={item.gross_weight} onChange={(e) => updateItem(index, "gross_weight", e.target.value)} style={{ width: "100%", padding: "8px 10px", borderRadius: "10px", border: "1px solid #cbd5e1" }} /></td>
                          <td style={{ padding: "10px" }}><input value={item.packages} onChange={(e) => updateItem(index, "packages", e.target.value)} style={{ width: "100%", padding: "8px 10px", borderRadius: "10px", border: "1px solid #cbd5e1" }} /></td>
                          <td style={{ padding: "10px" }}><input value={item.unit} onChange={(e) => updateItem(index, "unit", e.target.value)} style={{ width: "100%", padding: "8px 10px", borderRadius: "10px", border: "1px solid #cbd5e1" }} /></td>
                          <td style={{ padding: "10px" }}><input value={item.cargo_volume} onChange={(e) => updateItem(index, "cargo_volume", e.target.value)} style={{ width: "100%", padding: "8px 10px", borderRadius: "10px", border: "1px solid #cbd5e1" }} /></td>
                          <td style={{ padding: "10px" }}><input value={item.comments} onChange={(e) => updateItem(index, "comments", e.target.value)} style={{ width: "100%", padding: "8px 10px", borderRadius: "10px", border: "1px solid #cbd5e1" }} /></td>
                          <td style={{ padding: "10px" }}>
                            <button type="button" onClick={() => removeItem(index)} style={{ padding: "8px 12px", borderRadius: "10px", background: "#fee2e2", color: "#991b1b", border: "none", cursor: "pointer" }}>
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div style={{ marginTop: "18px", display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "14px" }}>
                {[
                  { label: "Total Cost", value: totals.totalCost.toFixed(2) },
                  { label: "Total Revenue", value: totals.totalRevenue.toFixed(2) },
                  { label: "Net Amount", value: totals.netAmount.toFixed(2) },
                ].map((summary) => (
                  <div key={summary.label} style={{ background: "#f5f8fd", borderRadius: "16px", padding: "18px 16px", border: "1px solid #d8e3ee" }}>
                    <div style={{ color: "#65758f", fontSize: "0.88rem", marginBottom: "6px" }}>{summary.label}</div>
                    <div style={{ color: "#0f4a86", fontSize: "1.1rem", fontWeight: 700 }}>{summary.value}</div>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: "18px" }}>
                <label style={{ display: "block", color: "#4a5b72", fontWeight: 600, marginBottom: "8px" }}>Remarks</label>
                <textarea value={booking.remarks} onChange={(e) => updateField("remarks", e.target.value)} rows={4} style={{ width: "100%", padding: "14px", borderRadius: "16px", border: "1px solid #cbd5e1" }} />
              </div>

              <div style={{ marginTop: "26px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                  <h3 style={{ margin: 0, color: "#0f4a86" }}>Recent Bookings</h3>
                  <span style={{ color: "#576475" }}>{bookings.length} saved bookings</span>
                </div>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ background: "#eef4ff" }}>
                        {[
                          "Booking #",
                          "Status",
                          "Shipper",
                          "Consignee",
                          "Booking Date",
                          "Sailing Date",
                          "Revenue",
                        ].map((heading) => (
                          <th key={heading} style={{ padding: "12px 10px", textAlign: "left", color: "#364b66", borderBottom: "1px solid #d8e3ee" }}>
                            {heading}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {bookings.slice(0, 10).map((record) => (
                        <tr key={record.id} style={{ borderBottom: "1px solid #e7edf5" }}>
                          <td style={{ padding: "12px 10px" }}>{record.booking_no}</td>
                          <td style={{ padding: "12px 10px" }}>{record.approval_status}</td>
                          <td style={{ padding: "12px 10px" }}>{getPartyName(record.shipper_id)}</td>
                          <td style={{ padding: "12px 10px" }}>{getPartyName(record.consignee_id)}</td>
                          <td style={{ padding: "12px 10px" }}>{record.booking_date}</td>
                          <td style={{ padding: "12px 10px" }}>{record.sailing_date}</td>
                          <td style={{ padding: "12px 10px" }}>{Number(record.total_revenue || 0).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {message && <div style={{ marginTop: "18px", color: message.startsWith("Error") ? "#a00" : "#0a6b29", fontWeight: 600 }}>{message}</div>}
            </section>
          )}

          {activeView === "common-parties" && (
            <section style={{ background: "white", borderRadius: "18px", boxShadow: "0 20px 40px rgba(15, 75, 129, 0.08)", padding: "24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "22px" }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: "1.6rem", color: "#0f4a86" }}>Common Parties</h2>
                  <p style={{ margin: "8px 0 0", color: "#576475" }}>Manage shippers, consignees, agents, and carriers.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPartyForm(!showPartyForm)}
                  style={{ padding: "12px 18px", borderRadius: "14px", background: "#0f4a86", color: "white", border: "none", cursor: "pointer" }}
                >
                  + Add Party
                </button>
              </div>

              {showPartyForm && (
                <div style={{ background: "#f8fbff", borderRadius: "16px", padding: "20px", marginBottom: "24px", border: "1px solid #d9e6f4" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                    <input
                      placeholder="Name"
                      value={newParty.party_name}
                      onChange={(e) => setNewParty({ ...newParty, party_name: e.target.value })}
                      style={{ padding: "12px", borderRadius: "12px", border: "1px solid #cbd5e1" }}
                    />
                    <select
                      value={newParty.party_type_id}
                      onChange={(e) => setNewParty({ ...newParty, party_type_id: e.target.value })}
                      style={{ padding: "12px", borderRadius: "12px", border: "1px solid #cbd5e1" }}
                    >
                      <option value="">Select type</option>
                      {partyTypes.map((pt) => (
                        <option key={pt.id} value={pt.id}>{pt.description}</option>
                      ))}
                    </select>
                    <input
                      placeholder="Contact"
                      value={newParty.contact_person}
                      onChange={(e) => setNewParty({ ...newParty, contact_person: e.target.value })}
                      style={{ padding: "12px", borderRadius: "12px", border: "1px solid #cbd5e1" }}
                    />
                    <input
                      placeholder="Email"
                      value={newParty.email}
                      onChange={(e) => setNewParty({ ...newParty, email: e.target.value })}
                      style={{ padding: "12px", borderRadius: "12px", border: "1px solid #cbd5e1" }}
                    />
                    <input
                      placeholder="Address"
                      value={newParty.address}
                      onChange={(e) => setNewParty({ ...newParty, address: e.target.value })}
                      style={{ padding: "12px", borderRadius: "12px", border: "1px solid #cbd5e1", gridColumn: "span 2" }}
                    />
                  </div>
                  <div style={{ display: "flex", gap: "12px" }}>
                    <button
                      type="button"
                      onClick={addParty}
                      disabled={loading}
                      style={{ padding: "12px 20px", borderRadius: "12px", background: "#0f4a86", color: "white", border: "none", cursor: "pointer" }}
                    >
                      Save Party
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowPartyForm(false)}
                      style={{ padding: "12px 20px", borderRadius: "12px", background: "#f5f5f5", border: "none", cursor: "pointer" }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ background: "#eef4ff" }}>
                      {["Name", "Type", "Contact", "Email", "Address", "Actions"].map((h) => (
                        <th key={h} style={{ padding: "12px 10px", textAlign: "left", color: "#364b66", borderBottom: "1px solid #d8e3ee" }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {parties.map((party) => (
                      <tr key={party.id} style={{ borderBottom: "1px solid #e7edf5" }}>
                        <td style={{ padding: "12px 10px" }}>{party.party_name}</td>
                        <td style={{ padding: "12px 10px" }}>{partyTypes.find(pt => pt.id === party.party_type_id)?.description || party.party_type_id}</td>
                        <td style={{ padding: "12px 10px" }}>{party.contact_person}</td>
                        <td style={{ padding: "12px 10px" }}>{party.email}</td>
                        <td style={{ padding: "12px 10px" }}>{party.address}</td>
                        <td style={{ padding: "12px 10px" }}>
                          <button
                            type="button"
                            onClick={() => deleteParty(party.id)}
                            style={{ padding: "6px 12px", background: "#fee2e2", color: "#991b1b", border: "none", borderRadius: "8px", cursor: "pointer" }}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {message && <div style={{ marginTop: "18px", color: message.startsWith("Error") ? "#a00" : "#0a6b29", fontWeight: 600 }}>{message}</div>}
            </section>
          )}

          {activeView === "vessel" && (
            <section style={{ background: "white", borderRadius: "18px", boxShadow: "0 20px 40px rgba(15, 75, 129, 0.08)", padding: "24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "22px" }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: "1.6rem", color: "#0f4a86" }}>Vessels</h2>
                  <p style={{ margin: "8px 0 0", color: "#576475" }}>Add and manage vessel details.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowVesselForm(!showVesselForm)}
                  style={{ padding: "12px 18px", borderRadius: "14px", background: "#0f4a86", color: "white", border: "none", cursor: "pointer" }}
                >
                  + Add Vessel
                </button>
              </div>

              {showVesselForm && (
                <div style={{ background: "#f8fbff", borderRadius: "16px", padding: "20px", marginBottom: "24px", border: "1px solid #d9e6f4" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                    <input
                      placeholder="Vessel Name"
                      value={newVessel.vessel_name}
                      onChange={(e) => setNewVessel({ ...newVessel, vessel_name: e.target.value })}
                      style={{ padding: "12px", borderRadius: "12px", border: "1px solid #cbd5e1" }}
                    />
                    <input
                      placeholder="IMO Number"
                      value={newVessel.imo_no}
                      onChange={(e) => setNewVessel({ ...newVessel, imo_no: e.target.value })}
                      style={{ padding: "12px", borderRadius: "12px", border: "1px solid #cbd5e1" }}
                    />
                    <input
                      placeholder="Voyage"
                      value={newVessel.voyage}
                      onChange={(e) => setNewVessel({ ...newVessel, voyage: e.target.value })}
                      style={{ padding: "12px", borderRadius: "12px", border: "1px solid #cbd5e1" }}
                    />
                    <input
                      type="number"
                      placeholder="TEU Capacity"
                      value={newVessel.capacity_teu}
                      onChange={(e) => setNewVessel({ ...newVessel, capacity_teu: Number(e.target.value) })}
                      style={{ padding: "12px", borderRadius: "12px", border: "1px solid #cbd5e1" }}
                    />
                    <input
                      placeholder="Flag"
                      value={newVessel.flag}
                      onChange={(e) => setNewVessel({ ...newVessel, flag: e.target.value })}
                      style={{ padding: "12px", borderRadius: "12px", border: "1px solid #cbd5e1", gridColumn: "span 2" }}
                    />
                  </div>
                  <div style={{ display: "flex", gap: "12px" }}>
                    <button
                      type="button"
                      onClick={addVessel}
                      disabled={loading}
                      style={{ padding: "12px 20px", borderRadius: "12px", background: "#0f4a86", color: "white", border: "none", cursor: "pointer" }}
                    >
                      Save Vessel
                    </button>
                    <button type="button" onClick={() => setShowVesselForm(false)} style={{ padding: "12px 20px", borderRadius: "12px", background: "#f5f5f5", border: "none", cursor: "pointer" }}>
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ background: "#eef4ff" }}>
                      {["Name", "IMO", "Voyage", "TEU", "Flag", "Actions"].map((h) => (
                        <th key={h} style={{ padding: "12px 10px", textAlign: "left", color: "#364b66", borderBottom: "1px solid #d8e3ee" }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {vessels.map((vessel) => (
                      <tr key={vessel.id} style={{ borderBottom: "1px solid #e7edf5" }}>
                        <td style={{ padding: "12px 10px" }}>{vessel.vessel_name}</td>
                        <td style={{ padding: "12px 10px" }}>{vessel.imo_no}</td>
                        <td style={{ padding: "12px 10px" }}>{vessel.voyage}</td>
                        <td style={{ padding: "12px 10px" }}>{vessel.capacity_teu}</td>
                        <td style={{ padding: "12px 10px" }}>{vessel.flag}</td>
                        <td style={{ padding: "12px 10px" }}>
                          <button
                            type="button"
                            onClick={() => deleteVessel(vessel.id)}
                            style={{ padding: "6px 12px", background: "#fee2e2", color: "#991b1b", border: "none", borderRadius: "8px", cursor: "pointer" }}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {message && <div style={{ marginTop: "18px", color: message.startsWith("Error") ? "#a00" : "#0a6b29", fontWeight: 600 }}>{message}</div>}
            </section>
          )}

          {activeView === "commodity" && (
            <section style={{ background: "white", borderRadius: "18px", boxShadow: "0 20px 40px rgba(15, 75, 129, 0.08)", padding: "24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "22px" }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: "1.6rem", color: "#0f4a86" }}>Commodities</h2>
                  <p style={{ margin: "8px 0 0", color: "#576475" }}>Manage cargo types and classifications.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowCommodityForm(!showCommodityForm)}
                  style={{ padding: "12px 18px", borderRadius: "14px", background: "#0f4a86", color: "white", border: "none", cursor: "pointer" }}
                >
                  + Add Commodity
                </button>
              </div>

              {showCommodityForm && (
                <div style={{ background: "#f8fbff", borderRadius: "16px", padding: "20px", marginBottom: "24px", border: "1px solid #d9e6f4" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                    <input
                      placeholder="Commodity Code"
                      value={newCommodity.commodity_code}
                      onChange={(e) => setNewCommodity({ ...newCommodity, commodity_code: e.target.value })}
                      style={{ padding: "12px", borderRadius: "12px", border: "1px solid #cbd5e1" }}
                    />
                    <input
                      placeholder="HS Code"
                      value={newCommodity.hs_code}
                      onChange={(e) => setNewCommodity({ ...newCommodity, hs_code: e.target.value })}
                      style={{ padding: "12px", borderRadius: "12px", border: "1px solid #cbd5e1" }}
                    />
                    <input
                      placeholder="Description"
                      value={newCommodity.description}
                      onChange={(e) => setNewCommodity({ ...newCommodity, description: e.target.value })}
                      style={{ padding: "12px", borderRadius: "12px", border: "1px solid #cbd5e1", gridColumn: "span 2" }}
                    />
                  </div>
                  <div style={{ display: "flex", gap: "12px" }}>
                    <button
                      type="button"
                      onClick={addCommodity}
                      disabled={loading}
                      style={{ padding: "12px 20px", borderRadius: "12px", background: "#0f4a86", color: "white", border: "none", cursor: "pointer" }}
                    >
                      Save Commodity
                    </button>
                    <button type="button" onClick={() => setShowCommodityForm(false)} style={{ padding: "12px 20px", borderRadius: "12px", background: "#f5f5f5", border: "none", cursor: "pointer" }}>
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ background: "#eef4ff" }}>
                      {["Code", "HS Code", "Description", "Actions"].map((h) => (
                        <th key={h} style={{ padding: "12px 10px", textAlign: "left", color: "#364b66", borderBottom: "1px solid #d8e3ee" }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {commodities.map((commodity) => (
                      <tr key={commodity.id} style={{ borderBottom: "1px solid #e7edf5" }}>
                        <td style={{ padding: "12px 10px" }}>{commodity.commodity_code}</td>
                        <td style={{ padding: "12px 10px" }}>{commodity.hs_code}</td>
                        <td style={{ padding: "12px 10px" }}>{commodity.description}</td>
                        <td style={{ padding: "12px 10px" }}>
                          <button
                            type="button"
                            onClick={() => deleteCommodity(commodity.id)}
                            style={{ padding: "6px 12px", background: "#fee2e2", color: "#991b1b", border: "none", borderRadius: "8px", cursor: "pointer" }}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {message && <div style={{ marginTop: "18px", color: message.startsWith("Error") ? "#a00" : "#0a6b29", fontWeight: 600 }}>{message}</div>}
            </section>
          )}

          {activeView === "ports" && (
            <section style={{ background: "white", borderRadius: "18px", boxShadow: "0 20px 40px rgba(15, 75, 129, 0.08)", padding: "24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "22px" }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: "1.6rem", color: "#0f4a86" }}>Ports</h2>
                  <p style={{ margin: "8px 0 0", color: "#576475" }}>Manage port entries used by POL and POD fields.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPortForm(!showPortForm)}
                  style={{ padding: "12px 18px", borderRadius: "14px", background: "#0f4a86", color: "white", border: "none", cursor: "pointer" }}
                >
                  + Add Port
                </button>
              </div>

              {showPortForm && (
                <div style={{ background: "#f8fbff", borderRadius: "16px", padding: "20px", marginBottom: "24px", border: "1px solid #d9e6f4" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                    <input
                      placeholder="Port Code"
                      value={newPort.port_code}
                      onChange={(e) => setNewPort({ ...newPort, port_code: e.target.value })}
                      style={{ padding: "12px", borderRadius: "12px", border: "1px solid #cbd5e1" }}
                    />
                    <input
                      placeholder="Port Name"
                      value={newPort.port_name}
                      onChange={(e) => setNewPort({ ...newPort, port_name: e.target.value })}
                      style={{ padding: "12px", borderRadius: "12px", border: "1px solid #cbd5e1" }}
                    />
                    <input
                      placeholder="Country"
                      value={newPort.country}
                      onChange={(e) => setNewPort({ ...newPort, country: e.target.value })}
                      style={{ padding: "12px", borderRadius: "12px", border: "1px solid #cbd5e1" }}
                    />
                    <input
                      placeholder="City"
                      value={newPort.city}
                      onChange={(e) => setNewPort({ ...newPort, city: e.target.value })}
                      style={{ padding: "12px", borderRadius: "12px", border: "1px solid #cbd5e1" }}
                    />
                    <input
                      placeholder="Timezone"
                      value={newPort.timezone}
                      onChange={(e) => setNewPort({ ...newPort, timezone: e.target.value })}
                      style={{ padding: "12px", borderRadius: "12px", border: "1px solid #cbd5e1", gridColumn: "span 2" }}
                    />
                  </div>
                  <div style={{ display: "flex", gap: "12px" }}>
                    <button
                      type="button"
                      onClick={addPort}
                      disabled={loading}
                      style={{ padding: "12px 20px", borderRadius: "12px", background: "#0f4a86", color: "white", border: "none", cursor: "pointer" }}
                    >
                      Save Port
                    </button>
                    <button type="button" onClick={() => setShowPortForm(false)} style={{ padding: "12px 20px", borderRadius: "12px", background: "#f5f5f5", border: "none", cursor: "pointer" }}>
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ background: "#eef4ff" }}>
                      {[
                        "Port Code",
                        "Port Name",
                        "Country",
                        "City",
                        "Timezone",
                        "Actions",
                      ].map((h) => (
                        <th key={h} style={{ padding: "12px 10px", textAlign: "left", color: "#364b66", borderBottom: "1px solid #d8e3ee" }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {ports.map((port) => (
                      <tr key={port.id} style={{ borderBottom: "1px solid #e7edf5" }}>
                        <td style={{ padding: "12px 10px" }}>{port.port_code}</td>
                        <td style={{ padding: "12px 10px" }}>{port.port_name}</td>
                        <td style={{ padding: "12px 10px" }}>{port.country}</td>
                        <td style={{ padding: "12px 10px" }}>{port.city}</td>
                        <td style={{ padding: "12px 10px" }}>{port.timezone}</td>
                        <td style={{ padding: "12px 10px" }}>
                          <button
                            type="button"
                            onClick={() => deletePort(port.id)}
                            style={{ padding: "6px 12px", background: "#fee2e2", color: "#991b1b", border: "none", borderRadius: "8px", cursor: "pointer" }}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {message && <div style={{ marginTop: "18px", color: message.startsWith("Error") ? "#a00" : "#0a6b29", fontWeight: 600 }}>{message}</div>}
            </section>
          )}
          </>
        )}
        </main>
      </div>
    </div>
  );
}
