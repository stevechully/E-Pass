import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PaymentModal from "../components/PaymentModal"; // Adjust path if needed

export default function EpassBooking() {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  
  // New states for payment flow
  const [showPayment, setShowPayment] = useState(false);
  const [pendingBookingId, setPendingBookingId] = useState(null);
  const [selectedDate, setSelectedDate] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    fetchSlots();
  }, []);

  async function fetchSlots() {
    try {
      const res = await fetch("http://localhost:5000/api/entry-slots");
      const data = await res.json();

      if (Array.isArray(data)) {
        setSlots(data);
      } else if (Array.isArray(data.data)) {
        setSlots(data.data);
      } else if (Array.isArray(data.slots)) {
        setSlots(data.slots);
      } else {
        setSlots([]);
      }
    } catch (err) {
      console.error("Fetch slots error:", err);
    }
  }

  // STEP 1: Initiate Booking (Creates PENDING record)
  async function initiateBooking() {
    if (!selectedSlot) return alert("Select a slot first");

    const slotToBook = slots.find(s => s.id === selectedSlot);
    const remaining = (slotToBook.max_capacity || slotToBook.capacity || 0) - (slotToBook.booked_count || 0);

    if (remaining <= 0) return alert("This slot is already full");

    const token = localStorage.getItem("token");
    if (!token) return alert("Please login first");

    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/epass/create-booking", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ slot_id: selectedSlot }),
      });

      const data = await res.json();

      if (data.success) {
        // Save pending booking info and open Payment Modal
        setPendingBookingId(data.booking.id);
        setSelectedDate(slotToBook.slot_date);
        setShowPayment(true);
      } else {
        alert(data.message || "Failed to initiate booking");
      }
    } catch (err) {
      console.error("Booking init error:", err);
      alert("Error initiating booking");
    } finally {
      setLoading(false);
    }
  }

  // STEP 2: Confirm Payment (Generates QR and marks PAID)
  async function handlePaymentSuccess() {
    const token = localStorage.getItem("token");
    setLoading(true);
    setShowPayment(false);

    try {
      const res = await fetch("http://localhost:5000/api/epass/confirm-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ booking_id: pendingBookingId }),
      });

      const data = await res.json();

      if (data.success) {
        // Redirect to success page to show QR Code
        navigate(`/epass/success/${pendingBookingId}`);
      } else {
        alert(data.message || "Payment confirmation failed.");
      }
    } catch (err) {
      console.error("Payment confirmation error:", err);
      alert("Something went wrong verifying your payment.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <h1 className="text-3xl font-bold mb-6">Book E-Pass</h1>

      {slots.length === 0 ? (
        <p>No slots available</p>
      ) : (
        <>
          <div className="grid gap-4 max-w-2xl">
            {slots.map((slot) => {
              const remaining = (slot.max_capacity || slot.capacity || 0) - (slot.booked_count || 0);
              const isFull = remaining <= 0;

              return (
                <div
                  key={slot.id}
                  onClick={() => !isFull && setSelectedSlot(slot.id)}
                  className={`p-5 rounded-xl border transition-all 
                    ${isFull ? "opacity-50 cursor-not-allowed bg-slate-900 border-slate-800" : "cursor-pointer"}
                    ${selectedSlot === slot.id
                        ? "border-blue-500 bg-blue-900 shadow-lg shadow-blue-500/20"
                        : !isFull ? "bg-slate-800 border-slate-700 hover:border-slate-500" : ""
                    }
                  `}
                >
                  <p className="text-blue-400 font-semibold">
                    {new Date(slot.slot_date).toLocaleDateString("en-IN", {
                      weekday: "long",
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>

                  <p className="text-lg font-bold">
                    {slot.start_time} - {slot.end_time}
                  </p>

                  <p className="mt-2 text-sm text-gray-400">
                    Capacity left:{" "}
                    <span
                      className={
                        remaining > 5
                          ? "text-green-400 font-bold"
                          : remaining > 0
                          ? "text-orange-400 font-bold"
                          : "text-red-500 font-bold"
                      }
                    >
                      {isFull ? "Full" : remaining}
                    </span>
                  </p>
                </div>
              );
            })}
          </div>

          <button
            disabled={!selectedSlot || loading}
            onClick={initiateBooking}
            className={`mt-6 px-6 py-3 rounded-lg font-bold transition-all shadow-lg 
              ${!selectedSlot || loading 
                ? "bg-gray-700 text-gray-500 cursor-not-allowed" 
                : "bg-blue-600 hover:bg-blue-500 active:scale-95 text-white"
              }`}
          >
            {loading ? "Processing..." : "Pay ₹20 Eco Fee & Book"}
          </button>
        </>
      )}

      {/* Render Payment Modal */}
      {showPayment && (
        <PaymentModal
          isOpen={showPayment}
          onClose={() => setShowPayment(false)}
          puja={{ puja_name: "Temple Eco Fee (e-Pass)" }} 
          bookingDate={selectedDate}
          selectedAddons={[]}
          ecoFee={20}
          totalAmount={20}
          isEpass={true}                // ✅ ADDED: Tells modal to skip Vazhipadu validation
          bookingId={pendingBookingId}  // ✅ ADDED: Passes the already-created ID
          onSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
}