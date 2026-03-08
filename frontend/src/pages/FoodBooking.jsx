import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Utensils, Clock, Calendar, ArrowRight, Info } from "lucide-react";
import PaymentModal from "../components/PaymentModal";

export default function FoodBooking() {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [pendingBookingId, setPendingBookingId] = useState(null);
  const [selectedDate, setSelectedDate] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    fetchFoodSlots();
  }, []);

  async function fetchFoodSlots() {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/food-slots", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      const slotsData = Array.isArray(data) ? data : (data.data || data.slots || []);
      setSlots(slotsData);
    } catch (err) {
      console.error("Food slot fetch error:", err);
      setSlots([]);
    }
  }

  async function bookFood(slotId) {
    const token = localStorage.getItem("token");
    if (!token) return navigate("/login");

    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/food/book", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ food_slot_id: slotId }),
      });

      const data = await res.json();

      if (data.success) {
        const selectedSlot = slots.find((s) => s.id === slotId);
        if (selectedSlot?.meal_type === "FREE") {
          alert("Free Meal Booked Successfully! 🍽️");
          navigate("/my-food");
        } else {
          setPendingBookingId(data.booking.id);
          setSelectedDate(selectedSlot.slot_date);
          setShowPayment(true);
        }
      } else {
        alert(data.message || "Booking failed");
      }
    } catch (err) {
      console.error("Food booking error:", err);
    } finally {
      setLoading(false);
    }
  }

  // ✅ RESILIENT PAYMENT SUCCESS HANDLER
  async function handlePaymentSuccess() {
    const token = localStorage.getItem("token");
    setLoading(true);
    setShowPayment(false);

    try {
      const res = await fetch("http://localhost:5000/api/food/confirm-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ booking_id: pendingBookingId }),
      });

      // 🛡️ CRITICAL FIX: Check if the backend actually found the route before parsing JSON
      if (!res.ok) {
        const errorText = await res.text();
        console.error("Server Error Response:", errorText);
        alert(`Backend Error (${res.status}): The confirm-payment endpoint is missing on your Node server!`);
        setLoading(false);
        return; 
      }

      const data = await res.json();

      if (data.success) {
        navigate(`/food/success/${pendingBookingId}`, { replace: true });
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

  return (
    <div className="text-slate-800 flex justify-center px-6 py-10 animate-in fade-in duration-500">
      <div className="w-full max-w-3xl">
        <div className="mb-12 text-center">
          <div className="inline-flex items-center justify-center p-3 bg-orange-50 rounded-2xl mb-4 border border-amber-100">
            <Utensils className="text-orange-600" size={32} />
          </div>
          <h1 className="text-4xl font-heading font-bold text-slate-800 mb-3">Temple Food Booking</h1>
          <p className="text-slate-500 font-medium max-w-lg mx-auto">Reserve a meal slot at the temple dining hall.</p>
        </div>

        {slots.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl border border-gold/10 text-center shadow-sm">
            <Info className="mx-auto text-slate-200 mb-4" size={48} />
            <p className="text-slate-500 font-heading text-lg">No food slots available right now.</p>
          </div>
        ) : (
          <div className="space-y-5">
            {slots.map((slot) => {
              const remaining = slot.max_capacity - slot.booked_count;
              const isFull = remaining <= 0;
              const isFree = slot.meal_type === "FREE";

              return (
                <div key={slot.id} className={`bg-white border border-amber-50 rounded-[2rem] p-8 shadow-sm transition-all relative flex flex-col md:flex-row md:items-center justify-between gap-6 ${isFull ? "opacity-50 grayscale" : "hover:border-orange-200 hover:shadow-md"}`}>
                  <div className="flex flex-col gap-3">
                    <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${isFree ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"}`}>
                      {isFree ? "🍚 Free Meal" : "🍛 Paid Meal • ₹50"}
                    </span>
                    <div>
                      <p className="text-xl font-heading font-bold text-slate-800 flex items-center gap-2">
                        <Calendar size={18} className="text-slate-400" /> {new Date(slot.slot_date).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "long" })}
                      </p>
                      <p className="text-slate-500 font-bold flex items-center gap-2 mt-1">
                        <Clock size={16} className="text-slate-400" /> {slot.start_time} – {slot.end_time}
                      </p>
                    </div>
                  </div>
                  <button disabled={loading || isFull} onClick={() => bookFood(slot.id)} className={`px-8 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95 shadow-md ${isFull ? "bg-slate-100 text-slate-400" : "bg-orange-600 hover:bg-orange-500 text-white"}`}>
                    {isFull ? "Full" : isFree ? "Book Free" : "Book & Pay"} {!isFull && <ArrowRight size={18} />}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {showPayment && (
          <PaymentModal
            isOpen={showPayment}
            onClose={() => setShowPayment(false)}
            puja={{ puja_name: "Temple Food Booking" }}
            bookingDate={selectedDate}
            selectedAddons={[]}
            ecoFee={0}
            totalAmount={50}
            bookingId={pendingBookingId}
            isEpass={true} 
            moduleName="FOOD"
            onSuccess={handlePaymentSuccess}
          />
        )}
      </div>
    </div>
  );
}