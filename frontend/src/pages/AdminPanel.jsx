import { useEffect, useState } from "react";

// ⭐ Helper: Date Converter (dd/mm/yyyy → yyyy-mm-dd)
function formatDateToISO(dateStr) {
  if (!dateStr.includes("/")) return dateStr;
  const [day, month, year] = dateStr.split("/");
  return `${year}-${month}-${day}`;
}

// ⭐ Helper: Time Converter ("10:30 am" → "10:30")
function formatTimeTo24(timeStr) {
  if (!timeStr.toLowerCase().includes("am") && !timeStr.toLowerCase().includes("pm")) return timeStr;
  
  let [time, modifier] = timeStr.split(" ");
  let [hours, minutes] = time.split(":");

  if (modifier.toLowerCase() === "pm" && hours !== "12") {
    hours = String(parseInt(hours) + 12);
  }
  if (modifier.toLowerCase() === "am" && hours === "12") {
    hours = "00";
  }
  return `${hours.padStart(2, '0')}:${minutes}`;
}

export default function AdminPanel() {
  const token = localStorage.getItem("token");

  // Data States
  const [entrySlots, setEntrySlots] = useState([]);
  const [foodSlots, setFoodSlots] = useState([]);
  const [accommodations, setAccommodations] = useState([]); // 🆕

  // Form States
  const [entryForm, setEntryForm] = useState({
    slot_date: "",
    start_time: "",
    end_time: "",
    max_capacity: ""
  });

  const [foodForm, setFoodForm] = useState({
    slot_date: "",
    start_time: "",
    end_time: "",
    meal_type: "FREE",
    max_capacity: ""
  });

  // 🆕 Accommodation Form State
  const [accForm, setAccForm] = useState({
    name: "",
    accommodation_type: "DORMITORY",
    capacity: "",
    price_per_day: ""
  });

  const inputStyle = "bg-slate-800 text-white p-2 rounded border border-slate-600 focus:ring-2 focus:ring-green-500 outline-none transition-all";

  useEffect(() => {
    fetchSlots();
  }, []);

  async function fetchSlots() {
    try {
      // 1. Fetch Entry Slots
      const e = await fetch("http://localhost:5000/api/entry-slots");
      const ed = await e.json();
      setEntrySlots(ed.slots || ed.data || (Array.isArray(ed) ? ed : []));

      // 2. Fetch Food Slots
      const f = await fetch("http://localhost:5000/api/food-slots");
      const fd = await f.json();
      setFoodSlots(fd.slots || fd.data || (Array.isArray(fd) ? fd : []));

      // 3. 🆕 Fetch Accommodations (to display list)
      const a = await fetch("http://localhost:5000/api/accommodation");
      const ad = await a.json();
      if(ad.success) setAccommodations(ad.data || []);

    } catch (err) {
      console.error("Error fetching admin data:", err);
    }
  }

  // ===== 1. ENTRY SLOT HANDLERS =====
  async function createEntrySlot() {
    try {
      const payload = { 
        slot_date: formatDateToISO(entryForm.slot_date),
        start_time: formatTimeTo24(entryForm.start_time),
        end_time: formatTimeTo24(entryForm.end_time),
        max_capacity: Number(entryForm.max_capacity) 
      };
      
      const res = await fetch("http://localhost:5000/api/admin/entry-slots", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (res.ok) {
        alert("Entry Slot Created! ✅");
        setEntryForm({ slot_date: "", start_time: "", end_time: "", max_capacity: "" });
        fetchSlots();
      } else {
        alert(data.message || "Failed to create slot");
      }
    } catch (err) {
      alert("Network error occurred");
    }
  }

  async function toggleEntry(id) {
    await fetch(`http://localhost:5000/api/admin/entry-slots/${id}/toggle`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` }
    });
    fetchSlots();
  }

  // ===== 2. FOOD SLOT HANDLERS =====
  async function createFoodSlot() {
    try {
      const payload = { 
        ...foodForm, 
        slot_date: formatDateToISO(foodForm.slot_date),
        start_time: formatTimeTo24(foodForm.start_time),
        end_time: formatTimeTo24(foodForm.end_time),
        max_capacity: Number(foodForm.max_capacity) 
      };

      const res = await fetch("http://localhost:5000/api/admin/food-slots", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        alert("Food Slot Created! ✅");
        setFoodForm({ slot_date: "", start_time: "", end_time: "", meal_type: "FREE", max_capacity: "" });
        fetchSlots();
      } else {
        const data = await res.json();
        alert(data.message || "Failed to create food slot");
      }
    } catch (err) {
      alert("Network error occurred");
    }
  }

  async function toggleFood(id) {
    await fetch(`http://localhost:5000/api/admin/food-slots/${id}/toggle`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` }
    });
    fetchSlots();
  }

  // ===== 3. 🆕 ACCOMMODATION HANDLER =====
  async function createAccommodation() {
    if(!accForm.name || !accForm.capacity || !accForm.price_per_day) {
        return alert("Please fill all fields");
    }

    try {
      const res = await fetch("http://localhost:5000/api/admin/accommodations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(accForm)
      });

      const data = await res.json();

      if (data.success) {
        alert("Accommodation Created! 🏠");
        setAccForm({ name: "", accommodation_type: "DORMITORY", capacity: "", price_per_day: "" });
        fetchSlots(); // Refresh list
      } else {
        alert(data.message || "Failed to create accommodation");
      }
    } catch (err) {
      console.error(err);
      alert("Error creating accommodation");
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <div className="mb-10">
        <h1 className="text-3xl font-bold">Admin Management</h1>
        <p className="text-gray-400 mt-1">Configure entry, meal slots, and accommodations.</p>
      </div>

      {/* 1. ENTRY SLOT SECTION */}
      <section className="bg-slate-800/40 p-6 rounded-2xl border border-slate-700 mb-10">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">📅 Create Entry Slot</h2>
        <div className="flex flex-wrap gap-3 mb-6">
          <input type="text" placeholder="dd/mm/yyyy" value={entryForm.slot_date} className={inputStyle} onChange={e => setEntryForm({ ...entryForm, slot_date: e.target.value })} />
          <input type="text" placeholder="10:00 am" value={entryForm.start_time} className={inputStyle} onChange={e => setEntryForm({ ...entryForm, start_time: e.target.value })} />
          <input type="text" placeholder="12:00 pm" value={entryForm.end_time} className={inputStyle} onChange={e => setEntryForm({ ...entryForm, end_time: e.target.value })} />
          <input type="number" value={entryForm.max_capacity} placeholder="Capacity" className={inputStyle} onChange={e => setEntryForm({ ...entryForm, max_capacity: e.target.value })} />
          <button onClick={createEntrySlot} className="bg-green-600 hover:bg-green-700 px-6 rounded-lg font-bold transition-all active:scale-95">Create Slot</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {entrySlots.map(s => (
            <div key={s.id} className="bg-slate-800 p-4 rounded-xl border border-slate-700 flex justify-between items-center">
              <div>
                <p className="font-bold">{new Date(s.slot_date).toDateString()}</p>
                <p className="text-sm text-gray-400">{s.start_time} - {s.end_time}</p>
              </div>
              <button onClick={() => toggleEntry(s.id)} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${s.is_active ? 'bg-yellow-600/20 text-yellow-500 border border-yellow-600/50' : 'bg-slate-700 text-gray-400'}`}>{s.is_active ? 'Disable' : 'Enable'}</button>
            </div>
          ))}
        </div>
      </section>

      {/* 2. FOOD SLOT SECTION */}
      <section className="bg-slate-800/40 p-6 rounded-2xl border border-slate-700 mb-10">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">🍔 Create Food Slot</h2>
        <div className="flex flex-wrap gap-3 mb-6">
          <input type="text" placeholder="dd/mm/yyyy" value={foodForm.slot_date} className={inputStyle} onChange={e => setFoodForm({ ...foodForm, slot_date: e.target.value })} />
          <input type="text" placeholder="08:00 am" value={foodForm.start_time} className={inputStyle} onChange={e => setFoodForm({ ...foodForm, start_time: e.target.value })} />
          <input type="text" placeholder="10:00 am" value={foodForm.end_time} className={inputStyle} onChange={e => setFoodForm({ ...foodForm, end_time: e.target.value })} />
          <select value={foodForm.meal_type} className={inputStyle} onChange={e => setFoodForm({ ...foodForm, meal_type: e.target.value })}>
            <option value="FREE">FREE</option>
            <option value="PAID">PAID</option>
            <option value="FESTIVAL">FESTIVAL</option>
          </select>
          <input type="number" value={foodForm.max_capacity} placeholder="Capacity" className={inputStyle} onChange={e => setFoodForm({ ...foodForm, max_capacity: e.target.value })} />
          <button onClick={createFoodSlot} className="bg-green-600 hover:bg-green-700 px-6 rounded-lg font-bold transition-all active:scale-95">Create Slot</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {foodSlots.map(s => (
            <div key={s.id} className="bg-slate-800 p-4 rounded-xl border border-slate-700 flex justify-between items-center">
              <div>
                  <p className="font-bold text-green-400">{s.meal_type}</p>
                  <p className="text-sm">{new Date(s.slot_date).toDateString()}</p>
              </div>
              <button onClick={() => toggleFood(s.id)} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${s.is_active ? 'bg-yellow-600/20 text-yellow-500 border border-yellow-600/50' : 'bg-slate-700 text-gray-400'}`}>{s.is_active ? 'Disable' : 'Enable'}</button>
            </div>
          ))}
        </div>
      </section>

      {/* 3. 🆕 ACCOMMODATION SECTION */}
      <section className="bg-slate-800/40 p-6 rounded-2xl border border-slate-700">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">🏠 Create Accommodation</h2>
        <div className="flex flex-wrap gap-3 mb-6">
            <input
                placeholder="Name (e.g. Jungle Cottage)"
                value={accForm.name}
                className={inputStyle}
                onChange={(e) => setAccForm({ ...accForm, name: e.target.value })}
            />
            <select
                value={accForm.accommodation_type}
                className={inputStyle}
                onChange={(e) => setAccForm({ ...accForm, accommodation_type: e.target.value })}
            >
                <option value="DORMITORY">DORMITORY</option>
                <option value="ROOM">ROOM</option>
                <option value="COTTAGE">COTTAGE</option>
            </select>
            <input
                type="number"
                placeholder="Capacity"
                value={accForm.capacity}
                className={inputStyle}
                onChange={(e) => setAccForm({ ...accForm, capacity: e.target.value })}
            />
            <input
                type="number"
                placeholder="Price per day (₹)"
                value={accForm.price_per_day}
                className={inputStyle}
                onChange={(e) => setAccForm({ ...accForm, price_per_day: e.target.value })}
            />
            <button
                onClick={createAccommodation}
                className="bg-green-600 hover:bg-green-700 px-6 rounded-lg font-bold transition-all active:scale-95"
            >
                Create
            </button>
        </div>

        {/* Accommodation List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {accommodations.map(acc => (
                <div key={acc.id} className="bg-slate-800 p-4 rounded-xl border border-slate-700">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="font-bold text-lg">{acc.name}</h3>
                            <span className="text-xs bg-slate-700 px-2 py-1 rounded text-gray-300">{acc.accommodation_type}</span>
                        </div>
                        <p className="text-green-400 font-bold">₹{acc.price_per_day}</p>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">Capacity: {acc.capacity} • {acc.availability_status}</p>
                </div>
            ))}
            {accommodations.length === 0 && <p className="text-gray-500 italic">No accommodations created yet.</p>}
        </div>
      </section>
    </div>
  );
}