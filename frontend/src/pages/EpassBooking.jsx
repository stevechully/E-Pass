import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PaymentModal from "../components/PaymentModal";
import { Calendar, Clock, Ticket, AlertCircle, ArrowRight } from "lucide-react";

export default function EpassBooking() {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
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
      const slotsData = Array.isArray(data) ? data : (data.data || data.slots || []);
      setSlots(slotsData);
    } catch (err) {
      console.error("Fetch slots error:", err);
    }
  }

  async function initiateBooking() {
    if (!selectedSlot) return;
    const slotToBook = slots.find(s => s.id === selectedSlot);
    const remaining = (slotToBook.max_capacity || slotToBook.capacity || 0) - (slotToBook.booked_count || 0);

    if (remaining <= 0) return alert("This slot is already full");
    const token = localStorage.getItem("token");
    if (!token) return navigate("/login");

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
        setPendingBookingId(data.booking.id);
        setSelectedDate(slotToBook.slot_date);
        setShowPayment(true);
      } else {
        alert(data.message || "Failed to initiate booking");
      }
    } catch (err) {
      console.error("Booking init error:", err);
    } finally {
      setLoading(false);
    }
  }

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
        navigate(`/epass/success/${pendingBookingId}`, { replace: true });
      }
    } catch (err) {
      console.error("Payment confirmation error:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen mandala-bg p-4 md:p-10 flex flex-col items-center animate-in fade-in duration-500">
      <div className="w-full max-w-3xl">
        {/* Header Section */}
        <div className="mb-12 text-center">
          <div className="inline-flex items-center justify-center p-3 bg-orange-50 rounded-2xl mb-4 border border-amber-100">
            <Ticket className="text-orange-600" size={32} />
          </div>
          <h1 className="text-4xl font-heading font-bold text-slate-800 mb-3">Temple E-Pass Booking</h1>
          <p className="text-slate-500 font-medium max-w-lg mx-auto">
            Secure your entry slot for a peaceful darshan. A small <span className="text-orange-600 font-bold">₹20 Eco Fee</span> helps maintain temple serenity.
          </p>
        </div>

        {/* Slot Selection */}
        {slots.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl border border-gold/10 text-center shadow-sm">
             <AlertCircle className="mx-auto text-slate-300 mb-4" size={48} />
             <p className="text-slate-500 font-heading text-xl">No available slots for the upcoming dates.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {slots.map((slot) => {
              const remaining = (slot.max_capacity || slot.capacity || 0) - (slot.booked_count || 0);
              const isFull = remaining <= 0;
              const isSelected = selectedSlot === slot.id;

              return (
                <div
                  key={slot.id}
                  onClick={() => !isFull && setSelectedSlot(slot.id)}
                  className={`group p-6 rounded-2xl border transition-all relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4 
                    ${isFull ? "opacity-40 grayscale cursor-not-allowed bg-slate-50 border-slate-200" : "cursor-pointer bg-white"}
                    ${isSelected ? "border-orange-500 ring-2 ring-orange-500/10 shadow-md" : "border-slate-100 hover:border-orange-300 shadow-sm"}
                  `}
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl transition-colors ${isSelected ? "bg-orange-600 text-white" : "bg-slate-50 text-slate-400 group-hover:bg-orange-50 group-hover:text-orange-500"}`}>
                      <Calendar size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-0.5">
                        {new Date(slot.slot_date).toLocaleDateString("en-IN", { weekday: "long", day: '2-digit', month: 'short' })}
                      </p>
                      <p className="text-xl font-heading font-bold text-slate-800 flex items-center gap-2">
                         <Clock size={16} className="text-slate-400" /> {slot.start_time} - {slot.end_time}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-xs font-bold text-slate-400 uppercase mb-1">Availability</p>
                    <span className={`text-sm font-black px-3 py-1 rounded-lg ${remaining > 10 ? "bg-emerald-50 text-emerald-600" : remaining > 0 ? "bg-orange-50 text-orange-600" : "bg-red-50 text-red-600"}`}>
                      {isFull ? "Sold Out" : `${remaining} Slots Left`}
                    </span>
                  </div>
                </div>
              );
            })}

            {/* Sticky Action Button */}
            <div className="sticky bottom-8 mt-10 p-2 bg-white/80 backdrop-blur-md rounded-3xl border border-gold/10 shadow-2xl flex items-center gap-4">
               <div className="flex-1 pl-6">
                 <p className="text-xs font-bold text-slate-400 uppercase">Contribution</p>
                 <p className="text-2xl font-heading font-bold text-slate-800">₹20.00</p>
               </div>
               <button
                  disabled={!selectedSlot || loading}
                  onClick={initiateBooking}
                  className={`px-8 py-4 rounded-2xl font-bold flex items-center gap-2 transition-all active:scale-95 shadow-lg
                    ${!selectedSlot || loading 
                      ? "bg-slate-200 text-slate-400 cursor-not-allowed" 
                      : "bg-orange-600 hover:bg-orange-500 text-white glow-saffron"
                    }`}
                >
                  {loading ? "Verifying..." : "Confirm & Book"} <ArrowRight size={20} />
               </button>
            </div>
          </div>
        )}
      </div>

      {showPayment && (
        <PaymentModal
          isOpen={showPayment}
          onClose={() => setShowPayment(false)}
          puja={{ puja_name: "Temple Entry E-Pass" }} 
          bookingDate={selectedDate}
          selectedAddons={[]}
          ecoFee={20}
          totalAmount={20}
          isEpass={true}
          bookingId={pendingBookingId}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
}