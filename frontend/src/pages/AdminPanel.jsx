import { useEffect, useState } from "react";
import { CalendarDays, Utensils, Bed, Plus, Power, IndianRupee, Clock } from "lucide-react";

// ⭐ Helper: Date Converter (Safe passthrough for native date inputs)
function formatDateToISO(dateStr) {
  if (!dateStr || !dateStr.includes("/")) return dateStr;
  const [day, month, year] = dateStr.split("/");
  return `${year}-${month}-${day}`;
}

// ⭐ Helper: Time Converter (Safe passthrough for native time inputs)
function formatTimeTo24(timeStr) {
  if (!timeStr || (!timeStr.toLowerCase().includes("am") && !timeStr.toLowerCase().includes("pm"))) return timeStr;
  
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
  const [accommodations, setAccommodations] = useState([]);

  // Form States
  const [entryForm, setEntryForm] = useState({
    slot_date: "", start_time: "", end_time: "", max_capacity: ""
  });

  const [foodForm, setFoodForm] = useState({
    slot_date: "", start_time: "", end_time: "", meal_type: "FREE", max_capacity: "", price: "" // ✅ Added price
  });

  const [accForm, setAccForm] = useState({
    name: "", accommodation_type: "DORMITORY", capacity: "", price_per_day: ""
  });

  const inputStyle = "w-full bg-slate-50 text-slate-800 p-3 rounded-xl border border-slate-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 outline-none transition-all font-medium";
  const labelStyle = "block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1";

  useEffect(() => {
    fetchSlots();
  }, []);

  async function fetchSlots() {
    try {
      const e = await fetch("http://localhost:5000/api/entry-slots");
      const ed = await e.json();
      setEntrySlots(ed.slots || ed.data || (Array.isArray(ed) ? ed : []));

      const f = await fetch("http://localhost:5000/api/food-slots");
      const fd = await f.json();
      setFoodSlots(fd.slots || fd.data || (Array.isArray(fd) ? fd : []));

      const a = await fetch("http://localhost:5000/api/accommodation");
      const ad = await a.json();
      if(ad.success) setAccommodations(ad.data || []);
    } catch (err) {
      console.error("Error fetching admin data:", err);
    }
  }

  // ===== 1. ENTRY SLOT HANDLERS =====
  async function createEntrySlot() {
    if(!entryForm.slot_date || !entryForm.start_time || !entryForm.end_time || !entryForm.max_capacity) {
        return alert("Please fill all entry slot fields.");
    }
    try {
      const payload = { 
        slot_date: formatDateToISO(entryForm.slot_date),
        start_time: formatTimeTo24(entryForm.start_time),
        end_time: formatTimeTo24(entryForm.end_time),
        max_capacity: Number(entryForm.max_capacity) 
      };
      
      const res = await fetch("http://localhost:5000/api/admin/entry-slots", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        alert("Entry Slot Created! ✅");
        setEntryForm({ slot_date: "", start_time: "", end_time: "", max_capacity: "" });
        fetchSlots();
      } else {
        const data = await res.json();
        alert(data.message || "Failed to create slot");
      }
    } catch (err) { alert("Network error occurred"); }
  }

  async function toggleEntry(id) {
    await fetch(`http://localhost:5000/api/admin/entry-slots/${id}/toggle`, {
      method: "PATCH", headers: { Authorization: `Bearer ${token}` }
    });
    fetchSlots();
  }

  // ===== 2. FOOD SLOT HANDLERS =====
  async function createFoodSlot() {
    if(!foodForm.slot_date || !foodForm.start_time || !foodForm.end_time || !foodForm.max_capacity) {
        return alert("Please fill all required food slot fields.");
    }
    try {
      const payload = { 
        ...foodForm, 
        slot_date: formatDateToISO(foodForm.slot_date),
        start_time: formatTimeTo24(foodForm.start_time),
        end_time: formatTimeTo24(foodForm.end_time),
        max_capacity: Number(foodForm.max_capacity),
        price: foodForm.meal_type === "FREE" ? 0 : Number(foodForm.price) // ✅ Safely handle price
      };

      const res = await fetch("http://localhost:5000/api/admin/food-slots", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        alert("Food Slot Created! ✅");
        setFoodForm({ slot_date: "", start_time: "", end_time: "", meal_type: "FREE", max_capacity: "", price: "" });
        fetchSlots();
      } else {
        const data = await res.json();
        alert(data.message || "Failed to create food slot");
      }
    } catch (err) { alert("Network error occurred"); }
  }

  async function toggleFood(id) {
    await fetch(`http://localhost:5000/api/admin/food-slots/${id}/toggle`, {
      method: "PATCH", headers: { Authorization: `Bearer ${token}` }
    });
    fetchSlots();
  }

  // ===== 3. ACCOMMODATION HANDLER =====
  async function createAccommodation() {
    if(!accForm.name || !accForm.capacity || !accForm.price_per_day) {
        return alert("Please fill all fields");
    }
    try {
      const res = await fetch("http://localhost:5000/api/admin/accommodations", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(accForm)
      });
      const data = await res.json();

      if (data.success) {
        alert("Accommodation Created! 🏠");
        setAccForm({ name: "", accommodation_type: "DORMITORY", capacity: "", price_per_day: "" });
        fetchSlots(); 
      } else {
        alert(data.message || "Failed to create accommodation");
      }
    } catch (err) { console.error(err); alert("Error creating accommodation"); }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-10 animate-in fade-in duration-500">
      
      {/* Header */}
      <div>
        <h1 className="text-4xl font-heading font-black text-slate-800 tracking-tight">Configuration Panel</h1>
        <p className="text-slate-500 font-medium mt-1">Manage temple schedules, dining slots, and guest house inventory.</p>
      </div>

      {/* 1. ENTRY SLOT SECTION */}
      <section className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-blue-50 text-blue-600 rounded-xl"><CalendarDays size={24} /></div>
          <h2 className="text-2xl font-heading font-bold text-slate-800">Darshan Entry Slots</h2>
        </div>
        
        {/* Entry Form */}
        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 mb-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 items-end">
          <div>
            <label className={labelStyle}>Date</label>
            <input type="date" value={entryForm.slot_date} className={inputStyle} onChange={e => setEntryForm({ ...entryForm, slot_date: e.target.value })} />
          </div>
          <div>
            <label className={labelStyle}>Start Time</label>
            <input type="time" value={entryForm.start_time} className={inputStyle} onChange={e => setEntryForm({ ...entryForm, start_time: e.target.value })} />
          </div>
          <div>
            <label className={labelStyle}>End Time</label>
            <input type="time" value={entryForm.end_time} className={inputStyle} onChange={e => setEntryForm({ ...entryForm, end_time: e.target.value })} />
          </div>
          <div>
            <label className={labelStyle}>Capacity</label>
            <input type="number" placeholder="e.g. 500" value={entryForm.max_capacity} className={inputStyle} onChange={e => setEntryForm({ ...entryForm, max_capacity: e.target.value })} />
          </div>
          <button onClick={createEntrySlot} className="w-full bg-slate-800 hover:bg-slate-700 text-white p-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 h-[50px]">
            <Plus size={18} /> Create
          </button>
        </div>

        {/* Entry List */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {entrySlots.map(s => (
            <div key={s.id} className={`p-5 rounded-2xl border transition-all ${s.is_active ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-50 border-slate-100 opacity-60'}`}>
              <div className="flex justify-between items-start mb-3">
                <p className="font-bold text-slate-800">{new Date(s.slot_date).toLocaleDateString("en-IN", { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                <button onClick={() => toggleEntry(s.id)} className={`p-2 rounded-lg transition-all ${s.is_active ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' : 'bg-slate-200 text-slate-500 hover:bg-slate-300'}`} title={s.is_active ? "Disable" : "Enable"}>
                  <Power size={16} />
                </button>
              </div>
              <p className="text-sm font-bold text-slate-500 flex items-center gap-1.5"><Clock size={14}/> {s.start_time} - {s.end_time}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 2. FOOD SLOT SECTION */}
      <section className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-orange-50 text-orange-600 rounded-xl"><Utensils size={24} /></div>
          <h2 className="text-2xl font-heading font-bold text-slate-800">Dining Hall Slots</h2>
        </div>
        
        {/* Food Form */}
        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 mb-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 items-end">
          <div>
            <label className={labelStyle}>Date</label>
            <input type="date" value={foodForm.slot_date} className={inputStyle} onChange={e => setFoodForm({ ...foodForm, slot_date: e.target.value })} />
          </div>
          <div>
            <label className={labelStyle}>Start</label>
            <input type="time" value={foodForm.start_time} className={inputStyle} onChange={e => setFoodForm({ ...foodForm, start_time: e.target.value })} />
          </div>
          <div>
            <label className={labelStyle}>End</label>
            <input type="time" value={foodForm.end_time} className={inputStyle} onChange={e => setFoodForm({ ...foodForm, end_time: e.target.value })} />
          </div>
          <div>
            <label className={labelStyle}>Type</label>
            <select value={foodForm.meal_type} className={inputStyle} onChange={e => setFoodForm({ ...foodForm, meal_type: e.target.value })}>
              <option value="FREE">Annadanam (Free)</option>
              <option value="PAID">Paid Meal</option>
              <option value="FESTIVAL">Festival Feast</option>
            </select>
          </div>
          {/* ✅ New Price Field */}
          <div className="flex gap-2">
            <div className="flex-1">
              <label className={labelStyle}>Cap.</label>
              <input type="number" placeholder="200" value={foodForm.max_capacity} className={inputStyle} onChange={e => setFoodForm({ ...foodForm, max_capacity: e.target.value })} />
            </div>
            {foodForm.meal_type !== "FREE" && (
              <div className="flex-1">
                <label className={labelStyle}>Price</label>
                <input type="number" placeholder="₹" value={foodForm.price} className={inputStyle} onChange={e => setFoodForm({ ...foodForm, price: e.target.value })} />
              </div>
            )}
          </div>
          <button onClick={createFoodSlot} className="w-full bg-orange-600 hover:bg-orange-500 text-white p-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 h-[50px] glow-saffron active:scale-95">
            <Plus size={18} /> Add
          </button>
        </div>

        {/* Food List */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {foodSlots.map(s => (
            <div key={s.id} className={`p-5 rounded-2xl border transition-all ${s.is_active ? 'bg-white border-orange-100 shadow-sm' : 'bg-slate-50 border-slate-100 opacity-60'}`}>
              <div className="flex justify-between items-start mb-3">
                <span className={`text-[10px] font-black px-2.5 py-1 rounded-md uppercase tracking-widest ${s.meal_type === 'FREE' ? 'bg-emerald-50 text-emerald-600' : 'bg-orange-50 text-orange-600'}`}>
                  {s.meal_type}
                </span>
                <button onClick={() => toggleFood(s.id)} className={`p-2 rounded-lg transition-all ${s.is_active ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' : 'bg-slate-200 text-slate-500 hover:bg-slate-300'}`}>
                  <Power size={16} />
                </button>
              </div>
              <p className="font-bold text-slate-800 mb-1">{new Date(s.slot_date).toLocaleDateString("en-IN", { day: 'numeric', month: 'short', year: 'numeric' })}</p>
              <p className="text-sm font-bold text-slate-500 flex items-center gap-1.5"><Clock size={14}/> {s.start_time} - {s.end_time}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 3. ACCOMMODATION SECTION */}
      <section className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl"><Bed size={24} /></div>
          <h2 className="text-2xl font-heading font-bold text-slate-800">Guest House Inventory</h2>
        </div>
        
        {/* Acc Form */}
        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 mb-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 items-end">
            <div>
              <label className={labelStyle}>Property Name</label>
              <input placeholder="e.g. Jungle Cottage" value={accForm.name} className={inputStyle} onChange={(e) => setAccForm({ ...accForm, name: e.target.value })} />
            </div>
            <div>
              <label className={labelStyle}>Room Type</label>
              <select value={accForm.accommodation_type} className={inputStyle} onChange={(e) => setAccForm({ ...accForm, accommodation_type: e.target.value })}>
                  <option value="DORMITORY">Dormitory</option>
                  <option value="ROOM">Private Room</option>
                  <option value="COTTAGE">Cottage</option>
              </select>
            </div>
            <div>
              <label className={labelStyle}>Total Rooms</label>
              <input type="number" placeholder="Capacity" value={accForm.capacity} className={inputStyle} onChange={(e) => setAccForm({ ...accForm, capacity: e.target.value })} />
            </div>
            <div>
              <label className={labelStyle}>Price per Night</label>
              <div className="relative">
                <IndianRupee size={16} className="absolute left-3 top-3.5 text-slate-400" />
                <input type="number" placeholder="0.00" value={accForm.price_per_day} className={`${inputStyle} pl-9`} onChange={(e) => setAccForm({ ...accForm, price_per_day: e.target.value })} />
              </div>
            </div>
            <button onClick={createAccommodation} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white p-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 h-[50px] active:scale-95">
                <Plus size={18} /> Add
            </button>
        </div>

        {/* Acc List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {accommodations.map(acc => (
                <div key={acc.id} className="bg-white p-5 rounded-2xl border border-emerald-50 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-2">
                        <div>
                            <span className="text-[10px] font-black px-2.5 py-1 rounded-md uppercase tracking-widest bg-slate-100 text-slate-500 mb-2 inline-block">
                              {acc.accommodation_type}
                            </span>
                            <h3 className="font-heading font-bold text-xl text-slate-800">{acc.name}</h3>
                        </div>
                        <p className="text-emerald-600 font-black text-lg flex items-center">
                          <IndianRupee size={18} />{acc.price_per_day}
                        </p>
                    </div>
                    <div className="flex justify-between items-center mt-4 pt-4 border-t border-slate-50 text-sm font-bold text-slate-500">
                      <span>Total: {acc.capacity} Rooms</span>
                      <span className="text-emerald-500">{acc.availability_status || "Active"}</span>
                    </div>
                </div>
            ))}
            {accommodations.length === 0 && <p className="text-slate-400 italic col-span-full text-center py-4">No accommodations configured yet.</p>}
        </div>
      </section>
    </div>
  );
}