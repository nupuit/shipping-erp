import { supabase } from "../lib/supabase";
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
    
      Booking

       setBookingNo(e.target.value)} />
       setRefNo(e.target.value)} />
       setPol(e.target.value)} />
       setPod(e.target.value)} />

      Save
    
  );
}