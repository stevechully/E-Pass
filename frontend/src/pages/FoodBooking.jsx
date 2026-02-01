import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // ⭐ Added Import

export default function FoodBooking() {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate(); // ⭐ Init Hook

  useEffect(() => {
    fetchFoodSlots();
  }, []);

  async function fetchFoodSlots() {
    try {
      const token = localStorage.getItem("token"); // Added auth header safety
      const res = await fetch("http://localhost:5000/api/food-slots", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();

      if (Array.isArray(data)) setSlots(data);
      else if (Array.isArray(data.data)) setSlots(data.data);
      else if (Array.isArray(data.slots)) setSlots(data.slots);
      else setSlots([]);
    } catch (err) {
      console.error("Food slot fetch error:", err);
      setSlots([]);
    }
  }

  async function bookFood(slotId) {
    const token = localStorage.getItem("token");
    if (!token) return alert("Please login first");

    setLoading(true);
    try {
      const res = await fetch(
        "http://localhost:5000/api/food/book",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ food_slot_id: slotId })
        }
      );

      const data = await res.json();

      if (data.success) {
        // ⭐ LOGIC: Check meal type to decide next step
        const selectedSlot = slots.find(s => s.id === slotId);
        
        if (selectedSlot?.meal_type === "FREE") {
          alert("Free Meal Booked Successfully! 🍽️");
          navigate("/my-food"); // No payment needed
        } else {
          // Redirect to payment page
          navigate("/payment", {
            state: {
              module: "FOOD",
              booking_id: data.booking.id, // Ensure backend sends this
              amount: 50 // Fixed price for paid meals (or derive from slot)
            }
          });
        }
      } else {
        alert(data.message || "Booking failed");
      }
    } catch (err) {
      console.error("Food booking error:", err);
      alert("Booking error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <h1 className="text-3xl font-bold mb-2">Book Food</h1>
      <p className="text-gray-400 mb-8">
        Choose a meal slot. Paid meals require payment confirmation.
      </p>

      {slots.length === 0 ? (
        <p className="text-gray-500">No food slots available</p>
      ) : (
        <div className="grid gap-4 max-w-2xl">
          {slots.map(slot => {
            const remaining = slot.max_capacity - slot.booked_count;
            const isFull = remaining <= 0;

            return (
              <div
                key={slot.id}
                className="bg-slate-800 p-6 rounded-xl border border-slate-700 flex justify-between items-center"
              >
                <div>
                  <p className={`font-bold uppercase text-sm mb-1 ${slot.meal_type === 'FREE' ? 'text-green-400' : 'text-yellow-400'}`}>
                    {slot.meal_type} {slot.meal_type !== 'FREE' && '• ₹50'}
                  </p>

                  <p className="text-lg font-semibold">
                    {new Date(slot.slot_date).toDateString()}
                  </p>

                  <p className="text-gray-300">
                    {slot.start_time} – {slot.end_time}
                  </p>

                  <p className="text-sm mt-1 text-gray-400">
                    <span className={remaining > 5 ? "text-green-400" : "text-orange-400"}>
                      {remaining} spots left
                    </span>
                  </p>
                </div>

                <button
                  disabled={loading || isFull}
                  onClick={() => bookFood(slot.id)}
                  className={`px-6 py-3 rounded-lg font-bold transition-all ${
                    isFull
                      ? "bg-gray-700 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-500/20"
                  }`}
                >
                  {isFull ? "Full" : slot.meal_type === 'FREE' ? "Book Free" : "Book & Pay"}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}