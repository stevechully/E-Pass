import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { checkAvailability, getAddons } from "../services/vazhipaduService";
import { getSpecialPoojaDates } from "../services/calendarService";
import axios from "axios";
import PaymentModal from "../components/PaymentModal";
import { Calendar as CalendarIcon, CheckCircle, AlertCircle, ArrowLeft, ArrowRight, ShieldCheck, Info } from "lucide-react";

const API = import.meta.env.VITE_API_URL;

const VazhipaduBooking = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [showPayment, setShowPayment] = useState(false);
  const [puja, setPuja] = useState(null);
  const [step, setStep] = useState(1);
  const [bookingDate, setBookingDate] = useState("");
  const [availability, setAvailability] = useState(null);
  const [loading, setLoading] = useState(false);
  const [availableDates, setAvailableDates] = useState([]);

  // Step 2 State
  const [addons, setAddons] = useState([]);
  const [selectedAddons, setSelectedAddons] = useState([]);
  const [ecoFee, setEcoFee] = useState(0);

  useEffect(() => {
    fetchPujaAndDates();
    fetchAddons();
  }, [id]);

  const fetchPujaAndDates = async () => {
    try {
      setLoading(true);
      // Fetch specific service details
      const res = await axios.get(`${API}/vazhipadu/services`);
      const selected = res.data.services.find((p) => p.id === id);
      setPuja(selected);
      
      // Handle URL-passed dates (deep-linking from Calendar page)
      const queryParams = new URLSearchParams(location.search);
      const preSelectedDate = queryParams.get("date");

      if (selected?.puja_type === "SPECIAL") {
        const year = new Date().getFullYear();
        const resDates = await getSpecialPoojaDates(id, year);
        const calendarDates = resDates.data || [];
        setAvailableDates(calendarDates);
        
        // If coming from calendar with a specific date, auto-trigger availability check
        if (preSelectedDate) {
           const dateExists = calendarDates.some(d => d.pooja_date === preSelectedDate);
           if (dateExists) handleDateChange(preSelectedDate);
        }
      } else if (preSelectedDate) {
          handleDateChange(preSelectedDate);
      }
    } catch (err) {
      console.error("Failed to fetch initial data:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAddons = async () => {
    try {
      const data = await getAddons();
      setAddons(data.addons || []);
    } catch (err) {
      console.error("Failed to fetch add-ons:", err);
    }
  };

  const handleDateChange = async (date) => {
    setBookingDate(date);
    setAvailability(null);
    if (!date) return;

    setLoading(true);
    try {
      const data = await checkAvailability({ puja_id: id, booking_date: date });
      setAvailability(data);
    } catch (err) {
      setAvailability({ error: err.response?.data?.message || "Date currently unavailable" });
    } finally {
      setLoading(false);
    }
  };

  const calculateTotal = () => {
    const addonTotal = selectedAddons.reduce((sum, addonId) => {
      const addon = addons.find(a => a.id === addonId);
      return sum + (addon?.price || 0);
    }, 0);
    return (puja?.price || 0) + addonTotal + Number(ecoFee);
  };

  if (!puja) return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center text-emerald-400">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-500 mb-4"></div>
      <p className="animate-pulse italic">Connecting to Temple Registry...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 md:p-10 relative font-sans">
      
      {/* 🧭 Header & Breadcrumb */}
      <div className="max-w-4xl mx-auto mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors mb-2 text-sm">
             <ArrowLeft size={16} /> Back to Offerings
           </button>
           <h1 className="text-3xl font-black text-white tracking-tight">{puja.puja_name}</h1>
           <p className="text-gray-400 text-sm mt-1">Divine Offering for {puja.puja_type === 'SPECIAL' ? 'Festival Occasions' : 'Daily Peace'}</p>
        </div>
        
        {/* Step Indicator */}
        <div className="flex items-center gap-3 bg-gray-800/50 p-2 rounded-2xl border border-gray-700/50 self-start">
          {[1, 2, 3].map((num) => (
            <div key={num} className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${step >= num ? "bg-emerald-600 text-white" : "bg-gray-700 text-gray-500"}`}>
              {num}
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-4xl mx-auto grid lg:grid-cols-3 gap-8">
        
        {/* 📋 Main Section */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* STEP 1: DATE SELECTION */}
          {step === 1 && (
            <div className="bg-gray-800 p-8 rounded-3xl border border-gray-700 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center gap-3 mb-8">
                <CalendarIcon className="text-emerald-500" />
                <h2 className="text-xl font-bold">Select Auspicious Date</h2>
              </div>

              {puja.puja_type === "SPECIAL" ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {availableDates.length > 0 ? (
                    availableDates.map((item) => (
                      <button
                        key={item.id}
                        disabled={item.available_slots <= 0}
                        onClick={() => handleDateChange(item.pooja_date)}
                        className={`group p-5 text-left rounded-2xl border transition-all relative overflow-hidden ${
                          bookingDate === item.pooja_date
                            ? "bg-emerald-600/10 border-emerald-500 ring-2 ring-emerald-500/20"
                            : "bg-gray-900/40 border-gray-700 hover:border-gray-500"
                        } ${item.available_slots <= 0 ? "opacity-30 grayscale cursor-not-allowed" : ""}`}
                      >
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-tighter mb-1">Upcoming Date</p>
                        <p className="text-lg font-black text-white">
                          {new Date(item.pooja_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </p>
                        <div className="mt-4 flex items-center justify-between">
                          <span className={`text-[10px] font-black uppercase px-2 py-1 rounded ${item.available_slots > 10 ? "bg-emerald-900/30 text-emerald-400" : "bg-orange-900/30 text-orange-400"}`}>
                            {item.available_slots > 0 ? `${item.available_slots} Slots` : "Sold Out"}
                          </span>
                          {bookingDate === item.pooja_date && <CheckCircle size={16} className="text-emerald-500" />}
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="col-span-2 py-10 text-center border border-dashed border-gray-700 rounded-2xl">
                       <p className="text-gray-500 italic">No scheduled calendar dates found for this pooja.</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="max-w-sm">
                  <input
                    type="date"
                    className="w-full p-5 rounded-2xl bg-gray-900/60 border border-gray-700 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all text-lg font-bold"
                    min={new Date().toISOString().split("T")[0]}
                    value={bookingDate}
                    onChange={(e) => handleDateChange(e.target.value)}
                  />
                  <p className="text-xs text-gray-500 mt-3 flex items-center gap-2">
                    <Info size={12} /> You can book this daily pooja for any upcoming day.
                  </p>
                </div>
              )}

              {availability?.remaining_slots >= 0 && (
                <div className="mt-8 flex items-center gap-3 p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
                  <CheckCircle className="text-emerald-500" size={20} />
                  <p className="text-sm font-medium text-emerald-100">Confirmed: Slots are currently available for the selected date.</p>
                </div>
              )}

              {availability?.error && (
                <div className="mt-8 flex items-center gap-3 p-4 bg-red-500/10 rounded-2xl border border-red-500/20">
                  <AlertCircle className="text-red-500" size={20} />
                  <p className="text-sm font-medium text-red-200">{availability.error}</p>
                </div>
              )}
            </div>
          )}

          {/* STEP 2: ADD-ONS */}
          {step === 2 && (
            <div className="bg-gray-800 p-8 rounded-3xl border border-gray-700 shadow-2xl animate-in fade-in slide-in-from-right-4 duration-500">
              <h2 className="text-xl font-bold mb-8">Personalize Your Offering</h2>
              <div className="grid gap-4">
                {addons.map(addon => (
                  <label
                    key={addon.id}
                    className={`flex justify-between items-center p-5 rounded-2xl cursor-pointer transition-all border ${
                      selectedAddons.includes(addon.id) ? "bg-emerald-600/10 border-emerald-500" : "bg-gray-900/40 border-gray-700 hover:border-gray-500"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${selectedAddons.includes(addon.id) ? "bg-emerald-600 border-emerald-600" : "border-gray-600"}`}>
                        {selectedAddons.includes(addon.id) && <CheckCircle size={14} className="text-white" />}
                      </div>
                      <input
                        type="checkbox"
                        className="hidden"
                        checked={selectedAddons.includes(addon.id)}
                        onChange={() => {
                          setSelectedAddons(prev => prev.includes(addon.id) ? prev.filter(id => id !== addon.id) : [...prev, addon.id]);
                        }}
                      />
                      <span className="font-bold text-gray-200">{addon.addon_name}</span>
                    </div>
                    <span className="text-emerald-400 font-black">₹{addon.price}</span>
                  </label>
                ))}
              </div>

              <div className="mt-10 pt-8 border-t border-gray-700/50">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-4">Support Temple Environment (Eco Fee)</label>
                <div className="relative max-w-xs">
                   <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">₹</span>
                   <input
                     type="number"
                     min="0"
                     value={ecoFee || ""}
                     placeholder="Optional Contribution"
                     onChange={(e) => setEcoFee(Number(e.target.value))}
                     className="w-full p-4 pl-10 rounded-2xl bg-gray-900/60 border border-gray-700 focus:border-emerald-500 focus:outline-none font-bold"
                   />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: REVIEW */}
          {step === 3 && (
            <div className="bg-gray-800 p-8 rounded-3xl border border-gray-700 shadow-2xl animate-in zoom-in-95 duration-300">
               <div className="flex items-center gap-3 mb-8">
                  <ShieldCheck className="text-emerald-500" size={24} />
                  <h2 className="text-xl font-bold text-white">Confirmation</h2>
               </div>
               
               <div className="bg-gray-900/60 p-6 rounded-2xl border border-gray-700 space-y-4">
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-400">Offering</span>
                    <span className="font-bold text-white">{puja.puja_name}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-t border-gray-800">
                    <span className="text-gray-400">Date</span>
                    <span className="font-bold text-white">{new Date(bookingDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
                  </div>
                  {selectedAddons.length > 0 && (
                    <div className="flex justify-between items-start py-2 border-t border-gray-800">
                      <span className="text-gray-400">Add-ons</span>
                      <div className="text-right">
                        {selectedAddons.map(id => <p key={id} className="text-xs font-bold text-emerald-400">{addons.find(a => a.id === id)?.addon_name}</p>)}
                      </div>
                    </div>
                  )}
               </div>

               <div className="mt-10 flex items-center gap-4 bg-emerald-500/5 p-6 rounded-3xl border border-emerald-500/10">
                  <div className="flex-1">
                     <p className="text-xs text-emerald-400 font-black uppercase tracking-widest">Total Secure Payment</p>
                     <p className="text-4xl font-black text-white">₹{calculateTotal()}</p>
                  </div>
                  <button onClick={() => setShowPayment(true)} className="px-8 py-5 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-2xl shadow-xl shadow-emerald-900/40 transition-all active:scale-95">
                    Pay Now
                  </button>
               </div>
            </div>
          )}
        </div>

        {/* 💳 Sidebar Summary */}
        <div className="space-y-6">
          <div className="bg-gray-800 p-6 rounded-3xl border border-gray-700 shadow-xl">
             <h3 className="text-sm font-black uppercase tracking-widest text-gray-500 mb-6">Booking Progress</h3>
             <div className="space-y-6">
                <div className={`flex items-center gap-3 ${step >= 1 && bookingDate ? 'text-emerald-400' : 'text-gray-600'}`}>
                   <div className={`w-2 h-2 rounded-full ${step >= 1 && bookingDate ? 'bg-emerald-500' : 'bg-gray-700'}`}></div>
                   <p className="text-sm font-bold">Selected Date</p>
                </div>
                <div className={`flex items-center gap-3 ${step >= 2 ? 'text-emerald-400' : 'text-gray-600'}`}>
                   <div className={`w-2 h-2 rounded-full ${step >= 2 ? 'bg-emerald-500' : 'bg-gray-700'}`}></div>
                   <p className="text-sm font-bold">Customizations</p>
                </div>
                <div className={`flex items-center gap-3 ${step >= 3 ? 'text-emerald-400' : 'text-gray-600'}`}>
                   <div className={`w-2 h-2 rounded-full ${step >= 3 ? 'bg-emerald-500' : 'bg-gray-700'}`}></div>
                   <p className="text-sm font-bold">Payment Ready</p>
                </div>
             </div>
          </div>

          <div className="flex flex-col gap-3">
            {step === 1 && (
               <button
                 disabled={!bookingDate || availability?.error || loading}
                 onClick={() => setStep(2)}
                 className="w-full py-5 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-2xl flex items-center justify-center gap-2 disabled:bg-gray-800 disabled:text-gray-600 transition-all"
               >
                 Next Step <ArrowRight size={18} />
               </button>
            )}
            {step === 2 && (
               <>
                 <button onClick={() => setStep(3)} className="w-full py-5 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-2xl flex items-center justify-center gap-2 transition-all">
                    Review Summary <ArrowRight size={18} />
                 </button>
                 <button onClick={() => setStep(1)} className="w-full py-4 text-gray-500 hover:text-white font-bold transition-colors">Go Back</button>
               </>
            )}
             {step === 3 && (
               <button onClick={() => setStep(2)} className="w-full py-4 text-gray-500 hover:text-white font-bold transition-colors">Change Details</button>
            )}
          </div>
        </div>
      </div>

      <PaymentModal
        isOpen={showPayment}
        onClose={() => setShowPayment(false)}
        puja={puja}
        bookingDate={bookingDate}
        selectedAddons={selectedAddons}
        ecoFee={ecoFee}
        totalAmount={calculateTotal()}
        onSuccess={(bookingId) => navigate(`/vazhipadu/success/${bookingId}`)}
      />
    </div>
  );
};

export default VazhipaduBooking;