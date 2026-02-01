import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function AccommodationBooking() {
  const navigate = useNavigate();
  const [accommodations, setAccommodations] = useState([]);
  const [selectedAcc, setSelectedAcc] = useState(null);
  
  // Clean state for dates
  const [dates, setDates] = useState({
    checkIn: "",
    checkOut: ""
  });

  useEffect(() => {
    fetchAccommodations();
  }, []);

  async function fetchAccommodations() {
    try {
      // Endpoint updated to match backend convention (singular usually)
      const res = await fetch("http://localhost:5000/api/accommodation");
      const data = await res.json();

      if (data.success) {
        setAccommodations(data.data || data.accommodations || []);
      }
    } catch (err) {
      console.error("Error fetching accommodations:", err);
    }
  }

  async function handleProceedToPayment() {
    const token = localStorage.getItem("token");
    if (!token) return alert("Please login first");

    if (!selectedAcc || !dates.checkIn || !dates.checkOut) {
      return alert("Please select accommodation and check-in/check-out dates");
    }

    try {
      // 1️⃣ Create the initial booking (Status: PENDING)
      const res = await fetch("http://localhost:5000/api/accommodation/book", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          accommodation_id: selectedAcc.id,
          check_in_date: dates.checkIn,
          check_out_date: dates.checkOut,
        }),
      });

      const json = await res.json();

      if (!json.success) {
        alert(json.message || "Booking failed");
        return;
      }

      // 2️⃣ Calculate Total Amount based on Days selected
      const start = new Date(dates.checkIn);
      const end = new Date(dates.checkOut);
      const diffTime = Math.abs(end - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
      
      // Ensure at least 1 day charge
      const totalDays = diffDays > 0 ? diffDays : 1; 
      const totalAmount = totalDays * selectedAcc.price_per_day;

      // 3️⃣ Redirect to Payment Page
      navigate("/payment", {
        state: {
          module: "ACCOMMODATION",
          booking_id: json.booking.id, // ID returned from backend
          amount: totalAmount,
          // Payload to re-confirm booking details if needed
          bookingPayload: {
             accommodation_id: selectedAcc.id,
             check_in_date: dates.checkIn,
             check_out_date: dates.checkOut
          }
        },
      });

    } catch (err) {
      console.error(err);
      alert("Network error processing booking");
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <h1 className="text-3xl font-bold mb-6">Book Accommodation</h1>

      {/* ACCOMMODATION LIST */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        {accommodations.map((acc) => (
          <div
            key={acc.id}
            onClick={() => setSelectedAcc(acc)}
            className={`p-6 rounded-xl border cursor-pointer transition-all
              ${selectedAcc?.id === acc.id
                ? "border-green-500 bg-slate-800 shadow-lg shadow-green-900/20"
                : "border-slate-700 bg-slate-800 hover:border-slate-500"}
            `}
          >
            <h2 className="text-xl font-bold text-white">{acc.name}</h2>
            <p className="text-gray-400 capitalize text-sm mb-2">{acc.type}</p>
            <p className="text-green-400 font-bold text-lg">
              ₹{acc.price_per_day} <span className="text-sm text-gray-500 font-normal">/ night</span>
            </p>
            {acc.availability_status && (
               <span className="inline-block mt-3 text-xs bg-slate-700 px-2 py-1 rounded text-slate-300">
                 {acc.availability_status}
               </span>
            )}
          </div>
        ))}
      </div>

      {/* DATE SELECTION & CONFIRMATION */}
      {selectedAcc && (
        <div className="bg-slate-800 p-8 rounded-xl border border-slate-700 max-w-md shadow-xl">
          <h3 className="text-xl font-bold mb-6 text-white border-b border-slate-700 pb-4">
            Confirm Stay at <span className="text-green-400">{selectedAcc.name}</span>
          </h3>

          <div className="space-y-4 mb-8">
            <div>
              <label className="block text-gray-400 mb-2 text-sm font-medium">Check-in Date</label>
              <input
                type="date"
                className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-green-500 outline-none"
                onChange={(e) =>
                  setDates({ ...dates, checkIn: e.target.value })
                }
              />
            </div>

            <div>
              <label className="block text-gray-400 mb-2 text-sm font-medium">Check-out Date</label>
              <input
                type="date"
                className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-green-500 outline-none"
                onChange={(e) =>
                  setDates({ ...dates, checkOut: e.target.value })
                }
              />
            </div>
          </div>

          <button
            onClick={handleProceedToPayment}
            className="w-full bg-green-600 hover:bg-green-500 text-white py-4 rounded-xl font-bold text-lg transition-all active:scale-95 shadow-lg shadow-green-600/20"
          >
            Proceed to Payment
          </button>
        </div>
      )}
    </div>
  );
}