import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bed, Calendar, Clock, ArrowRight, Info, CheckCircle2 } from "lucide-react";
import PaymentModal from "../components/PaymentModal";

export default function AccommodationBooking() {
  const navigate = useNavigate();
  const [accommodations, setAccommodations] = useState([]);
  const [selectedAcc, setSelectedAcc] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // Date Selection
  const [dates, setDates] = useState({
    checkIn: "",
    checkOut: ""
  });

  // Unified Payment States
  const [showPayment, setShowPayment] = useState(false);
  const [pendingBookingId, setPendingBookingId] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState(0);

  useEffect(() => {
    fetchAccommodations();
  }, []);

  async function fetchAccommodations() {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/accommodation", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();

      if (data.success) {
        setAccommodations(data.data || data.accommodations || []);
      }
    } catch (err) {
      console.error("Error fetching accommodations:", err);
    }
  }

  // 1️⃣ Handle the initial PENDING booking and calculate price
  async function handleProceedToPayment() {
    const token = localStorage.getItem("token");
    if (!token) return navigate("/login");

    if (!selectedAcc || !dates.checkIn || !dates.checkOut) {
      return alert("Please select an accommodation and your check-in/check-out dates.");
    }

    const start = new Date(dates.checkIn);
    const end = new Date(dates.checkOut);
    
    if (end <= start) {
      return alert("Check-out date must be after check-in date.");
    }

    setLoading(true);
    try {
      // Create the initial booking (Status: PENDING)
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
        setLoading(false);
        return;
      }

      // Calculate Total Amount based on Days selected
      const diffTime = Math.abs(end - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
      const totalDays = diffDays > 0 ? diffDays : 1; 
      const totalAmount = totalDays * selectedAcc.price_per_day;

      // Trigger the Payment Modal instead of navigating away!
      setPendingBookingId(json.booking.id);
      setPaymentAmount(totalAmount);
      setShowPayment(true);
      
    } catch (err) {
      console.error(err);
      alert("Network error processing booking");
    } finally {
      setLoading(false);
    }
  }

  // 2️⃣ Handle the backend confirmation AFTER modal success
  async function handlePaymentSuccess() {
    const token = localStorage.getItem("token");
    setLoading(true);
    setShowPayment(false);

    try {
      // Call the backend to finalize the booking and generate the STAY QR code
      const res = await fetch("http://localhost:5000/api/accommodation/confirm-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ booking_id: pendingBookingId }),
      });

      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }

      const data = await res.json();

      if (data.success) {
        // ✅ Redirect straight to the QR Success Screen!
        navigate(`/accommodation/success/${pendingBookingId}`, { replace: true });
      } else {
        alert(data.message || "Payment confirmation failed.");
      }
    } catch (err) {
      console.error("Payment confirmation error:", err);
      alert("Payment verification failed. Please check the console for details.");
    } finally {
      setLoading(false);
    }
  }

  // Helper to get minimum checkout date based on selected checkin
  const minCheckOutDate = dates.checkIn 
    ? new Date(new Date(dates.checkIn).getTime() + 86400000).toISOString().split("T")[0]
    : new Date().toISOString().split("T")[0];

  return (
    <div className="text-slate-800 flex justify-center px-4 sm:px-6 py-10 animate-in fade-in duration-500">
      <div className="w-full max-w-4xl">
        
        {/* Header */}
        <div className="mb-12 text-center">
          <div className="inline-flex items-center justify-center p-3 bg-orange-50 rounded-2xl mb-4 border border-amber-100">
            <Bed className="text-orange-600" size={32} />
          </div>
          <h1 className="text-4xl font-heading font-bold text-slate-800 mb-3">
            Temple Guest House
          </h1>
          <p className="text-slate-500 font-medium max-w-lg mx-auto">
            Book a peaceful stay at the temple premises. Your contributions support temple maintenance.
          </p>
        </div>

        {/* ACCOMMODATION LIST */}
        {accommodations.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl border border-gold/10 text-center shadow-sm">
            <Info className="mx-auto text-slate-200 mb-4" size={48} />
            <p className="text-slate-500 font-heading text-lg">No rooms available right now.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
            {accommodations.map((acc) => {
              const isSelected = selectedAcc?.id === acc.id;

              return (
                <div
                  key={acc.id}
                  onClick={() => setSelectedAcc(acc)}
                  className={`p-6 rounded-[2rem] border cursor-pointer transition-all relative overflow-hidden bg-white
                    ${isSelected 
                      ? "border-orange-500 ring-2 ring-orange-500/10 shadow-lg scale-[1.02]" 
                      : "border-amber-50 hover:border-orange-200 shadow-sm hover:shadow-md"}
                  `}
                >
                  {isSelected && (
                    <div className="absolute top-4 right-4 text-orange-500 animate-in zoom-in">
                      <CheckCircle2 size={24} className="fill-orange-50" />
                    </div>
                  )}
                  
                  <span className="text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest bg-slate-50 text-slate-500 w-max mb-3 block">
                    {acc.accommodation_type || acc.type || "Guest Room"}
                  </span>

                  <h2 className="text-2xl font-heading font-bold text-slate-800 mb-1">{acc.name}</h2>
                  
                  <p className="text-orange-600 font-bold text-xl mt-4 flex items-end gap-1">
                    ₹{acc.price_per_day} <span className="text-sm text-slate-400 font-medium mb-0.5">/ night</span>
                  </p>
                  
                  {acc.availability_status && (
                    <p className="text-xs font-bold uppercase tracking-wider text-emerald-600 mt-4 bg-emerald-50 w-max px-2 py-1 rounded-md">
                      {acc.availability_status}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* DATE SELECTION & CONFIRMATION */}
        {selectedAcc && (
          <div className="bg-white p-8 rounded-[2rem] border border-orange-100 shadow-xl max-w-2xl mx-auto animate-in slide-in-from-bottom-4 duration-500">
            <h3 className="text-2xl font-heading font-bold mb-6 text-slate-800 border-b border-slate-100 pb-4 flex items-center gap-2">
              Stay Details <span className="text-orange-600 bg-orange-50 px-3 py-1 rounded-lg text-lg">{selectedAcc.name}</span>
            </h3>

            <div className="grid sm:grid-cols-2 gap-6 mb-8">
              {/* Check In */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <label className="flex items-center gap-2 text-slate-500 mb-2 text-xs font-bold uppercase tracking-widest">
                  <Calendar size={16} /> Check-in
                </label>
                <input
                  type="date"
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full bg-transparent font-heading font-bold text-lg text-slate-800 focus:outline-none cursor-pointer"
                  onChange={(e) => setDates({ ...dates, checkIn: e.target.value })}
                  value={dates.checkIn}
                />
              </div>

              {/* Check Out */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <label className="flex items-center gap-2 text-slate-500 mb-2 text-xs font-bold uppercase tracking-widest">
                  <Clock size={16} /> Check-out
                </label>
                <input
                  type="date"
                  min={minCheckOutDate}
                  disabled={!dates.checkIn}
                  className="w-full bg-transparent font-heading font-bold text-lg text-slate-800 focus:outline-none cursor-pointer disabled:opacity-50"
                  onChange={(e) => setDates({ ...dates, checkOut: e.target.value })}
                  value={dates.checkOut}
                />
              </div>
            </div>

            <button
              disabled={loading || !dates.checkIn || !dates.checkOut}
              onClick={handleProceedToPayment}
              className={`w-full py-4 rounded-2xl font-bold text-lg transition-all flex items-center justify-center gap-2 shadow-md
                ${loading || !dates.checkIn || !dates.checkOut
                  ? "bg-slate-100 text-slate-400 cursor-not-allowed shadow-none"
                  : "bg-orange-600 hover:bg-orange-500 text-white active:scale-95 glow-saffron"
                }`}
            >
              {loading ? "Processing..." : "Calculate Price & Book"} <ArrowRight size={20} />
            </button>
          </div>
        )}

        {/* CENTRALIZED PAYMENT MODAL */}
        {showPayment && (
          <PaymentModal
            isOpen={showPayment}
            onClose={() => setShowPayment(false)}
            puja={{ puja_name: `Stay at ${selectedAcc?.name}` }}
            bookingDate={dates.checkIn}
            selectedAddons={[]}
            ecoFee={0}
            totalAmount={paymentAmount} 
            bookingId={pendingBookingId}
            isEpass={true} // Skips Vazhipadu-specific validations
            moduleName="ACCOMMODATION" // Tells the central API what this is
            onSuccess={handlePaymentSuccess}
          />
        )}
      </div>
    </div>
  );
}