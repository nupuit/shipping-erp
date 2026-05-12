"use client";

import { supabase } from "@/lib/supabase";
import { useState } from "react";

export default function Home() {

  const [bookingNo, setBookingNo] = useState("");
  const [refNo, setRefNo] = useState("");
  const [pol, setPol] = useState("");
  const [pod, setPod] = useState("");

  async function saveBooking() {
    const { error } = await supabase.from("bookings").insert([
      {
        booking_no: bookingNo,
        ref_no: refNo,
        pol: pol,
        pod: pod
      }
    ]);

    if (error) {
      console.error(error);
      alert("Error ❌");
    } else {
      alert("Saved ✅");

      setBookingNo("");
      setRefNo("");
      setPol("");
      setPod("");
    }
  }

  return (
    <div style={{ fontFamily: "Arial" }}>

      {/* HEADER */}
      <div style={{ background: "#8fa9c9", padding: "10px", color: "white" }}>
        <b>SHIPPING ERP</b>
      </div>

      <div style={{ display: "flex" }}>

        {/* SIDEBAR */}
        <div style={{
          width: "250px",
          background: "#dbe4f0",
          height: "100vh",
          padding: "10px"
        }}>
          <h4>Agent Tasks</h4>
          <p>Booking</p>
          <p>B/L</p>
          <p>Container Activity</p>
          <p>CRT</p>
        </div>

        {/* MAIN */}
        <div style={{ flex: 1, padding: "20px" }}>
          <h2>Booking</h2>

          <input
            value={bookingNo}
            onChange={(e) => setBookingNo(e.target.value)}
            placeholder="Booking No"
          /><br /><br />

          <input
            value={refNo}
            onChange={(e) => setRefNo(e.target.value)}
            placeholder="Reference No"
          /><br /><br />

          <input
            value={pol}
            onChange={(e) => setPol(e.target.value)}
            placeholder="POL"
          /><br /><br />

          <input
            value={pod}
            onChange={(e) => setPod(e.target.value)}
            placeholder="POD"
          /><br /><br />

          <button onClick={saveBooking}>
            Save Booking
          </button>

        </div>

      </div>
    </div>
  );
}
``