import { useEffect, useState } from "react";

export default function EpassBooking() {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);

  useEffect(() => {
    fetchSlots();
  }, []);

  async function fetchSlots() {
    try {
      const res = await fetch("http://localhost:5000/api/entry-slots");
      const data = await res.json();

      console.log("Slots API:", data);

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

  async function bookSlot() {
    if (!selectedSlot) return alert("Select a slot first");

    // ⭐ Find the currently selected slot to check remaining capacity
    const slotToBook = slots.find(s => s.id === selectedSlot);
    const remaining = (slotToBook.max_capacity || slotToBook.capacity || 0) - (slotToBook.booked_count || 0);

    if (remaining <= 0) return alert("This slot is already full");

    const token = localStorage.getItem("token");
    if (!token) return alert("Please login first");

    setLoading(true);

    try {
      const res = await fetch(
        "http://localhost:5000/api/epass/book",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ slot_id: selectedSlot }),
        }
      );

      const data = await res.json();

      if (data.success) {
        alert("E-Pass booked successfully ✅");
        setSelectedSlot(null);
        fetchSlots(); // Refresh capacity after a successful booking
      } else {
        alert(data.message || "Booking failed");
      }
    } catch (err) {
      console.error("Booking error:", err);
      alert("Booking error");
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
              // ⭐ Step 1: Compute remaining capacity correctly
              // (Checking for both 'capacity' and 'max_capacity' depending on your DB column name)
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

          {/* Confirm Button */}
          <button
            disabled={!selectedSlot || loading}
            onClick={bookSlot}
            className={`mt-6 px-6 py-3 rounded-lg font-bold transition-all shadow-lg 
              ${!selectedSlot || loading 
                ? "bg-gray-700 text-gray-500 cursor-not-allowed" 
                : "bg-blue-600 hover:bg-blue-500 active:scale-95 text-white"
              }`}
          >
            {loading ? "Processing..." : "Confirm Booking"}
          </button>
        </>
      )}
    </div>
  );
}